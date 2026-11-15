import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from '../api/routes.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api', apiRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'lld-practice-platform-api', timestamp: new Date().toISOString() });
});

export const server = app.listen(PORT, () => {
  console.log(`[LLD Platform Server] Running on http://localhost:${PORT}`);
  console.log(`[LLD Platform Server] API endpoints available at http://localhost:${PORT}/api`);
});

export default app;
