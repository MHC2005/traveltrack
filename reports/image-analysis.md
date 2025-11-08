# Análisis de imagen Docker – TravelTrack

**Imagen analizada:** traveltrack:1.0.0  
**Base:** node:18-alpine  
**Herramienta:** Dive (Windows)  
**Fecha:** 2025-11-08  

## Composición general
- **Tamaño total:** 141 MB  
- **Número de capas:** 8  
- **Eficiencia:** 99%  
- **Espacio desperdiciado:** 81 KB

## Observaciones
- La imagen utiliza `node:18-alpine` como base, optimizada para producción.  
- El multistage build (`builder` → `runtime`) mantiene el tamaño bajo y elimina dependencias innecesarias.  
- No se detectan capas redundantes ni archivos innecesarios.  
- La estructura de capas refleja buenas prácticas (COPY selectivo, USER no root, HEALTHCHECK).  
- Como mejora menor, podría limpiarse la caché de npm tras la instalación (`npm cache clean --force`).

## Conclusión
La imagen presenta una composición altamente eficiente (99%), con un tamaño reducido y sin capas duplicadas.  
Cumple las buenas prácticas de seguridad y optimización Docker recomendadas.
