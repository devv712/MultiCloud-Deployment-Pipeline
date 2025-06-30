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

async function demonstrateCanaryDeployment() {
  console.log('=== DevOps Pipeline Dashboard - Canary Deployment Demo ===\n');
  
  const baseUrl = 'localhost';
  const port = 3000;
  
  try {
    // Test health endpoint
    console.log('1. Testing system health...');
    const health = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/api/health',
      method: 'GET'
    });
    
    if (health.status === 200) {
      console.log('   ✓ System Status:', health.data.status);
      console.log('   ✓ Uptime:', Math.round(health.data.uptime), 'seconds');
    }
    
    // Get current deployments
    console.log('\n2. Checking current deployments...');
    const deployments = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/api/deployments',
      method: 'GET'
    });
    
    if (deployments.status === 200 && deployments.data.length > 0) {
      const canaryDep = deployments.data.find(d => d.strategy === 'canary');
      if (canaryDep) {
        const currentTraffic = canaryDep.traffic[canaryDep.traffic.length - 1];
        console.log('   ✓ Found canary deployment:', canaryDep.id);
        console.log('   ✓ Environment:', canaryDep.environment);
        console.log('   ✓ Cloud Provider:', canaryDep.cloudProvider);
        console.log('   ✓ Current Traffic:', currentTraffic.percentage + '%');
        console.log('   ✓ Status:', currentTraffic.status);
        console.log('   ✓ Error Rate:', currentTraffic.metrics.errorRate + '%');
        console.log('   ✓ Response Time:', currentTraffic.metrics.responseTime + 'ms');
        
        // Simulate canary progression
        console.log('\n3. Simulating canary deployment progression...');
        
        for (let i = 0; i < 3 && currentTraffic.percentage < 100; i++) {
          console.log(`   Step ${i + 1}: Progressing canary deployment...`);
          
          const progressResult = await makeRequest({
            hostname: baseUrl,
            port: port,
            path: `/api/deployments/${canaryDep.id}/simulate-canary`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (progressResult.status === 200) {
            const newTraffic = progressResult.data.traffic[progressResult.data.traffic.length - 1];
            console.log(`     → Traffic increased to: ${newTraffic.percentage}%`);
            console.log(`     → Status: ${newTraffic.status}`);
            console.log(`     → Error Rate: ${newTraffic.metrics.errorRate.toFixed(2)}%`);
            console.log(`     → Response Time: ${Math.round(newTraffic.metrics.responseTime)}ms`);
            
            if (newTraffic.percentage === 100) {
              console.log('     ✓ Canary deployment completed successfully!');
              break;
            }
          }
          
          // Wait between steps
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    // Check alerts
    console.log('\n4. Checking active alerts...');
    const alerts = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/api/alerts',
      method: 'GET'
    });
    
    if (alerts.status === 200) {
      const activeAlerts = alerts.data.filter(a => a.status === 'active');
      console.log('   ✓ Active alerts:', activeAlerts.length);
      
      activeAlerts.forEach(alert => {
        console.log(`     - ${alert.severity.toUpperCase()}: ${alert.title}`);
        console.log(`       ${alert.message}`);
      });
    }
    
    // Check infrastructure
    console.log('\n5. Infrastructure overview...');
    const infrastructure = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/api/infrastructure',
      method: 'GET'
    });
    
    if (infrastructure.status === 200) {
      let totalCost = 0;
      console.log('   ✓ Infrastructure status:');
      
      infrastructure.data.forEach(infra => {
        console.log(`     - ${infra.name} (${infra.provider.toUpperCase()})`);
        console.log(`       Status: ${infra.status} | Nodes: ${infra.resources.nodes}`);
        console.log(`       Daily Cost: $${infra.cost.daily}`);
        totalCost += infra.cost.daily;
      });
      
      console.log(`   ✓ Total daily infrastructure cost: $${totalCost.toFixed(2)}`);
    }
    
    console.log('\n=== Demo Complete ===');
    console.log('The DevOps Pipeline Dashboard includes:');
    console.log('• Real-time canary deployment progression (25% → 50% → 75% → 100%)');
    console.log('• Multi-cloud infrastructure monitoring (AWS EKS, GCP GKE)');  
    console.log('• Live alert management and health checking');
    console.log('• WebSocket real-time updates for deployment events');
    console.log('• Cost tracking and resource utilization monitoring');
    
  } catch (error) {
    console.error('Demo failed:', error.message);
    console.log('\nStarting the DevOps Pipeline Dashboard server...');
    
    // Start the server for demonstration
    require('./demo.js');
  }
}

// Run the demonstration
demonstrateCanaryDeployment();