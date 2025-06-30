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

async function demonstrateCostAnalysisDashboard() {
  console.log('=== Multi-Cloud Cost Analysis Dashboard Demo ===');
  console.log('Comprehensive cost tracking across AWS, GCP, and Azure\n');
  
  try {
    // 1. Overall Cost Summary
    console.log('1. Cost Summary Overview');
    console.log('=======================');
    const summary = await makeRequest('/api/cost-analysis/summary');
    
    if (summary && summary.status === 200) {
      const data = summary.data;
      console.log(`Total Daily Cost: $${data.totalDailyCost.toFixed(2)}`);
      console.log(`Total Monthly Cost: $${data.totalMonthlyCost.toFixed(2)}`);
      console.log(`Projected Yearly Cost: $${data.totalYearlyCost.toFixed(2)}`);
      console.log(`Last Updated: ${new Date(data.lastUpdated).toLocaleDateString()}`);
    }
    
    // 2. Provider Breakdown
    console.log('\n2. Cost Breakdown by Cloud Provider');
    console.log('===================================');
    const byProvider = await makeRequest('/api/cost-analysis/by-provider');
    
    if (byProvider && byProvider.status === 200) {
      const providers = byProvider.data;
      
      Object.entries(providers).forEach(([provider, data]) => {
        console.log(`\n${provider.toUpperCase()}:`);
        console.log(`  Daily Cost: $${data.dailyCost.toFixed(2)} (${data.percentage}% of total)`);
        console.log(`  Monthly Cost: $${data.monthlyCost.toFixed(2)}`);
        console.log(`  Top Services:`);
        
        Object.entries(data.services).forEach(([service, serviceData]) => {
          console.log(`    - ${service}: $${serviceData.cost.toFixed(2)} (${serviceData.percentage}%)`);
        });
        
        console.log(`  Regions:`);
        Object.entries(data.regions).forEach(([region, regionData]) => {
          console.log(`    - ${region}: $${regionData.cost.toFixed(2)} (${regionData.percentage}%)`);
        });
      });
    }
    
    // 3. Cost Trends and Forecasting
    console.log('\n3. Cost Trends and Forecasting');
    console.log('==============================');
    const trends = await makeRequest('/api/cost-analysis/trends');
    const forecast = await makeRequest('/api/cost-analysis/trends?period=forecast');
    
    if (trends && trends.status === 200) {
      console.log('Last 30 Days Trend:');
      const trendData = trends.data;
      const firstPoint = trendData[0];
      const lastPoint = trendData[trendData.length - 1];
      const growth = ((lastPoint.total - firstPoint.total) / firstPoint.total * 100).toFixed(1);
      
      console.log(`  ${firstPoint.date}: $${firstPoint.total.toFixed(2)}`);
      console.log(`  ${lastPoint.date}: $${lastPoint.total.toFixed(2)}`);
      console.log(`  Growth: ${growth}% over 30 days`);
    }
    
    if (forecast && forecast.status === 200) {
      console.log('\nForecast:');
      const forecastData = forecast.data;
      console.log(`  Next Month: $${forecastData.nextMonth.total.toFixed(2)}`);
      console.log(`  Next 3 Months: $${forecastData.next3Months.total.toFixed(2)}`);
      console.log(`  Next Year: $${forecastData.nextYear.total.toFixed(2)}`);
    }
    
    // 4. Cost Optimization Recommendations
    console.log('\n4. Cost Optimization Recommendations');
    console.log('====================================');
    const optimization = await makeRequest('/api/cost-analysis/optimization');
    
    if (optimization && optimization.status === 200) {
      const optData = optimization.data;
      console.log(`Total Potential Savings: $${optData.totalPotentialSavings.monthly.toFixed(2)}/month`);
      console.log('\nRecommendations:');
      
      optData.recommendations.forEach((rec, index) => {
        console.log(`\n${index + 1}. ${rec.type.replace('_', ' ').toUpperCase()} - ${rec.provider.toUpperCase()}`);
        console.log(`   Resource: ${rec.resource}`);
        console.log(`   Action: ${rec.description}`);
        console.log(`   Savings: $${rec.potentialSavings.daily.toFixed(2)}/day ($${rec.potentialSavings.monthly.toFixed(2)}/month)`);
        console.log(`   Impact: ${rec.impact} | Confidence: ${rec.confidence}`);
      });
    }
    
    // 5. Budget Monitoring
    console.log('\n5. Budget Monitoring and Alerts');
    console.log('===============================');
    const budgets = await makeRequest('/api/cost-analysis/budgets');
    
    if (budgets && budgets.status === 200) {
      budgets.data.forEach(budget => {
        console.log(`\n${budget.name} (${budget.provider.toUpperCase()}):`);
        console.log(`  Budget: $${budget.limit.toFixed(2)}/${budget.period}`);
        console.log(`  Current: $${budget.current.toFixed(2)} (${budget.utilization.toFixed(1)}% used)`);
        console.log(`  Status: ${budget.status.toUpperCase()}`);
        console.log(`  Warning Threshold: $${budget.alerts.warning.toFixed(2)}`);
        console.log(`  Critical Threshold: $${budget.alerts.critical.toFixed(2)}`);
      });
    }
    
    // 6. Demonstrate Cost Optimization
    console.log('\n6. Applying Cost Optimization');
    console.log('=============================');
    
    if (optimization && optimization.status === 200) {
      const firstRec = optimization.data.recommendations[0];
      console.log(`Applying recommendation: ${firstRec.description}`);
      
      const applyResult = await makeRequest(`/api/cost-analysis/recommendations/${firstRec.id}/apply`, 'POST');
      
      if (applyResult && applyResult.status === 200) {
        const result = applyResult.data;
        console.log('Optimization Applied Successfully!');
        console.log(`  Daily Savings: $${result.recommendation.potentialSavings.daily.toFixed(2)}`);
        console.log(`  Monthly Savings: $${result.recommendation.potentialSavings.monthly.toFixed(2)}`);
        console.log(`  New Total Daily Cost: $${result.newCostSummary.totalDailyCost.toFixed(2)}`);
        console.log(`  New Total Monthly Cost: $${result.newCostSummary.totalMonthlyCost.toFixed(2)}`);
      }
    }
    
    // 7. Simulate Cost Spike for Alert Testing
    console.log('\n7. Testing Cost Spike Alerts');
    console.log('============================');
    console.log('Simulating unexpected cost increase in AWS...');
    
    const spikeResult = await makeRequest('/api/cost-analysis/simulate-cost-spike', 'POST', {
      provider: 'aws',
      amount: 50.00
    });
    
    if (spikeResult && spikeResult.status === 200) {
      const spike = spikeResult.data;
      console.log(`Cost spike simulated: +$${spike.increase.toFixed(2)}/day`);
      console.log(`New ${spike.provider.toUpperCase()} daily cost: $${spike.newCosts.dailyCost.toFixed(2)}`);
      
      if (spike.affectedBudgets.length > 0) {
        console.log('Budget Alerts Triggered:');
        spike.affectedBudgets.forEach(budget => {
          console.log(`  - ${budget.name}: ${budget.utilization.toFixed(1)}% utilization (${budget.status.toUpperCase()})`);
        });
      }
    }
    
    // 8. Final Cost Summary
    console.log('\n8. Updated Cost Summary');
    console.log('======================');
    const finalSummary = await makeRequest('/api/cost-analysis/summary');
    
    if (finalSummary && finalSummary.status === 200) {
      const final = finalSummary.data;
      console.log(`Current Total Daily Cost: $${final.totalDailyCost.toFixed(2)}`);
      console.log(`Current Total Monthly Cost: $${final.totalMonthlyCost.toFixed(2)}`);
    }
    
    console.log('\n=== Cost Analysis Dashboard Features ===');
    console.log('Real-time cost tracking across AWS, GCP, and Azure');
    console.log('Service-level and region-level cost breakdown');
    console.log('Historical trend analysis and forecasting');
    console.log('Automated optimization recommendations');
    console.log('Budget monitoring with configurable alerts');
    console.log('Cost spike detection and alerting');
    console.log('ROI tracking for applied optimizations');
    console.log('\nMulti-cloud cost analysis dashboard operational!');
    
  } catch (error) {
    console.error('Cost analysis demo failed:', error.message);
    console.log('\nStarting cost analysis server...');
    require('./demo.js');
  }
}

// Run the cost analysis demonstration
demonstrateCostAnalysisDashboard();