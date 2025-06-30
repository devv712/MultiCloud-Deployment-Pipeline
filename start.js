const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

app.use(cors());
app.use(express.json());

// Sample DevOps data
const pipelines = [
  {
    id: '1',
    name: 'E-Commerce Platform',
    repository: 'github.com/company/ecommerce',
    branch: 'main',
    status: 'running',
    environments: ['staging', 'production'],
    createdAt: new Date('2025-06-29T10:00:00Z'),
    updatedAt: new Date('2025-06-29T17:30:00Z')
  },
  {
    id: '2', 
    name: 'Payment Service',
    repository: 'github.com/company/payment-service',
    branch: 'develop',
    status: 'success',
    environments: ['dev', 'staging', 'production'],
    createdAt: new Date('2025-06-29T09:00:00Z'),
    updatedAt: new Date('2025-06-29T16:45:00Z')
  }
];

const deployments = [
  {
    id: 'dep-1',
    runId: 'run-1',
    environment: 'production',
    cloudProvider: 'aws',
    cluster: 'prod-cluster-us-east-1',
    namespace: 'ecommerce',
    strategy: 'canary',
    status: 'running',
    version: 'v2.1.3',
    traffic: [
      {
        timestamp: new Date(),
        percentage: 25,
        status: 'progressing',
        metrics: {
          errorRate: 0.2,
          responseTime: 145,
          throughput: 1250,
          cpuUsage: 65,
          memoryUsage: 72
        }
      }
    ],
    startedAt: new Date('2025-06-29T17:00:00Z')
  }
];

const alerts = [
  {
    id: 'alert-1',
    deploymentId: 'dep-1',
    severity: 'warning',
    title: 'High Memory Usage',
    message: 'Memory usage exceeded 70% during canary deployment',
    status: 'active',
    createdAt: new Date('2025-06-29T17:15:00Z'),
    tags: ['memory', 'canary', 'production']
  }
];

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/pipelines', (req, res) => {
  res.json(pipelines);
});

app.get('/api/deployments', (req, res) => {
  res.json(deployments);
});

app.get('/api/alerts', (req, res) => {
  res.json(alerts);
});

// Canary deployment simulation
app.post('/api/deployments/:id/simulate-canary', (req, res) => {
  const deployment = deployments.find(d => d.id === req.params.id);
  if (!deployment) {
    return res.status(404).json({ error: 'Deployment not found' });
  }
  
  // Simulate canary progression
  const currentTraffic = deployment.traffic[deployment.traffic.length - 1];
  let nextPercentage = currentTraffic.percentage;
  
  if (nextPercentage < 100) {
    nextPercentage = Math.min(nextPercentage + 25, 100);
    
    const newTraffic = {
      timestamp: new Date(),
      percentage: nextPercentage,
      status: nextPercentage === 100 ? 'stable' : 'progressing',
      metrics: {
        errorRate: Math.random() * 0.5,
        responseTime: 120 + Math.random() * 50,
        throughput: 1000 + Math.random() * 500,
        cpuUsage: 50 + Math.random() * 30,
        memoryUsage: 60 + Math.random() * 25
      }
    };
    
    deployment.traffic.push(newTraffic);
    
    // Broadcast update via WebSocket
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type: 'canary-update',
          deploymentId: deployment.id,
          traffic: newTraffic
        }));
      }
    });
  }
  
  res.json(deployment);
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  ws.send(JSON.stringify({ 
    type: 'connected', 
    message: 'DevOps Dashboard WebSocket active',
    timestamp: new Date().toISOString()
  }));
  
  // Send periodic updates
  const interval = setInterval(() => {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({
        type: 'metrics-update',
        data: {
          timestamp: new Date().toISOString(),
          activeDeployments: deployments.filter(d => d.status === 'running').length,
          activeAlerts: alerts.filter(a => a.status === 'active').length,
          systemHealth: Math.random() > 0.1 ? 'healthy' : 'degraded'
        }
      }));
    }
  }, 10000);
  
  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });
});

const PORT = 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`DevOps Pipeline Dashboard running on port ${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
  console.log(`API endpoints:`);
  console.log(`  - GET /api/health`);
  console.log(`  - GET /api/pipelines`);
  console.log(`  - GET /api/deployments`);
  console.log(`  - GET /api/alerts`);
  console.log(`  - POST /api/deployments/:id/simulate-canary`);
});