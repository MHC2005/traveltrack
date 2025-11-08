TravelTrack API
===============

Microservicio HTTP en Node.js 18 que gestiona solicitudes de viajes corporativos. Expone endpoints REST protegidos con Helmet y se entrega mediante Docker y Helm para Kubernetes.

Requisitos previos
------------------

- Node.js 18+ y npm.
- Docker Engine (o Docker Desktop).
- Kubernetes local (Minikube recomendado) y `kubectl`.
- Helm 3 (`winget install Helm.Helm` en Windows, `brew install helm` en macOS).
- Postman (opcional) para usar la colección compartida: <https://poseagus15-5718737.postman.co/workspace/Agustin-Pose's-Workspace~05cb38f6-23ba-46d3-87d5-9375f6de3ff1/collection/48467642-a8c84285-009c-4613-a0f1-6ccec2c01568?action=share&creator=48467642&active-environment=48467642-c541f002-3928-4297-b434-3a18f66db63f>

Variables de entorno
--------------------

| Variable      | Default | Descripcion                       |
|---------------|---------|-----------------------------------|
| APP_VERSION   | 1.0.0   | Version publicada del servicio.   |
| APP_ENV       | dev     | Entorno logico (dev, prod, etc.). |
| APP_MODE      | api     | Modo/rol de ejecucion.            |
| PORT          | 3000    | Puerto HTTP expuesto.             |

Ejemplo `.env`:

```
APP_VERSION=1.0.0
APP_ENV=dev
APP_MODE=api
PORT=3000
```

Ejecutar localmente
-------------------

Windows (PowerShell):

```powershell
npm install
npm start
```

macOS / Linux:

```bash
npm install
npm start
```

El servicio queda disponible en `http://localhost:3000` y registra cada request en consola.

Usar Postman
-----------------

1. Importa la coleccion usando el enlace anterior.
2. Crea un environment con `baseUrl = http://localhost:3000`.
3. Ejecuta las requests en orden: Health -> Create -> List -> Approve -> Version.

Construir la imagen Docker
--------------------------

Windows (PowerShell):

```powershell
docker build --build-arg APP_VERSION=1.0.0 -t traveltrack-api:v1.0 .
docker run -p 3000:3000 --env-file .env traveltrack-api:v1.0
```

macOS:

```bash
docker build --build-arg APP_VERSION=1.0.0 -t traveltrack-api:v1.0 .
docker run -p 3000:3000 --env-file .env traveltrack-api:v1.0
```

La imagen final usa usuario `node`, expone el puerto 3000 y posee HEALTHCHECK sobre `/health`.

Preparar imagen para Minikube
-----------------------------

1. Inicia Minikube (`minikube start` en Windows o macOS).
2. Construye dentro del daemon de Minikube o carga la imagen:
   - Windows PowerShell:
     ```powershell
     & minikube -p minikube docker-env --shell powershell | Invoke-Expression
     docker build --build-arg APP_VERSION=1.0.0 -t traveltrack-api:v1.0 .
     ```
   - macOS / Linux:
     ```bash
     eval $(minikube docker-env)
     docker build --build-arg APP_VERSION=1.0.0 -t traveltrack-api:v1.0 .
     ```
   - Alternativa: `minikube image load traveltrack-api:v1.0`.

Despliegue Helm
---------------

```bash
helm install traveltrack ./helm -n traveltrack --create-namespace
```

Actualizar y eliminar:

```bash
helm upgrade traveltrack ./helm -n traveltrack
helm uninstall traveltrack -n traveltrack
kubectl delete namespace traveltrack
```

Verificar deployment
--------------------

```bash
kubectl get pods -n traveltrack
kubectl logs deployment/traveltrack -n traveltrack
kubectl get configmap traveltrack-config -n traveltrack -o yaml
kubectl port-forward svc/traveltrack 3000:3000 -n traveltrack
```

Con el port-forward activo, reutiliza la coleccion Postman o curl contra `http://localhost:3000`.

Endpoints
---------

| Metodo | Ruta                               | Descripcion                        |
|--------|------------------------------------|------------------------------------|
| GET    | /health                            | Estado basico del servicio.        |
| GET    | /api/version                       | Version + entorno + modo actual.   |
| POST   | /api/travel-requests               | Crea una solicitud de viaje.       |
| GET    | /api/travel-requests               | Lista solicitudes en memoria.      |
| PATCH  | /api/travel-requests/:id/approve   | Marca una solicitud como aprobada. |

Notas
-----

- El almacenamiento es en memoria (se pierde al reiniciar).
- Las configuraciones provienen de variables de entorno/ConfigMap.
- Roadmap sugerido: agregar pruebas automatizadas, autenticacion/autorizacion y observabilidad avanzada.


## Seguridad DevSecOps

Durante el desarrollo se aplicaron varias herramientas de seguridad, cubriendo tanto el código, como la imagen Docker, los manifiestos de Kubernetes y la ejecución en tiempo real del servicio.  
Todo lo generado se guarda dentro de la carpeta `/reports`.

| Etapa | Herramienta | Qué hace | Archivo / evidencia |
|--------|-------------|----------|----------------------|
| **Dependencias** | `npm audit` | Escanea los paquetes instalados y muestra vulnerabilidades conocidas. | `reports/npm-audit.txt` |
| **Código fuente (SAST)** | `Semgrep` | Revisa el código buscando malas prácticas o patrones inseguros. | `reports/semgrep.json` |
| **Imagen Docker (SCA)** | `Trivy` | Escanea la imagen para detectar CVEs en las capas del sistema y dependencias. | `reports/trivy-report.json` |
| **Optimización de imagen** | `Dive` | Muestra tamaño, capas y posibles mejoras de la imagen final. | `reports/image-analysis.md` |
| **Políticas en Kubernetes** | `Kyverno` | Aplica reglas que bloquean imágenes con `latest`, contenedores root y pods sin límites de recursos. | `k8s/policies/*.yaml` |
| **Validación de manifiestos** | `KubeLinter` | Analiza los YAML y sugiere configuraciones seguras o buenas prácticas. | `reports/kubelinter.txt` |
| **Tiempo de ejecución (RASP)** | `Falco` | Monitorea el cluster en tiempo real y detecta acciones sospechosas. Por ejemplo, abrir una shell dentro de un contenedor. | `reports/falco-event.log` |


Desarrollado por Mateo Hernández y Agustín Pose