require('dotenv').config();
const APP_VERSION = process.env.APP_VERSION || '1.0.0';
const APP_ENV = process.env.APP_ENV || 'dev';
const APP_MODE = process.env.APP_MODE || 'api';
const PORT = Number(process.env.PORT) || 3000;

const express = require('express');
const helmet = require('helmet');

const app = express();
app.use(helmet());
app.use(express.json());
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

let seq = 1;
const requests = [];

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/api/travel-requests', (req, res) => {
  const { employee, destination, days } = req.body || {};
  if (!employee || !destination || typeof days !== 'number') {
    return res.status(400).json({ error: 'employee, destination, days (number) son requeridos' });
  }
  const item = { id: seq++, employee, destination, days, approved: false, createdAt: new Date().toISOString() };
  requests.push(item);
  res.status(201).json(item);
});

app.get('/api/travel-requests', (_req, res) => res.json(requests));

app.patch('/api/travel-requests/:id/approve', (req, res) => {
  const id = Number(req.params.id);
  const item = requests.find(r => r.id === id);
  if (!item) return res.status(404).json({ error: 'not found' });
  item.approved = true;
  item.approvedAt = new Date().toISOString();
  res.json(item);
});

app.get('/api/version', (_req, res) => {
  res.json({ version: APP_VERSION,
              environment: APP_ENV,
              mode: APP_MODE,
  });
});

app.listen(PORT, () => {
  console.log(`TravelTrack API v${APP_VERSION} (${APP_ENV}/${APP_MODE}) escuchando en puerto ${PORT}`);
});