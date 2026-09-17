import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { calculateTotal, createOrder, applyDiscount} from './controllers/orderController.js';
import { triggerCpuBurn } from './controllers/metricsController.js';

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. In-Memory Ring Buffer for Autonomous Log Tracing ---
const serverLogRingBuffer = [];
const originalConsoleError = console.error;

console.error = (...args) => {
  serverLogRingBuffer.push(`[${new Date().toISOString()}] ${args.join(" ")}`);
  if (serverLogRingBuffer.length > 50) serverLogRingBuffer.shift(); // Retain latest 50 logs
  originalConsoleError.apply(console, args);
};

// Diagnostic Health Probe (Target for Network Tool)
app.get('/health', (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});

// --- 2. Autonomous Log Endpoint for the Agent ---
app.get('/api/debug/logs', (req, res) => {
  return res.json({
    status: "SUCCESS",
    count: serverLogRingBuffer.length,
    logs: serverLogRingBuffer.join("\n")
  });
});

// Buggy Routes
app.post('/api/orders/calculate', calculateTotal);
app.post('/api/orders/create', createOrder);
app.get('/api/debug/cpu-burn', triggerCpuBurn);

app.get('/api/debug/force-crash', (req, res) => {
  try {
    // Deliberate throw to test log ingestion
    throw new Error("CRITICAL_DATABASE_TIMEOUT: Invariant connection pool reset failure on replica shard-01");
  } catch (err) {
    console.error(err.stack || err.message);
    return res.status(500).json({ error: "Internal Server Crash", message: err.message });
  }
});

app.post('/api/orders/discount', applyDiscount);

// Start In-Memory MongoDB & Express Server
const PORT = 5050;
const startServer = async () => {
  try {
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { maxPoolSize: 2 }); // Small connection pool[cite: 1]
    console.log(`[Database] In-memory MongoDB connected: ${uri}`);

    app.listen(PORT, () => {
      console.log(`[Server] Faulty MERN backend listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to boot server:", err);
  }
};

startServer();