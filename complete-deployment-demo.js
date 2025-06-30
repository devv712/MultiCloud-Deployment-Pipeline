const http = require('http');

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    
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
    
    req.on('error', () => resolve(null));
    req.setTimeout(3000, () => req.destroy());
    
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function completeDeploymentStrategyDemo() {
  console.log('=== Complete Advanced Deployment Strategies Demo ===');
  console.log('DevOps Pipeline Dashboard - Multi-Cloud CI/CD Monitoring\n');
  
  try {
    // Get system status
    const health = await makeRequest('/api/health');
    if (!health || health.status !== 200) {
      console.log('Server not available - starting demo server...');
      require('./demo.js');
      return;
    }
    
    console.log('System Status: Healthy');
    console.log('Deployment Strategies Available: Canary, Blue-Green, Rolling\n');
    
    // Get all deployments
    const deployments = await makeRequest('/api/deployments');
    if (!deployments || deployments.status !== 200) return;
    
    console.log('Current Deployment Overview:');
    deployments.data.forEach(dep => {
      console.log(`  ${dep.id}: ${dep.strategy} deployment (${dep.environment}) - ${dep.status}`);
    });
    console.log('');
    
    // 1. Blue-Green Deployment Complete Flow
    console.log('1. Blue-Green Deployment Strategy');
    console.log('================================');
    const blueGreen = deployments.data.find(d => d.strategy === 'blue-green');
    
    if (blueGreen) {
      console.log(`Environment: ${blueGreen.environment} (${blueGreen.cloudProvider.toUpperCase()})`);
      console.log(`Blue Version: ${blueGreen.blueGreenState.blueEnvironment.version} (${blueGreen.blueGreenState.blueEnvironment.traffic}% traffic)`);
      console.log(`Green Version: ${blueGreen.blueGreenState.greenEnvironment.version} (${blueGreen.blueGreenState.greenEnvironment.traffic}% traffic)`);
      
      // Test green environment multiple times for reliability
      let testAttempts = 0;
      let testPassed = false;
      
      while (testAttempts < 3 && !testPassed) {
        testAttempts++;
        console.log(`\nTesting green environment (attempt ${testAttempts})...`);
        
        const testResult = await makeRequest(`/api/deployments/${blueGreen.id}/simulate-blue-green`, 'POST', { action: 'test' });
        
        if (testResult && testResult.status === 200) {
          const greenStatus = testResult.data.blueGreenState.greenEnvironment.status;
          console.log(`  Health check result: ${greenStatus}`);
          
          if (greenStatus === 'ready') {
            testPassed = true;
            console.log('  All health checks passed - ready for traffic switch');
            
            // Perform traffic switch
            console.log('\nSwitching traffic to green environment...');
            const switchResult = await makeRequest(`/api/deployments/${blueGreen.id}/simulate-blue-green`, 'POST', { action: 'switch' });
            
            if (switchResult && switchResult.status === 200) {
              console.log('  Traffic switch completed successfully');
              console.log(`  New active version: ${switchResult.data.version}`);
              console.log(`  Green environment: ${switchResult.data.blueGreenState.greenEnvironment.traffic}% traffic`);
              console.log(`  Blue environment: ${switchResult.data.blueGreenState.blueEnvironment.traffic}% traffic`);
            }
          } else {
            console.log(`  Health checks failed - retrying...`);
          }
        }
        
        if (!testPassed && testAttempts < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!testPassed) {
        console.log('  Green environment not ready after 3 attempts');
      }
    }
    
    // 2. Rolling Deployment Complete Flow
    console.log('\n2. Rolling Deployment Strategy');
    console.log('=============================');
    const rolling = deployments.data.find(d => d.strategy === 'rolling');
    
    if (rolling) {
      console.log(`Environment: ${rolling.environment} (${rolling.cloudProvider.toUpperCase()})`);
      console.log(`Cluster: ${rolling.cluster}`);
      console.log(`Update Strategy: ${rolling.rollingState.maxSurge} max surge, ${rolling.rollingState.maxUnavailable} max unavailable`);
      
      let rollStep = 1;
      while (rolling.rollingState.updatedPods < rolling.rollingState.totalPods) {
        console.log(`\nRolling update step ${rollStep}:`);
        
        const rollResult = await makeRequest(`/api/deployments/${rolling.id}/simulate-rolling`, 'POST');
        
        if (rollResult && rollResult.status === 200) {
          const state = rollResult.data.rollingState;
          const traffic = rollResult.data.traffic[rollResult.data.traffic.length - 1];
          
          console.log(`  Progress: ${state.updatedPods}/${state.totalPods} pods updated`);
          console.log(`  Ready: ${state.readyPods}/${state.totalPods} pods ready`);
          console.log(`  Available: ${state.availablePods}/${state.totalPods} pods available`);
          console.log(`  Traffic serving: ${traffic.percentage}%`);
          console.log(`  Performance: ${Math.round(traffic.metrics.responseTime)}ms response, ${traffic.metrics.errorRate.toFixed(2)}% errors`);
          
          if (state.updatedPods === state.totalPods) {
            console.log(`  Rolling deployment completed successfully!`);
            break;
          }
        }
        
        rollStep++;
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }
    
    // 3. Canary Deployment Flow
    console.log('\n3. Canary Deployment Strategy');
    console.log('============================');
    const canary = deployments.data.find(d => d.strategy === 'canary');
    
    if (canary) {
      console.log(`Environment: ${canary.environment} (${canary.cloudProvider.toUpperCase()})`);
      console.log(`Version: ${canary.version}`);
      
      const currentTraffic = canary.traffic[canary.traffic.length - 1];
      console.log(`Current traffic: ${currentTraffic.percentage}%`);
      
      if (currentTraffic.percentage === 100) {
        console.log('  Canary deployment already completed');
      } else {
        console.log('\nProgressing canary deployment...');
        const canaryResult = await makeRequest(`/api/deployments/${canary.id}/simulate-canary`, 'POST');
        
        if (canaryResult && canaryResult.status === 200) {
          const newTraffic = canaryResult.data.traffic[canaryResult.data.traffic.length - 1];
          console.log(`  Traffic increased to: ${newTraffic.percentage}%`);
          console.log(`  Status: ${newTraffic.status}`);
          console.log(`  Performance: ${Math.round(newTraffic.metrics.responseTime)}ms response`);
          console.log(`  Error rate: ${newTraffic.metrics.errorRate.toFixed(2)}%`);
        }
      }
    }
    
    // Final infrastructure overview
    console.log('\n4. Infrastructure Overview');
    console.log('=========================');
    const infrastructure = await makeRequest('/api/infrastructure');
    
    if (infrastructure && infrastructure.status === 200) {
      let totalDailyCost = 0;
      
      infrastructure.data.forEach(infra => {
        console.log(`${infra.name}:`);
        console.log(`  Provider: ${infra.provider.toUpperCase()}`);
        console.log(`  Region: ${infra.region}`);
        console.log(`  Nodes: ${infra.resources.nodes}`);
        console.log(`  Daily cost: $${infra.cost.daily}`);
        totalDailyCost += infra.cost.daily;
      });
      
      console.log(`\nTotal infrastructure cost: $${totalDailyCost.toFixed(2)}/day`);
    }
    
    // Summary
    console.log('\n=== Deployment Strategy Comparison ===');
    console.log('Blue-Green: Zero downtime, instant rollback, full environment testing');
    console.log('Rolling: Resource efficient, gradual updates, configurable availability');
    console.log('Canary: Risk mitigation, progressive rollout, real-time monitoring');
    console.log('\nAll advanced deployment strategies successfully demonstrated!');
    
  } catch (error) {
    console.error('Demo error:', error.message);
  }
}

completeDeploymentStrategyDemo();