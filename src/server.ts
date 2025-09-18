import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import userManagementRoutes from './api/userManagementApi.ts';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', userManagementRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
});

export default app;
