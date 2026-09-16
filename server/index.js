import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { calculateTotal, createOrder } from './controllers/orderController.js';
import { triggerCpuBurn } from './controllers/metricsController.js';

const app = express();
app.use(cors());
app.use(express.json());

// Diagnostic Health Probe (Target for Network Tool)
app.get('/health', (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});

// Buggy Routes
app.post('/api/orders/calculate', calculateTotal);
app.post('/api/orders/create', createOrder);
app.get('/api/debug/cpu-burn', triggerCpuBurn);

// Start In-Memory MongoDB & Express Server
const PORT = 5050;
const startServer = async () => {
  try {
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { maxPoolSize: 2 }); // Small connection pool
    console.log(`[Database] In-memory MongoDB connected: ${uri}`);

    app.listen(PORT, () => {
      console.log(`[Server] Faulty MERN backend listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to boot server:", err);
  }
};

startServer();