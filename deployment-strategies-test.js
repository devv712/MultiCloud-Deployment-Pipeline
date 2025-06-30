const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

app.use(cors());
app.use(express.json());

// Advanced deployment strategies data
const deployments = [
  {
    id: 'canary-dep',
    strategy: 'canary',
    environment: 'production',
    cloudProvider: 'aws',
    version: 'v2.1.4',
    status: 'ready',
    traffic: [{ timestamp: new Date().toISOString(), percentage: 25, status: 'ready' }]
  },
  {
    id: 'bluegreen-dep',
    strategy: 'blue-green',
    environment: 'staging',
    cloudProvider: 'gcp',
    version: 'v1.8.4',
    status: 'ready',
    blueGreenState: {
      blueEnvironment: { version: 'v1.8.3', status: 'active', traffic: 100 },
      greenEnvironment: { version: 'v1.8.4', status: 'ready', traffic: 0 }
    }
  },
  {
    id: 'rolling-dep',
    strategy: 'rolling',
    environment: 'production',
    cloudProvider: 'azure',
    version: 'v3.2.2',
    status: 'running',
    rollingState: {
      totalPods: 8,
      updatedPods: 3,
      readyPods: 2,
      maxUnavailable: 2,
      maxSurge: 2
    }
  }
];

app.get('/api/deployments', (req, res) => res.json(deployments));

// Canary progression
app.post('/api/deployments/:id/simulate-canary', (req, res) => {
  const dep = deployments.find(d => d.id === req.params.id);
  if (!dep || dep.strategy !== 'canary') {
    return res.status(400).json({ error: 'Invalid canary deployment' });
  }
  
  const current = dep.traffic[dep.traffic.length - 1].percentage;
  const next = current >= 75 ? 100 : current + 25;
  
  dep.traffic.push({
    timestamp: new Date().toISOString(),
    percentage: next,
    status: next === 100 ? 'stable' : 'progressing'
  });
  
  if (next === 100) dep.status = 'success';
  
  console.log(`Canary: ${current}% → ${next}%`);
  res.json(dep);
});

// Blue-green switching
app.post('/api/deployments/:id/simulate-blue-green', (req, res) => {
  const dep = deployments.find(d => d.id === req.params.id);
  if (!dep || dep.strategy !== 'blue-green') {
    return res.status(400).json({ error: 'Invalid blue-green deployment' });
  }
  
  const { action } = req.body;
  
  if (action === 'test') {
    const healthy = Math.random() > 0.3;
    dep.blueGreenState.greenEnvironment.status = healthy ? 'ready' : 'failed';
    dep.status = healthy ? 'ready' : 'failed';
    console.log(`Blue-Green Test: ${healthy ? 'PASS' : 'FAIL'}`);
  } else if (action === 'switch' && dep.blueGreenState.greenEnvironment.status === 'ready') {
    dep.blueGreenState.blueEnvironment.traffic = 0;
    dep.blueGreenState.greenEnvironment.traffic = 100;
    dep.blueGreenState.blueEnvironment.status = 'inactive';
    dep.blueGreenState.greenEnvironment.status = 'active';
    dep.status = 'success';
    console.log('Blue-Green Switch: Green environment active');
  }
  
  res.json(dep);
});

// Rolling update
app.post('/api/deployments/:id/simulate-rolling', (req, res) => {
  const dep = deployments.find(d => d.id === req.params.id);
  if (!dep || dep.strategy !== 'rolling') {
    return res.status(400).json({ error: 'Invalid rolling deployment' });
  }
  
  const state = dep.rollingState;
  if (state.updatedPods < state.totalPods) {
    const toUpdate = Math.min(state.maxSurge, state.totalPods - state.updatedPods);
    state.updatedPods += toUpdate;
    state.readyPods = Math.min(state.updatedPods, state.readyPods + toUpdate);
    
    if (state.updatedPods === state.totalPods) {
      state.readyPods = state.totalPods;
      dep.status = 'success';
    }
    
    console.log(`Rolling: ${state.updatedPods}/${state.totalPods} pods`);
  }
  
  res.json(dep);
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Advanced Deployment Strategies Server running on port ${PORT}`);
  console.log('Available strategies: Canary, Blue-Green, Rolling');
  
  // Demonstrate all three strategies
  setTimeout(async () => {
    console.log('\n=== Demonstrating Advanced Deployment Strategies ===');
    
    // 1. Canary deployment progression
    console.log('\n1. Canary Deployment (25% → 50% → 75% → 100%):');
    const canary = deployments.find(d => d.strategy === 'canary');
    for (let i = 0; i < 3; i++) {
      const current = canary.traffic[canary.traffic.length - 1].percentage;
      const next = current >= 75 ? 100 : current + 25;
      canary.traffic.push({
        timestamp: new Date().toISOString(),
        percentage: next,
        status: next === 100 ? 'stable' : 'progressing'
      });
      console.log(`   Step ${i + 1}: ${current}% → ${next}% traffic`);
      if (next === 100) {
        canary.status = 'success';
        console.log('   Canary deployment completed');
        break;
      }
    }
    
    // 2. Blue-green deployment
    console.log('\n2. Blue-Green Deployment:');
    const blueGreen = deployments.find(d => d.strategy === 'blue-green');
    console.log(`   Testing green environment (${blueGreen.blueGreenState.greenEnvironment.version})...`);
    const testPassed = Math.random() > 0.2;
    blueGreen.blueGreenState.greenEnvironment.status = testPassed ? 'ready' : 'failed';
    
    if (testPassed) {
      console.log('   Health checks passed - switching traffic');
      blueGreen.blueGreenState.blueEnvironment.traffic = 0;
      blueGreen.blueGreenState.greenEnvironment.traffic = 100;
      blueGreen.blueGreenState.blueEnvironment.status = 'inactive';
      blueGreen.blueGreenState.greenEnvironment.status = 'active';
      blueGreen.status = 'success';
      console.log('   Traffic switched to green environment');
    } else {
      console.log('   Health checks failed - maintaining blue environment');
    }
    
    // 3. Rolling deployment
    console.log('\n3. Rolling Deployment:');
    const rolling = deployments.find(d => d.strategy === 'rolling');
    const state = rolling.rollingState;
    
    while (state.updatedPods < state.totalPods) {
      const toUpdate = Math.min(state.maxSurge, state.totalPods - state.updatedPods);
      state.updatedPods += toUpdate;
      state.readyPods = Math.min(state.updatedPods, state.readyPods + toUpdate);
      
      console.log(`   Progress: ${state.updatedPods}/${state.totalPods} pods updated`);
      
      if (state.updatedPods === state.totalPods) {
        state.readyPods = state.totalPods;
        rolling.status = 'success';
        console.log('   Rolling deployment completed');
        break;
      }
    }
    
    console.log('\n=== All deployment strategies demonstrated successfully ===');
    console.log('✓ Canary: Progressive traffic routing with health monitoring');
    console.log('✓ Blue-Green: Zero-downtime environment switching');
    console.log('✓ Rolling: Gradual pod-by-pod updates with availability controls');
    
  }, 1000);
});