import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import { MemStorage } from "./storage";
import { 
  insertPipelineSchema, 
  insertDeploymentSchema, 
  insertAlertSchema,
  pipelineRunSchema,
  PipelineStatus
} from "../shared/schema";
import { Server } from "http";

const storage = new MemStorage();

export function createRoutes(app: any, httpServer: Server) {
  // WebSocket setup for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to WebSocket');
    
    // Send initial data
    ws.send(JSON.stringify({ 
      type: 'connected',
      message: 'Real-time monitoring active'
    }));

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  // Broadcast function for real-time updates
  const broadcast = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // Pipeline routes
  app.get('/api/pipelines', async (req, res) => {
    try {
      const pipelines = await storage.getPipelines();
      res.json(pipelines);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch pipelines' });
    }
  });

  app.get('/api/pipelines/:id', async (req, res) => {
    try {
      const pipeline = await storage.getPipeline(req.params.id);
      if (!pipeline) {
        return res.status(404).json({ error: 'Pipeline not found' });
      }
      res.json(pipeline);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch pipeline' });
    }
  });

  app.post('/api/pipelines', async (req, res) => {
    try {
      const validatedData = insertPipelineSchema.parse(req.body);
      const pipeline = await storage.createPipeline(validatedData);
      
      // Broadcast new pipeline
      broadcast({
        type: 'pipeline_created',
        data: pipeline
      });
      
      res.status(201).json(pipeline);
    } catch (error) {
      res.status(400).json({ error: 'Invalid pipeline data' });
    }
  });

  app.patch('/api/pipelines/:id', async (req, res) => {
    try {
      const pipeline = await storage.updatePipeline(req.params.id, req.body);
      
      // Broadcast pipeline update
      broadcast({
        type: 'pipeline_updated',
        data: pipeline
      });
      
      res.json(pipeline);
    } catch (error) {
      res.status(404).json({ error: 'Pipeline not found' });
    }
  });

  app.delete('/api/pipelines/:id', async (req, res) => {
    try {
      await storage.deletePipeline(req.params.id);
      
      // Broadcast pipeline deletion
      broadcast({
        type: 'pipeline_deleted',
        id: req.params.id
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: 'Pipeline not found' });
    }
  });

  // Pipeline runs routes
  app.get('/api/pipeline-runs', async (req, res) => {
    try {
      const pipelineId = req.query.pipelineId as string;
      const runs = await storage.getPipelineRuns(pipelineId);
      res.json(runs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch pipeline runs' });
    }
  });

  app.get('/api/pipeline-runs/:id', async (req, res) => {
    try {
      const run = await storage.getPipelineRun(req.params.id);
      if (!run) {
        return res.status(404).json({ error: 'Pipeline run not found' });
      }
      res.json(run);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch pipeline run' });
    }
  });

  app.post('/api/pipeline-runs', async (req, res) => {
    try {
      const run = await storage.createPipelineRun(req.body);
      
      // Broadcast new run
      broadcast({
        type: 'pipeline_run_created',
        data: run
      });
      
      res.status(201).json(run);
    } catch (error) {
      res.status(400).json({ error: 'Invalid pipeline run data' });
    }
  });

  app.patch('/api/pipeline-runs/:id', async (req, res) => {
    try {
      const run = await storage.updatePipelineRun(req.params.id, req.body);
      
      // Broadcast run update
      broadcast({
        type: 'pipeline_run_updated',
        data: run
      });
      
      res.json(run);
    } catch (error) {
      res.status(404).json({ error: 'Pipeline run not found' });
    }
  });

  // Deployment routes
  app.get('/api/deployments', async (req, res) => {
    try {
      const runId = req.query.runId as string;
      const deployments = await storage.getDeployments(runId);
      res.json(deployments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch deployments' });
    }
  });

  app.get('/api/deployments/:id', async (req, res) => {
    try {
      const deployment = await storage.getDeployment(req.params.id);
      if (!deployment) {
        return res.status(404).json({ error: 'Deployment not found' });
      }
      res.json(deployment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch deployment' });
    }
  });

  app.post('/api/deployments', async (req, res) => {
    try {
      const validatedData = insertDeploymentSchema.parse(req.body);
      const deployment = await storage.createDeployment(validatedData);
      
      // Broadcast new deployment
      broadcast({
        type: 'deployment_created',
        data: deployment
      });
      
      res.status(201).json(deployment);
    } catch (error) {
      res.status(400).json({ error: 'Invalid deployment data' });
    }
  });

  app.patch('/api/deployments/:id', async (req, res) => {
    try {
      const deployment = await storage.updateDeployment(req.params.id, req.body);
      
      // Broadcast deployment update
      broadcast({
        type: 'deployment_updated',
        data: deployment
      });
      
      res.json(deployment);
    } catch (error) {
      res.status(404).json({ error: 'Deployment not found' });
    }
  });

  // Canary traffic routes
  app.get('/api/deployments/:id/canary-traffic', async (req, res) => {
    try {
      const traffic = await storage.getCanaryTraffic(req.params.id);
      res.json(traffic);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch canary traffic' });
    }
  });

  app.post('/api/deployments/:id/canary-traffic', async (req, res) => {
    try {
      const traffic = await storage.addCanaryTraffic(req.params.id, req.body);
      
      // Broadcast canary update
      broadcast({
        type: 'canary_traffic_updated',
        deploymentId: req.params.id,
        data: traffic
      });
      
      res.status(201).json(traffic);
    } catch (error) {
      res.status(400).json({ error: 'Invalid canary traffic data' });
    }
  });

  // Health check routes
  app.get('/api/deployments/:id/health-checks', async (req, res) => {
    try {
      const checks = await storage.getHealthChecks(req.params.id);
      res.json(checks);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch health checks' });
    }
  });

  app.post('/api/deployments/:id/health-checks', async (req, res) => {
    try {
      const check = await storage.addHealthCheck({
        ...req.body,
        deploymentId: req.params.id
      });
      
      // Broadcast health check update
      broadcast({
        type: 'health_check_updated',
        deploymentId: req.params.id,
        data: check
      });
      
      res.status(201).json(check);
    } catch (error) {
      res.status(400).json({ error: 'Invalid health check data' });
    }
  });

  // Alert routes
  app.get('/api/alerts', async (req, res) => {
    try {
      const status = req.query.status as string;
      const alerts = await storage.getAlerts(status);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  });

  app.get('/api/alerts/:id', async (req, res) => {
    try {
      const alert = await storage.getAlert(req.params.id);
      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch alert' });
    }
  });

  app.post('/api/alerts', async (req, res) => {
    try {
      const validatedData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(validatedData);
      
      // Broadcast new alert
      broadcast({
        type: 'alert_created',
        data: alert
      });
      
      res.status(201).json(alert);
    } catch (error) {
      res.status(400).json({ error: 'Invalid alert data' });
    }
  });

  app.patch('/api/alerts/:id', async (req, res) => {
    try {
      const alert = await storage.updateAlert(req.params.id, req.body);
      
      // Broadcast alert update
      broadcast({
        type: 'alert_updated',
        data: alert
      });
      
      res.json(alert);
    } catch (error) {
      res.status(404).json({ error: 'Alert not found' });
    }
  });

  app.delete('/api/alerts/:id', async (req, res) => {
    try {
      await storage.deleteAlert(req.params.id);
      
      // Broadcast alert deletion
      broadcast({
        type: 'alert_deleted',
        id: req.params.id
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: 'Alert not found' });
    }
  });

  // Metrics routes
  app.get('/api/deployments/:id/metrics', async (req, res) => {
    try {
      const { start, end } = req.query;
      const timeframe = start && end ? {
        start: new Date(start as string),
        end: new Date(end as string)
      } : undefined;
      
      const metrics = await storage.getMetrics(req.params.id, timeframe);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  });

  app.post('/api/deployments/:id/metrics', async (req, res) => {
    try {
      const metrics = await storage.addMetrics({
        ...req.body,
        deploymentId: req.params.id
      });
      
      // Broadcast metrics update
      broadcast({
        type: 'metrics_updated',
        deploymentId: req.params.id,
        data: metrics
      });
      
      res.status(201).json(metrics);
    } catch (error) {
      res.status(400).json({ error: 'Invalid metrics data' });
    }
  });

  // Infrastructure routes
  app.get('/api/infrastructure', async (req, res) => {
    try {
      const infrastructure = await storage.getInfrastructure();
      res.json(infrastructure);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch infrastructure' });
    }
  });

  app.get('/api/infrastructure/:id', async (req, res) => {
    try {
      const item = await storage.getInfrastructureItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Infrastructure item not found' });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch infrastructure item' });
    }
  });

  app.patch('/api/infrastructure/:id', async (req, res) => {
    try {
      const item = await storage.updateInfrastructure(req.params.id, req.body);
      
      // Broadcast infrastructure update
      broadcast({
        type: 'infrastructure_updated',
        data: item
      });
      
      res.json(item);
    } catch (error) {
      res.status(404).json({ error: 'Infrastructure item not found' });
    }
  });

  // Rollback route
  app.post('/api/deployments/:id/rollback', async (req, res) => {
    try {
      const deployment = await storage.getDeployment(req.params.id);
      if (!deployment) {
        return res.status(404).json({ error: 'Deployment not found' });
      }

      const updatedDeployment = await storage.updateDeployment(req.params.id, {
        status: 'failed',
        completedAt: new Date()
      });

      // Create rollback alert
      await storage.createAlert({
        deploymentId: req.params.id,
        severity: 'critical',
        title: 'Deployment Rolled Back',
        message: `Deployment ${deployment.version} was rolled back due to health check failures`,
        status: 'active',
        tags: ['rollback', 'deployment', deployment.environment]
      });

      // Broadcast rollback
      broadcast({
        type: 'deployment_rollback',
        data: updatedDeployment
      });

      res.json({ message: 'Deployment rolled back successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to rollback deployment' });
    }
  });

  // Simulate canary progression
  app.post('/api/deployments/:id/simulate-canary', async (req, res) => {
    try {
      const deployment = await storage.getDeployment(req.params.id);
      if (!deployment) {
        return res.status(404).json({ error: 'Deployment not found' });
      }

      // Simulate canary progression stages
      const stages = [10, 25, 50, 75, 100];
      
      for (const percentage of stages) {
        setTimeout(async () => {
          const metrics = {
            errorRate: Math.random() * 5, // 0-5% error rate
            responseTime: 150 + Math.random() * 100, // 150-250ms
            throughput: 1000 + Math.random() * 500, // 1000-1500 req/s
            cpuUsage: 30 + Math.random() * 40, // 30-70%
            memoryUsage: 40 + Math.random() * 30 // 40-70%
          };

          await storage.addCanaryTraffic(req.params.id, {
            percentage,
            status: metrics.errorRate > 3 ? 'failed' : 'stable',
            metrics
          });

          // If error rate is too high, trigger rollback
          if (metrics.errorRate > 3) {
            await storage.updateDeployment(req.params.id, {
              status: 'failed'
            });

            await storage.createAlert({
              deploymentId: req.params.id,
              severity: 'critical',
              title: 'Canary Deployment Failed',
              message: `High error rate detected: ${metrics.errorRate.toFixed(2)}%`,
              status: 'active',
              tags: ['canary', 'failure', 'auto-rollback']
            });

            broadcast({
              type: 'canary_failed',
              deploymentId: req.params.id,
              data: { percentage, metrics }
            });
            return;
          }

          broadcast({
            type: 'canary_progressed',
            deploymentId: req.params.id,
            data: { percentage, metrics }
          });

          // Complete deployment at 100%
          if (percentage === 100) {
            await storage.updateDeployment(req.params.id, {
              status: 'success',
              completedAt: new Date()
            });

            broadcast({
              type: 'deployment_completed',
              data: await storage.getDeployment(req.params.id)
            });
          }
        }, (stages.indexOf(percentage)) * 3000); // 3 second intervals
      }

      res.json({ message: 'Canary simulation started' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to simulate canary deployment' });
    }
  });
}