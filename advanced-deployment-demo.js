const http = require('http');

// Test function to make HTTP requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => req.destroy());
    
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function demonstrateAdvancedDeploymentStrategies() {
  console.log('=== Advanced Deployment Strategies Demo ===\n');
  
  const baseUrl = 'localhost';
  const port = 3000;
  
  try {
    // Get current deployments
    console.log('📋 Checking available deployment strategies...');
    const deployments = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/api/deployments',
      method: 'GET'
    });
    
    if (deployments.status !== 200) {
      console.log('❌ Failed to connect to deployment service');
      return;
    }
    
    const canaryDep = deployments.data.find(d => d.strategy === 'canary');
    const blueGreenDep = deployments.data.find(d => d.strategy === 'blue-green');
    const rollingDep = deployments.data.find(d => d.strategy === 'rolling');
    
    console.log(`   Found ${deployments.data.length} active deployments`);
    console.log(`   - Canary: ${canaryDep ? canaryDep.id : 'None'}`);
    console.log(`   - Blue-Green: ${blueGreenDep ? blueGreenDep.id : 'None'}`);
    console.log(`   - Rolling: ${rollingDep ? rollingDep.id : 'None'}`);
    
    // 1. Blue-Green Deployment Demo
    if (blueGreenDep) {
      console.log('\n🔵🟢 Blue-Green Deployment Simulation');
      console.log('=====================================');
      
      console.log(`Deployment: ${blueGreenDep.id} (${blueGreenDep.namespace})`);
      console.log(`Blue Environment: ${blueGreenDep.blueGreenState.blueEnvironment.version} (${blueGreenDep.blueGreenState.blueEnvironment.status})`);
      console.log(`Green Environment: ${blueGreenDep.blueGreenState.greenEnvironment.version} (${blueGreenDep.blueGreenState.greenEnvironment.status})`);
      
      // Test green environment
      console.log('\nStep 1: Testing green environment...');
      const testResult = await makeRequest({
        hostname: baseUrl,
        port: port,
        path: `/api/deployments/${blueGreenDep.id}/simulate-blue-green`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { action: 'test' });
      
      if (testResult.status === 200) {
        console.log(`   Health Check Results:`);
        console.log(`   - Status: ${testResult.data.blueGreenState.greenEnvironment.status}`);
        console.log(`   - Response Time: ${Math.round(testResult.data.traffic[testResult.data.traffic.length - 1].metrics.responseTime)}ms`);
        console.log(`   - Error Rate: ${testResult.data.traffic[testResult.data.traffic.length - 1].metrics.errorRate.toFixed(3)}%`);
        
        if (testResult.data.blueGreenState.greenEnvironment.status === 'ready') {
          console.log('\nStep 2: Switching traffic to green environment...');
          
          const switchResult = await makeRequest({
            hostname: baseUrl,
            port: port,
            path: `/api/deployments/${blueGreenDep.id}/simulate-blue-green`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          }, { action: 'switch' });
          
          if (switchResult.status === 200) {
            console.log(`   Traffic Switch Complete!`);
            console.log(`   - Blue Environment: ${switchResult.data.blueGreenState.blueEnvironment.traffic}% traffic (${switchResult.data.blueGreenState.blueEnvironment.status})`);
            console.log(`   - Green Environment: ${switchResult.data.blueGreenState.greenEnvironment.traffic}% traffic (${switchResult.data.blueGreenState.greenEnvironment.status})`);
            console.log(`   - Deployment Status: ${switchResult.data.status}`);
          }
        }
      }
    }
    
    // 2. Rolling Deployment Demo
    if (rollingDep) {
      console.log('\n📦 Rolling Deployment Simulation');
      console.log('================================');
      
      console.log(`Deployment: ${rollingDep.id} (${rollingDep.namespace})`);
      console.log(`Strategy: ${rollingDep.strategy} update`);
      console.log(`Current Progress: ${rollingDep.rollingState.updatedPods}/${rollingDep.rollingState.totalPods} pods`);
      console.log(`Ready Pods: ${rollingDep.rollingState.readyPods}/${rollingDep.rollingState.totalPods}`);
      console.log(`Max Unavailable: ${rollingDep.rollingState.maxUnavailable}, Max Surge: ${rollingDep.rollingState.maxSurge}`);
      
      // Progress rolling deployment
      let rollStep = 1;
      while (rollingDep.rollingState.updatedPods < rollingDep.rollingState.totalPods) {
        console.log(`\nStep ${rollStep}: Progressing rolling update...`);
        
        const rollResult = await makeRequest({
          hostname: baseUrl,
          port: port,
          path: `/api/deployments/${rollingDep.id}/simulate-rolling`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (rollResult.status === 200) {
          const state = rollResult.data.rollingState;
          const traffic = rollResult.data.traffic[rollResult.data.traffic.length - 1];
          
          console.log(`   Updated Pods: ${state.updatedPods}/${state.totalPods}`);
          console.log(`   Ready Pods: ${state.readyPods}/${state.totalPods}`);
          console.log(`   Current Batch: ${state.currentBatch}/${state.totalBatches}`);
          console.log(`   Traffic Serving: ${traffic.percentage}%`);
          console.log(`   Response Time: ${Math.round(traffic.metrics.responseTime)}ms`);
          console.log(`   Error Rate: ${traffic.metrics.errorRate.toFixed(2)}%`);
          
          if (state.updatedPods === state.totalPods) {
            console.log(`   Rolling Deployment Complete! Status: ${rollResult.data.status}`);
            break;
          }
        }
        
        rollStep++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // 3. Canary Deployment Demo (if available)
    if (canaryDep && canaryDep.status !== 'success') {
      console.log('\n🕊️ Canary Deployment Simulation');
      console.log('===============================');
      
      console.log(`Deployment: ${canaryDep.id} (${canaryDep.namespace})`);
      console.log(`Version: ${canaryDep.version}`);
      
      const currentTraffic = canaryDep.traffic[canaryDep.traffic.length - 1];
      console.log(`Current Traffic: ${currentTraffic.percentage}%`);
      
      if (currentTraffic.percentage < 100) {
        console.log('\nProgressing canary deployment...');
        
        const canaryResult = await makeRequest({
          hostname: baseUrl,
          port: port,
          path: `/api/deployments/${canaryDep.id}/simulate-canary`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (canaryResult.status === 200) {
          const newTraffic = canaryResult.data.traffic[canaryResult.data.traffic.length - 1];
          console.log(`   Traffic increased to: ${newTraffic.percentage}%`);
          console.log(`   Status: ${newTraffic.status}`);
          console.log(`   Response Time: ${Math.round(newTraffic.metrics.responseTime)}ms`);
          console.log(`   Error Rate: ${newTraffic.metrics.errorRate.toFixed(2)}%`);
        }
      }
    }
    
    // Summary
    console.log('\n📊 Deployment Strategy Summary');
    console.log('=============================');
    console.log('✅ Blue-Green: Instant traffic switch between environments');
    console.log('   - Zero-downtime deployments');
    console.log('   - Full environment testing before switch');
    console.log('   - Instant rollback capability');
    console.log('');
    console.log('✅ Rolling: Gradual pod-by-pod updates');
    console.log('   - Continuous availability during updates');
    console.log('   - Configurable surge and unavailability limits');
    console.log('   - Resource-efficient deployment strategy');
    console.log('');
    console.log('✅ Canary: Progressive traffic routing');
    console.log('   - Risk mitigation through gradual rollout');
    console.log('   - Real-time monitoring and automatic rollback');
    console.log('   - A/B testing capabilities');
    
    console.log('\n🎯 All advanced deployment strategies demonstrated successfully!');
    
  } catch (error) {
    console.error('Demo failed:', error.message);
  }
}

// Run the advanced deployment demonstration
demonstrateAdvancedDeploymentStrategies();