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

async function demonstrateComplianceChecklistGenerator() {
  console.log('=== Automated Compliance Checklist Generator Demo ===');
  console.log('Comprehensive security and operational compliance assessment\n');
  
  try {
    // 1. Available Compliance Frameworks
    console.log('1. Available Compliance Frameworks');
    console.log('===================================');
    const frameworks = await makeRequest('/api/compliance/frameworks');
    
    if (frameworks && frameworks.status === 200) {
      frameworks.data.forEach(framework => {
        console.log(`${framework.name} (${framework.id}):`);
        console.log(`  Description: ${framework.description}`);
        console.log(`  Total Controls: ${framework.totalControls}`);
        console.log(`  Version: ${framework.version}`);
        console.log(`  Applicable Environments: ${framework.applicableEnvironments.join(', ')}`);
        console.log(`  Categories: ${framework.categories.join(', ')}\n`);
      });
    }
    
    // 2. Generate SOC 2 Compliance Checklist
    console.log('2. Generating SOC 2 Compliance Checklist');
    console.log('========================================');
    
    const soc2Checklist = await makeRequest('/api/compliance/generate-checklist', 'POST', {
      frameworkId: 'soc2',
      scope: ['production', 'staging'],
      environment: 'production',
      assessmentType: 'external'
    });
    
    if (soc2Checklist && soc2Checklist.status === 200) {
      const checklist = soc2Checklist.data;
      console.log(`Generated Checklist ID: ${checklist.id}`);
      console.log(`Framework: ${checklist.frameworkName}`);
      console.log(`Total Controls: ${checklist.totalControls}`);
      console.log(`Estimated Effort: ${checklist.estimatedEffort} hours`);
      console.log(`Environment: ${checklist.environment}`);
      console.log(`Assessment Type: ${checklist.assessmentType}`);
      
      console.log('\nTop Priority Controls:');
      checklist.priority.slice(0, 5).forEach((controlId, index) => {
        const control = checklist.controls.find(c => c.id === controlId);
        if (control) {
          console.log(`  ${index + 1}. ${control.title}`);
          console.log(`     Category: ${control.category}`);
          console.log(`     Risk Level: ${control.riskLevel}`);
          console.log(`     Status: ${control.status}`);
          console.log(`     Assigned To: ${control.assignedTo}`);
          console.log(`     Estimated Hours: ${control.estimatedHours}`);
          console.log(`     Automation Potential: ${control.automationPotential}\n`);
        }
      });
      
      console.log('Project Timeline:');
      checklist.timeline.forEach(phase => {
        console.log(`  ${phase.name}: ${phase.duration} days`);
      });
      
      console.log(`\nRisk Assessment: ${checklist.riskAssessment.overall} risk`);
      checklist.riskAssessment.factors.forEach(factor => {
        console.log(`  - ${factor}`);
      });
    }
    
    // 3. Generate PCI DSS Checklist
    console.log('\n3. Generating PCI DSS Compliance Checklist');
    console.log('==========================================');
    
    const pciChecklist = await makeRequest('/api/compliance/generate-checklist', 'POST', {
      frameworkId: 'pci-dss',
      scope: ['production'],
      environment: 'production',
      assessmentType: 'internal'
    });
    
    if (pciChecklist && pciChecklist.status === 200) {
      const checklist = pciChecklist.data;
      console.log(`Generated Checklist ID: ${checklist.id}`);
      console.log(`Framework: ${checklist.frameworkName}`);
      console.log(`Total Controls: ${checklist.totalControls}`);
      console.log(`Estimated Effort: ${checklist.estimatedEffort} hours`);
      
      console.log('\nControl Distribution by Category:');
      const categories = {};
      checklist.controls.forEach(control => {
        categories[control.category] = (categories[control.category] || 0) + 1;
      });
      
      Object.entries(categories).forEach(([category, count]) => {
        console.log(`  ${category}: ${count} controls`);
      });
    }
    
    // 4. Review Existing Controls
    console.log('\n4. Reviewing Existing Control Status');
    console.log('===================================');
    
    const soc2Controls = await makeRequest('/api/compliance/controls/soc2');
    if (soc2Controls && soc2Controls.status === 200) {
      const controls = soc2Controls.data;
      const statusCounts = {
        compliant: controls.filter(c => c.status === 'compliant').length,
        'non-compliant': controls.filter(c => c.status === 'non-compliant').length,
        'partially-compliant': controls.filter(c => c.status === 'partially-compliant').length
      };
      
      console.log('SOC 2 Control Status Summary:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count} controls`);
      });
      
      console.log('\nNon-Compliant Controls Requiring Attention:');
      const nonCompliant = controls.filter(c => c.status === 'non-compliant');
      nonCompliant.forEach(control => {
        console.log(`  - ${control.title} (${control.category})`);
        console.log(`    Risk Level: ${control.riskLevel}`);
        console.log(`    Last Assessed: ${new Date(control.lastAssessed).toLocaleDateString()}`);
        if (control.findings) {
          control.findings.forEach(finding => {
            console.log(`    Finding: ${finding}`);
          });
        }
        console.log('');
      });
    }
    
    // 5. Create New Assessment
    console.log('5. Creating New Compliance Assessment');
    console.log('====================================');
    
    const newAssessment = await makeRequest('/api/compliance/assessments', 'POST', {
      frameworkId: 'gdpr',
      name: 'GDPR Annual Assessment 2025',
      scope: ['production', 'staging'],
      assessor: 'Data Protection Team',
      targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    if (newAssessment && newAssessment.status === 200) {
      const assessment = newAssessment.data;
      console.log(`Assessment Created: ${assessment.name}`);
      console.log(`Assessment ID: ${assessment.id}`);
      console.log(`Framework: ${assessment.frameworkId.toUpperCase()}`);
      console.log(`Scope: ${assessment.scope.join(', ')}`);
      console.log(`Start Date: ${new Date(assessment.startDate).toLocaleDateString()}`);
      console.log(`Target Date: ${new Date(assessment.targetDate).toLocaleDateString()}`);
      console.log(`Assessor: ${assessment.assessor}`);
      console.log(`Status: ${assessment.status}`);
    }
    
    // 6. Update Control Status
    console.log('\n6. Updating Control Status');
    console.log('==========================');
    
    const controlUpdate = await makeRequest('/api/compliance/controls/soc2/soc2-cc6.1', 'PUT', {
      status: 'compliant',
      findings: ['MFA enabled for all admin accounts', 'Privileged access review completed'],
      evidence: ['MFA configuration screenshots', 'Access review documentation', 'Policy updates'],
      assignedTo: 'Security Team'
    });
    
    if (controlUpdate && controlUpdate.status === 200) {
      const control = controlUpdate.data;
      console.log(`Control Updated: ${control.id}`);
      console.log(`Title: ${control.title}`);
      console.log(`New Status: ${control.status}`);
      console.log(`Last Assessed: ${new Date(control.lastAssessed).toLocaleDateString()}`);
      console.log(`Assigned To: ${control.assignedTo}`);
      
      if (control.findings) {
        console.log('Updated Findings:');
        control.findings.forEach(finding => {
          console.log(`  - ${finding}`);
        });
      }
    }
    
    // 7. Generate Compliance Report
    console.log('\n7. Generating Compliance Report');
    console.log('===============================');
    
    const existingAssessments = await makeRequest('/api/compliance/assessments?frameworkId=soc2');
    if (existingAssessments && existingAssessments.data.length > 0) {
      const assessment = existingAssessments.data[0];
      
      const report = await makeRequest('/api/compliance/generate-report', 'POST', {
        frameworkId: 'soc2',
        assessmentId: assessment.id,
        period: {
          start: '2025-04-01',
          end: '2025-06-30'
        }
      });
      
      if (report && report.status === 200) {
        const reportData = report.data;
        console.log(`Report Generated: ${reportData.title}`);
        console.log(`Report ID: ${reportData.id}`);
        console.log(`Period: ${reportData.period.start} to ${reportData.period.end}`);
        console.log(`Overall Rating: ${reportData.overallRating}`);
        console.log(`Compliance Percentage: ${reportData.summary.compliancePercentage}%`);
        
        console.log('\nCompliance Summary:');
        console.log(`  Total Controls: ${reportData.summary.totalControls}`);
        console.log(`  Compliant: ${reportData.summary.compliantControls}`);
        console.log(`  Non-Compliant: ${reportData.summary.nonCompliantControls}`);
        console.log(`  Partially Compliant: ${reportData.summary.partiallyCompliantControls}`);
        console.log(`  Total Exceptions: ${reportData.summary.exceptions}`);
        
        console.log('\nKey Findings:');
        reportData.keyFindings.forEach(finding => {
          console.log(`  - ${finding}`);
        });
        
        console.log('\nRecommendations:');
        reportData.recommendations.forEach(recommendation => {
          console.log(`  - ${recommendation}`);
        });
        
        console.log(`\nReport Generated: ${new Date(reportData.generatedDate).toLocaleDateString()}`);
        console.log(`Report Expires: ${new Date(reportData.expiryDate).toLocaleDateString()}`);
      }
    }
    
    // 8. View All Active Assessments
    console.log('\n8. Active Compliance Assessments');
    console.log('================================');
    
    const allAssessments = await makeRequest('/api/compliance/assessments');
    if (allAssessments && allAssessments.status === 200) {
      allAssessments.data.forEach(assessment => {
        console.log(`\n${assessment.name}:`);
        console.log(`  Framework: ${assessment.frameworkId.toUpperCase()}`);
        console.log(`  Status: ${assessment.status}`);
        console.log(`  Progress: ${assessment.progress.completed}/${assessment.progress.total} controls`);
        console.log(`  Compliant: ${assessment.progress.compliant}`);
        console.log(`  Non-Compliant: ${assessment.progress.nonCompliant}`);
        console.log(`  Target Date: ${new Date(assessment.targetDate).toLocaleDateString()}`);
        
        if (assessment.findings) {
          const totalFindings = Object.values(assessment.findings).reduce((sum, count) => sum + count, 0);
          console.log(`  Total Findings: ${totalFindings} (Critical: ${assessment.findings.critical}, High: ${assessment.findings.high})`);
        }
      });
    }
    
    console.log('\n=== Compliance Checklist Generator Features ===');
    console.log('Multi-framework support: SOC 2, PCI DSS, GDPR, HIPAA, ISO 27001');
    console.log('Automated control prioritization based on risk and compliance status');
    console.log('Intelligent team assignment and effort estimation');
    console.log('Timeline generation with dependency mapping');
    console.log('Real-time assessment progress tracking');
    console.log('Automated compliance report generation');
    console.log('Control status management with evidence tracking');
    console.log('Risk assessment and remediation planning');
    console.log('\nAutomated compliance checklist generator operational!');
    
  } catch (error) {
    console.error('Compliance demo failed:', error.message);
    console.log('\nStarting compliance server...');
    require('./demo.js');
  }
}

// Run the compliance demonstration
demonstrateComplianceChecklistGenerator();