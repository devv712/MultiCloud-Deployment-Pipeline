import express from "express";
import cors from "cors";
import { createServer } from "http";
import { createRoutes } from "./routes";

const PORT = process.env.PORT || 3000;

// Create Express app
const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
createRoutes(app, httpServer);

// Start server
httpServer.listen(PORT, () => {
  console.log(`DevOps Pipeline Dashboard running on port ${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
});

export default app;