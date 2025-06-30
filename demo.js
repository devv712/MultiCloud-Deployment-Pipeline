const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

app.use(cors());
app.use(express.json());

// DevOps Pipeline Dashboard Data
const pipelines = [
  {
    id: 'pipe-1',
    name: 'E-Commerce Platform',
    repository: 'github.com/company/ecommerce',
    branch: 'main',
    status: 'running',
    environments: ['staging', 'production'],
    createdAt: '2025-06-29T10:00:00Z',
    updatedAt: '2025-06-29T17:30:00Z'
  },
  {
    id: 'pipe-2',
    name: 'Payment Service',
    repository: 'github.com/company/payment-service', 
    branch: 'develop',
    status: 'success',
    environments: ['dev', 'staging', 'production'],
    createdAt: '2025-06-29T09:00:00Z',
    updatedAt: '2025-06-29T16:45:00Z'
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
    status: 'success',
    version: 'v2.1.3',
    previousVersion: 'v2.1.2',
    traffic: [
      {
        timestamp: new Date().toISOString(),
        percentage: 100,
        status: 'stable',
        metrics: {
          errorRate: 0.08,
          responseTime: 135,
          throughput: 1420,
          cpuUsage: 62,
          memoryUsage: 68
        }
      }
    ],
    startedAt: '2025-06-29T17:00:00Z',
    completedAt: '2025-06-29T17:15:00Z'
  },
  {
    id: 'dep-2',
    runId: 'run-2', 
    environment: 'staging',
    cloudProvider: 'gcp',
    cluster: 'staging-cluster-us-central1',
    namespace: 'payment',
    strategy: 'blue-green',
    status: 'ready',
    version: 'v1.8.3',
    previousVersion: 'v1.8.2',
    blueGreenState: {
      blueEnvironment: {
        version: 'v1.8.2',
        status: 'active',
        traffic: 100,
        pods: 4,
        healthyPods: 4
      },
      greenEnvironment: {
        version: 'v1.8.3',
        status: 'ready',
        traffic: 0,
        pods: 4,
        healthyPods: 4
      },
      switchScheduled: false
    },
    traffic: [
      {
        timestamp: new Date().toISOString(),
        percentage: 0,
        status: 'ready',
        environment: 'green',
        metrics: {
          errorRate: 0.02,
          responseTime: 78,
          throughput: 920,
          cpuUsage: 38,
          memoryUsage: 45
        }
      }
    ],
    startedAt: '2025-06-29T16:30:00Z'
  },
  {
    id: 'dep-3',
    runId: 'run-3',
    environment: 'production',
    cloudProvider: 'azure',
    cluster: 'prod-cluster-eastus',
    namespace: 'api-gateway',
    strategy: 'rolling',
    status: 'running',
    version: 'v3.2.1',
    previousVersion: 'v3.2.0',
    rollingState: {
      totalPods: 12,
      updatedPods: 7,
      readyPods: 6,
      availablePods: 11,
      maxUnavailable: 2,
      maxSurge: 3,
      currentBatch: 2,
      totalBatches: 4
    },
    traffic: [
      {
        timestamp: new Date().toISOString(),
        percentage: 58,
        status: 'progressing',
        metrics: {
          errorRate: 0.12,
          responseTime: 156,
          throughput: 2150,
          cpuUsage: 71,
          memoryUsage: 79
        }
      }
    ],
    startedAt: '2025-06-29T17:20:00Z'
  }
];

const alerts = [
  {
    id: 'alert-1',
    deploymentId: 'dep-1',
    severity: 'warning',
    title: 'High Memory Usage During Canary',
    message: 'Memory usage exceeded 70% threshold during canary deployment progression',
    status: 'active',
    createdAt: '2025-06-29T17:15:00Z',
    tags: ['memory', 'canary', 'production', 'ecommerce']
  },
  {
    id: 'alert-2',
    pipelineId: 'pipe-1',
    severity: 'info',
    title: 'Deployment Completed Successfully',
    message: 'Payment service v1.8.2 deployed successfully to staging environment',
    status: 'resolved',
    createdAt: '2025-06-29T16:45:00Z',
    resolvedAt: '2025-06-29T16:46:00Z',
    tags: ['deployment', 'success', 'staging']
  }
];

const infrastructure = [
  {
    id: 'infra-1',
    name: 'Production EKS Cluster',
    provider: 'aws',
    region: 'us-east-1',
    type: 'kubernetes',
    status: 'active',
    resources: {
      cpu: 96,
      memory: 384,
      storage: 2048,
      nodes: 8
    },
    cost: {
      daily: 245.50,
      monthly: 7365.00,
      currency: 'USD'
    }
  },
  {
    id: 'infra-2',
    name: 'Staging GKE Cluster',
    provider: 'gcp',
    region: 'us-central1',
    type: 'kubernetes',
    status: 'active',
    resources: {
      cpu: 32,
      memory: 128,
      storage: 512,
      nodes: 4
    },
    cost: {
      daily: 89.25,
      monthly: 2677.50,
      currency: 'USD'
    }
  },
  {
    id: 'infra-3',
    name: 'Development AKS Cluster',
    provider: 'azure',
    region: 'eastus',
    type: 'kubernetes',
    status: 'active',
    resources: {
      cpu: 24,
      memory: 96,
      storage: 256,
      nodes: 3
    },
    cost: {
      daily: 67.80,
      monthly: 2034.00,
      currency: 'USD'
    }
  }
];

// Cost tracking and analysis data
const costAnalysis = {
  summary: {
    totalDailyCost: 402.55,
    totalMonthlyCost: 12076.50,
    totalYearlyCost: 144918.00,
    currency: 'USD',
    lastUpdated: new Date().toISOString()
  },
  byProvider: {
    aws: {
      dailyCost: 245.50,
      monthlyCost: 7365.00,
      percentage: 61.0,
      services: {
        'EC2': { cost: 156.20, percentage: 63.6 },
        'EBS': { cost: 34.80, percentage: 14.2 },
        'LoadBalancer': { cost: 28.50, percentage: 11.6 },
        'VPC': { cost: 26.00, percentage: 10.6 }
      },
      regions: {
        'us-east-1': { cost: 198.40, percentage: 80.8 },
        'us-west-2': { cost: 47.10, percentage: 19.2 }
      }
    },
    gcp: {
      dailyCost: 89.25,
      monthlyCost: 2677.50,
      percentage: 22.2,
      services: {
        'Compute Engine': { cost: 52.35, percentage: 58.6 },
        'Persistent Disk': { cost: 18.90, percentage: 21.2 },
        'Cloud Load Balancing': { cost: 12.60, percentage: 14.1 },
        'VPC': { cost: 5.40, percentage: 6.1 }
      },
      regions: {
        'us-central1': { cost: 71.40, percentage: 80.0 },
        'us-east1': { cost: 17.85, percentage: 20.0 }
      }
    },
    azure: {
      dailyCost: 67.80,
      monthlyCost: 2034.00,
      percentage: 16.8,
      services: {
        'Virtual Machines': { cost: 42.12, percentage: 62.1 },
        'Managed Disks': { cost: 13.56, percentage: 20.0 },
        'Load Balancer': { cost: 8.14, percentage: 12.0 },
        'Virtual Network': { cost: 3.98, percentage: 5.9 }
      },
      regions: {
        'eastus': { cost: 54.24, percentage: 80.0 },
        'westus2': { cost: 13.56, percentage: 20.0 }
      }
    }
  },
  trends: {
    last30Days: [
      { date: '2025-06-01', aws: 238.20, gcp: 85.60, azure: 64.30, total: 388.10 },
      { date: '2025-06-08', aws: 241.85, gcp: 87.15, azure: 65.80, total: 394.80 },
      { date: '2025-06-15', aws: 244.10, gcp: 88.90, azure: 66.90, total: 399.90 },
      { date: '2025-06-22', aws: 245.50, gcp: 89.25, azure: 67.80, total: 402.55 },
      { date: '2025-06-29', aws: 245.50, gcp: 89.25, azure: 67.80, total: 402.55 }
    ],
    forecast: {
      nextMonth: { aws: 7485.75, gcp: 2730.15, azure: 2080.20, total: 12296.10 },
      next3Months: { aws: 22457.25, gcp: 8190.45, azure: 6240.60, total: 36888.30 },
      nextYear: { aws: 89829.00, gcp: 32761.80, azure: 24963.60, total: 147554.40 }
    }
  },
  optimization: {
    recommendations: [
      {
        id: 'rec-1',
        type: 'rightsizing',
        provider: 'aws',
        resource: 'EC2 instances in us-east-1',
        description: 'Downsize 3 m5.2xlarge instances to m5.xlarge',
        potentialSavings: { daily: 28.80, monthly: 864.00 },
        impact: 'low',
        confidence: 'high'
      },
      {
        id: 'rec-2',
        type: 'reserved_instances',
        provider: 'aws',
        resource: 'Production workloads',
        description: 'Purchase 1-year reserved instances for stable workloads',
        potentialSavings: { daily: 45.60, monthly: 1368.00 },
        impact: 'medium',
        confidence: 'high'
      },
      {
        id: 'rec-3',
        type: 'unused_resources',
        provider: 'gcp',
        resource: 'Persistent disks in us-east1',
        description: 'Delete 5 unused persistent disks (500GB total)',
        potentialSavings: { daily: 8.50, monthly: 255.00 },
        impact: 'low',
        confidence: 'medium'
      },
      {
        id: 'rec-4',
        type: 'auto_scaling',
        provider: 'azure',
        resource: 'Development VMs',
        description: 'Enable auto-scaling and shutdown during off-hours',
        potentialSavings: { daily: 15.30, monthly: 459.00 },
        impact: 'medium',
        confidence: 'high'
      }
    ],
    totalPotentialSavings: {
      daily: 98.20,
      monthly: 2946.00,
      yearly: 35352.00
    }
  },
  budgets: [
    {
      id: 'budget-1',
      name: 'Production Infrastructure',
      provider: 'aws',
      limit: 8000.00,
      current: 7365.00,
      utilization: 92.1,
      period: 'monthly',
      alerts: {
        warning: 7200.00,
        critical: 7600.00
      },
      status: 'warning'
    },
    {
      id: 'budget-2',
      name: 'Development & Testing',
      provider: 'gcp',
      limit: 3000.00,
      current: 2677.50,
      utilization: 89.3,
      period: 'monthly',
      alerts: {
        warning: 2700.00,
        critical: 2850.00
      },
      status: 'ok'
    },
    {
      id: 'budget-3',
      name: 'Staging Environment',
      provider: 'azure',
      limit: 2500.00,
      current: 2034.00,
      utilization: 81.4,
      period: 'monthly',
      alerts: {
        warning: 2250.00,
        critical: 2375.00
      },
      status: 'ok'
    }
  ],
  alerts: [
    {
      id: 'cost-alert-1',
      type: 'budget_warning',
      provider: 'aws',
      message: 'AWS production budget at 92% utilization',
      severity: 'warning',
      threshold: 90,
      current: 92.1,
      createdAt: new Date().toISOString()
    }
  ]
};

// Compliance Framework Data
const complianceFrameworks = {
  'soc2': {
    id: 'soc2',
    name: 'SOC 2 Type II',
    description: 'Service Organization Control 2 - Security, Availability, Processing Integrity, Confidentiality, Privacy',
    categories: ['Security', 'Availability', 'Processing Integrity', 'Confidentiality', 'Privacy'],
    totalControls: 45,
    version: '2017',
    applicableEnvironments: ['production', 'staging']
  },
  'pci-dss': {
    id: 'pci-dss',
    name: 'PCI DSS',
    description: 'Payment Card Industry Data Security Standard',
    categories: ['Network Security', 'Data Protection', 'Vulnerability Management', 'Access Control', 'Monitoring', 'Policy'],
    totalControls: 78,
    version: '4.0',
    applicableEnvironments: ['production']
  },
  'gdpr': {
    id: 'gdpr',
    name: 'GDPR',
    description: 'General Data Protection Regulation',
    categories: ['Data Processing', 'Individual Rights', 'Data Protection', 'Breach Notification', 'Privacy by Design'],
    totalControls: 32,
    version: '2018',
    applicableEnvironments: ['production', 'staging', 'development']
  },
  'hipaa': {
    id: 'hipaa',
    name: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act',
    categories: ['Administrative Safeguards', 'Physical Safeguards', 'Technical Safeguards'],
    totalControls: 56,
    version: '2013',
    applicableEnvironments: ['production']
  },
  'iso27001': {
    id: 'iso27001',
    name: 'ISO 27001',
    description: 'Information Security Management System',
    categories: ['Information Security Policies', 'Risk Management', 'Asset Management', 'Access Control', 'Incident Management'],
    totalControls: 114,
    version: '2022',
    applicableEnvironments: ['production', 'staging']
  }
};

const complianceControls = {
  'soc2': [
    {
      id: 'soc2-cc1.1',
      category: 'Security',
      title: 'Control Environment - Integrity and Ethical Values',
      description: 'The entity demonstrates a commitment to integrity and ethical values',
      requirement: 'Documented code of conduct and ethics policy with regular training',
      implementation: 'automated',
      status: 'compliant',
      evidence: ['Ethics policy document', 'Annual training records', 'Signed acknowledgments'],
      lastAssessed: '2025-06-15T00:00:00Z',
      riskLevel: 'low',
      remediationEffort: 'low'
    },
    {
      id: 'soc2-cc6.1',
      category: 'Security',
      title: 'Logical and Physical Access Controls',
      description: 'The entity implements logical access security software and infrastructure',
      requirement: 'Multi-factor authentication for all administrative access',
      implementation: 'manual',
      status: 'non-compliant',
      evidence: ['MFA configuration screenshots', 'Access logs'],
      lastAssessed: '2025-06-20T00:00:00Z',
      riskLevel: 'high',
      remediationEffort: 'medium',
      findings: ['3 admin accounts without MFA enabled', 'Privileged access review overdue']
    },
    {
      id: 'soc2-cc7.1',
      category: 'Security',
      title: 'System Operations',
      description: 'The entity ensures authorized system changes are completed',
      requirement: 'Change management process with approval workflows',
      implementation: 'automated',
      status: 'compliant',
      evidence: ['Change management system logs', 'Approval workflows', 'Deployment records'],
      lastAssessed: '2025-06-25T00:00:00Z',
      riskLevel: 'medium',
      remediationEffort: 'low'
    }
  ],
  'pci-dss': [
    {
      id: 'pci-1.1.1',
      category: 'Network Security',
      title: 'Firewall Configuration Standards',
      description: 'A formal process for approving and testing all network connections',
      requirement: 'Documented firewall rules with business justification',
      implementation: 'manual',
      status: 'partially-compliant',
      evidence: ['Firewall rule documentation', 'Network diagrams', 'Quarterly reviews'],
      lastAssessed: '2025-06-10T00:00:00Z',
      riskLevel: 'medium',
      remediationEffort: 'medium',
      findings: ['5 firewall rules lack business justification', 'Network diagram outdated']
    },
    {
      id: 'pci-3.4.1',
      category: 'Data Protection',
      title: 'Primary Account Number Protection',
      description: 'PAN is unreadable anywhere it is stored',
      requirement: 'Strong cryptography and security protocols to safeguard PAN',
      implementation: 'automated',
      status: 'compliant',
      evidence: ['Encryption implementation', 'Key management procedures', 'Data flow diagrams'],
      lastAssessed: '2025-06-22T00:00:00Z',
      riskLevel: 'high',
      remediationEffort: 'low'
    }
  ],
  'gdpr': [
    {
      id: 'gdpr-art5',
      category: 'Data Processing',
      title: 'Principles of Processing Personal Data',
      description: 'Personal data shall be processed lawfully, fairly and transparently',
      requirement: 'Documented legal basis for all data processing activities',
      implementation: 'manual',
      status: 'compliant',
      evidence: ['Privacy policy', 'Data processing agreements', 'Legal basis documentation'],
      lastAssessed: '2025-06-18T00:00:00Z',
      riskLevel: 'high',
      remediationEffort: 'low'
    },
    {
      id: 'gdpr-art25',
      category: 'Privacy by Design',
      title: 'Data Protection by Design and by Default',
      description: 'Implement appropriate technical and organizational measures',
      requirement: 'Privacy impact assessments for high-risk processing',
      implementation: 'manual',
      status: 'non-compliant',
      evidence: ['Privacy impact assessments', 'Technical documentation'],
      lastAssessed: '2025-06-12T00:00:00Z',
      riskLevel: 'high',
      remediationEffort: 'high',
      findings: ['Missing PIAs for 3 high-risk data flows', 'Data retention policies incomplete']
    }
  ]
};

const complianceAssessments = [
  {
    id: 'assess-soc2-2025-q2',
    frameworkId: 'soc2',
    name: 'SOC 2 Q2 2025 Assessment',
    scope: ['production', 'staging'],
    status: 'in-progress',
    startDate: '2025-06-01T00:00:00Z',
    targetDate: '2025-07-15T00:00:00Z',
    assessor: 'External Auditor - CyberSec Partners',
    progress: {
      total: 45,
      completed: 32,
      compliant: 28,
      nonCompliant: 4,
      inProgress: 13
    },
    findings: {
      critical: 1,
      high: 3,
      medium: 8,
      low: 12
    }
  },
  {
    id: 'assess-pci-2025',
    frameworkId: 'pci-dss',
    name: 'PCI DSS Annual Assessment 2025',
    scope: ['production'],
    status: 'scheduled',
    startDate: '2025-08-01T00:00:00Z',
    targetDate: '2025-09-30T00:00:00Z',
    assessor: 'Internal Security Team',
    progress: {
      total: 78,
      completed: 0,
      compliant: 0,
      nonCompliant: 0,
      inProgress: 0
    }
  }
];

const complianceReports = [
  {
    id: 'report-soc2-q1-2025',
    frameworkId: 'soc2',
    title: 'SOC 2 Type II Report Q1 2025',
    period: { start: '2025-01-01', end: '2025-03-31' },
    status: 'completed',
    overallRating: 'qualified',
    summary: {
      totalControls: 45,
      compliantControls: 41,
      exceptions: 4,
      managementResponses: 4
    },
    keyFindings: [
      'Exception: Insufficient logging retention for security events',
      'Exception: Manual access review process delays',
      'Management committed to automated access reviews by Q3 2025'
    ],
    generatedDate: '2025-04-15T00:00:00Z',
    expiryDate: '2026-04-15T00:00:00Z'
  }
];

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime()
  });
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

app.get('/api/infrastructure', (req, res) => {
  res.json(infrastructure);
});

// Cost Analysis API Endpoints
app.get('/api/cost-analysis', (req, res) => {
  res.json(costAnalysis);
});

app.get('/api/cost-analysis/summary', (req, res) => {
  res.json(costAnalysis.summary);
});

app.get('/api/cost-analysis/by-provider', (req, res) => {
  const { provider } = req.query;
  if (provider && costAnalysis.byProvider[provider]) {
    res.json({ [provider]: costAnalysis.byProvider[provider] });
  } else {
    res.json(costAnalysis.byProvider);
  }
});

app.get('/api/cost-analysis/trends', (req, res) => {
  const { period } = req.query; // 'last30days', 'forecast'
  if (period === 'forecast') {
    res.json(costAnalysis.trends.forecast);
  } else {
    res.json(costAnalysis.trends.last30Days);
  }
});

app.get('/api/cost-analysis/optimization', (req, res) => {
  const { provider } = req.query;
  if (provider) {
    const filteredRecommendations = costAnalysis.optimization.recommendations
      .filter(rec => rec.provider === provider);
    res.json({
      recommendations: filteredRecommendations,
      totalPotentialSavings: costAnalysis.optimization.totalPotentialSavings
    });
  } else {
    res.json(costAnalysis.optimization);
  }
});

app.get('/api/cost-analysis/budgets', (req, res) => {
  const { provider, status } = req.query;
  let budgets = costAnalysis.budgets;
  
  if (provider) {
    budgets = budgets.filter(budget => budget.provider === provider);
  }
  
  if (status) {
    budgets = budgets.filter(budget => budget.status === status);
  }
  
  res.json(budgets);
});

// Budget management
app.post('/api/cost-analysis/budgets', (req, res) => {
  const { name, provider, limit, period, alerts } = req.body;
  
  const newBudget = {
    id: `budget-${Date.now()}`,
    name,
    provider,
    limit,
    current: 0,
    utilization: 0,
    period,
    alerts: alerts || { warning: limit * 0.8, critical: limit * 0.9 },
    status: 'ok'
  };
  
  costAnalysis.budgets.push(newBudget);
  
  // Broadcast budget creation
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({
        type: 'budget-created',
        budget: newBudget,
        message: `New budget created: ${name}`
      }));
    }
  });
  
  res.json(newBudget);
});

app.put('/api/cost-analysis/budgets/:id', (req, res) => {
  const budget = costAnalysis.budgets.find(b => b.id === req.params.id);
  if (!budget) {
    return res.status(404).json({ error: 'Budget not found' });
  }
  
  Object.assign(budget, req.body);
  
  // Recalculate utilization and status
  budget.utilization = (budget.current / budget.limit) * 100;
  if (budget.utilization >= 95) budget.status = 'critical';
  else if (budget.utilization >= 80) budget.status = 'warning';
  else budget.status = 'ok';
  
  res.json(budget);
});

// Cost optimization recommendations
app.post('/api/cost-analysis/recommendations/:id/apply', (req, res) => {
  const recommendation = costAnalysis.optimization.recommendations
    .find(rec => rec.id === req.params.id);
    
  if (!recommendation) {
    return res.status(404).json({ error: 'Recommendation not found' });
  }
  
  // Simulate applying the recommendation
  recommendation.status = 'applied';
  recommendation.appliedAt = new Date().toISOString();
  
  // Update cost analysis with savings
  const provider = recommendation.provider;
  costAnalysis.byProvider[provider].dailyCost -= recommendation.potentialSavings.daily;
  costAnalysis.byProvider[provider].monthlyCost -= recommendation.potentialSavings.monthly;
  costAnalysis.summary.totalDailyCost -= recommendation.potentialSavings.daily;
  costAnalysis.summary.totalMonthlyCost -= recommendation.potentialSavings.monthly;
  
  // Broadcast cost optimization
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({
        type: 'cost-optimization-applied',
        recommendation: recommendation,
        savings: recommendation.potentialSavings,
        message: `Applied optimization: ${recommendation.description}`
      }));
    }
  });
  
  console.log(`💰 Cost Optimization Applied: ${recommendation.description} - Saving $${recommendation.potentialSavings.daily}/day`);
  
  res.json({
    success: true,
    recommendation: recommendation,
    newCostSummary: costAnalysis.summary
  });
});

// Cost alerts simulation
app.post('/api/cost-analysis/simulate-cost-spike', (req, res) => {
  const { provider, amount } = req.body;
  
  if (!costAnalysis.byProvider[provider]) {
    return res.status(400).json({ error: 'Invalid provider' });
  }
  
  // Simulate cost spike
  costAnalysis.byProvider[provider].dailyCost += amount;
  costAnalysis.byProvider[provider].monthlyCost += amount * 30;
  costAnalysis.summary.totalDailyCost += amount;
  costAnalysis.summary.totalMonthlyCost += amount * 30;
  
  // Check budget thresholds
  const affectedBudgets = costAnalysis.budgets.filter(b => b.provider === provider);
  affectedBudgets.forEach(budget => {
    const newCurrent = budget.current + (amount * 30);
    const newUtilization = (newCurrent / budget.limit) * 100;
    
    budget.current = newCurrent;
    budget.utilization = newUtilization;
    
    let alertType = null;
    if (newUtilization >= 95) {
      budget.status = 'critical';
      alertType = 'critical';
    } else if (newUtilization >= 80) {
      budget.status = 'warning';
      alertType = 'warning';
    }
    
    if (alertType) {
      const alert = {
        id: `cost-alert-${Date.now()}`,
        type: `budget_${alertType}`,
        provider: provider,
        message: `${provider.toUpperCase()} budget ${budget.name} at ${newUtilization.toFixed(1)}% utilization`,
        severity: alertType,
        threshold: alertType === 'critical' ? 95 : 80,
        current: newUtilization,
        createdAt: new Date().toISOString()
      };
      
      costAnalysis.alerts.push(alert);
      
      // Broadcast cost alert
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'cost-alert',
            alert: alert,
            budget: budget,
            message: `Cost alert: ${alert.message}`
          }));
        }
      });
    }
  });
  
  console.log(`📈 Cost Spike Simulated: ${provider.toUpperCase()} +$${amount}/day`);
  
  res.json({
    success: true,
    provider: provider,
    increase: amount,
    newCosts: costAnalysis.byProvider[provider],
    affectedBudgets: affectedBudgets
  });
});

// Compliance Checklist Generator API Endpoints
app.get('/api/compliance/frameworks', (req, res) => {
  res.json(Object.values(complianceFrameworks));
});

app.get('/api/compliance/frameworks/:id', (req, res) => {
  const framework = complianceFrameworks[req.params.id];
  if (!framework) {
    return res.status(404).json({ error: 'Framework not found' });
  }
  res.json(framework);
});

app.get('/api/compliance/controls/:frameworkId', (req, res) => {
  const { frameworkId } = req.params;
  const { category, status, riskLevel } = req.query;
  
  let controls = complianceControls[frameworkId] || [];
  
  if (category) {
    controls = controls.filter(control => control.category === category);
  }
  
  if (status) {
    controls = controls.filter(control => control.status === status);
  }
  
  if (riskLevel) {
    controls = controls.filter(control => control.riskLevel === riskLevel);
  }
  
  res.json(controls);
});

app.get('/api/compliance/assessments', (req, res) => {
  const { status, frameworkId } = req.query;
  let assessments = complianceAssessments;
  
  if (status) {
    assessments = assessments.filter(assessment => assessment.status === status);
  }
  
  if (frameworkId) {
    assessments = assessments.filter(assessment => assessment.frameworkId === frameworkId);
  }
  
  res.json(assessments);
});

app.get('/api/compliance/assessments/:id', (req, res) => {
  const assessment = complianceAssessments.find(a => a.id === req.params.id);
  if (!assessment) {
    return res.status(404).json({ error: 'Assessment not found' });
  }
  res.json(assessment);
});

app.get('/api/compliance/reports', (req, res) => {
  const { frameworkId, status } = req.query;
  let reports = complianceReports;
  
  if (frameworkId) {
    reports = reports.filter(report => report.frameworkId === frameworkId);
  }
  
  if (status) {
    reports = reports.filter(report => report.status === status);
  }
  
  res.json(reports);
});

// Generate automated compliance checklist
app.post('/api/compliance/generate-checklist', (req, res) => {
  const { frameworkId, scope, environment, assessmentType } = req.body;
  
  const framework = complianceFrameworks[frameworkId];
  if (!framework) {
    return res.status(400).json({ error: 'Invalid framework' });
  }
  
  // Filter controls based on environment and scope
  let applicableControls = complianceControls[frameworkId] || [];
  
  if (environment && !framework.applicableEnvironments.includes(environment)) {
    return res.status(400).json({ error: 'Framework not applicable to specified environment' });
  }
  
  // Generate checklist with prioritization
  const checklist = {
    id: `checklist-${frameworkId}-${Date.now()}`,
    frameworkId: frameworkId,
    frameworkName: framework.name,
    scope: scope || ['production'],
    environment: environment || 'production',
    assessmentType: assessmentType || 'internal',
    generatedDate: new Date().toISOString(),
    totalControls: applicableControls.length,
    estimatedEffort: calculateEstimatedEffort(applicableControls),
    priority: prioritizeControls(applicableControls),
    controls: applicableControls.map(control => ({
      ...control,
      assignedTo: assignControl(control),
      estimatedHours: estimateControlEffort(control),
      dependencies: findDependencies(control, applicableControls),
      automationPotential: assessAutomationPotential(control)
    })),
    timeline: generateTimeline(applicableControls),
    riskAssessment: assessRisks(applicableControls)
  };
  
  // Broadcast checklist generation
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({
        type: 'compliance-checklist-generated',
        checklist: checklist,
        message: `Compliance checklist generated for ${framework.name}`
      }));
    }
  });
  
  console.log(`📋 Compliance Checklist Generated: ${framework.name} (${checklist.totalControls} controls)`);
  
  res.json(checklist);
});

// Start compliance assessment
app.post('/api/compliance/assessments', (req, res) => {
  const { frameworkId, name, scope, assessor, targetDate } = req.body;
  
  const framework = complianceFrameworks[frameworkId];
  if (!framework) {
    return res.status(400).json({ error: 'Invalid framework' });
  }
  
  const newAssessment = {
    id: `assess-${frameworkId}-${Date.now()}`,
    frameworkId: frameworkId,
    name: name || `${framework.name} Assessment ${new Date().getFullYear()}`,
    scope: scope || ['production'],
    status: 'scheduled',
    startDate: new Date().toISOString(),
    targetDate: targetDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    assessor: assessor || 'Internal Team',
    progress: {
      total: framework.totalControls,
      completed: 0,
      compliant: 0,
      nonCompliant: 0,
      inProgress: 0
    },
    findings: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    }
  };
  
  complianceAssessments.push(newAssessment);
  
  // Broadcast assessment creation
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({
        type: 'compliance-assessment-created',
        assessment: newAssessment,
        message: `New compliance assessment created: ${newAssessment.name}`
      }));
    }
  });
  
  console.log(`🔍 Compliance Assessment Created: ${newAssessment.name}`);
  
  res.json(newAssessment);
});

// Update control status
app.put('/api/compliance/controls/:frameworkId/:controlId', (req, res) => {
  const { frameworkId, controlId } = req.params;
  const { status, findings, evidence, assignedTo } = req.body;
  
  const controls = complianceControls[frameworkId];
  if (!controls) {
    return res.status(404).json({ error: 'Framework not found' });
  }
  
  const control = controls.find(c => c.id === controlId);
  if (!control) {
    return res.status(404).json({ error: 'Control not found' });
  }
  
  // Update control
  if (status) control.status = status;
  if (findings) control.findings = findings;
  if (evidence) control.evidence = evidence;
  if (assignedTo) control.assignedTo = assignedTo;
  
  control.lastAssessed = new Date().toISOString();
  
  // Update assessment progress
  const activeAssessment = complianceAssessments.find(a => 
    a.frameworkId === frameworkId && a.status === 'in-progress'
  );
  
  if (activeAssessment) {
    updateAssessmentProgress(activeAssessment, frameworkId);
  }
  
  // Broadcast control update
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({
        type: 'compliance-control-updated',
        frameworkId: frameworkId,
        controlId: controlId,
        status: control.status,
        message: `Control ${controlId} updated: ${control.status}`
      }));
    }
  });
  
  console.log(`✅ Compliance Control Updated: ${controlId} -> ${control.status}`);
  
  res.json(control);
});

// Generate compliance report
app.post('/api/compliance/generate-report', (req, res) => {
  const { frameworkId, assessmentId, period } = req.body;
  
  const framework = complianceFrameworks[frameworkId];
  const assessment = complianceAssessments.find(a => a.id === assessmentId);
  
  if (!framework || !assessment) {
    return res.status(400).json({ error: 'Invalid framework or assessment' });
  }
  
  const controls = complianceControls[frameworkId] || [];
  const compliantControls = controls.filter(c => c.status === 'compliant').length;
  const nonCompliantControls = controls.filter(c => c.status === 'non-compliant').length;
  const partiallyCompliantControls = controls.filter(c => c.status === 'partially-compliant').length;
  
  const report = {
    id: `report-${frameworkId}-${Date.now()}`,
    frameworkId: frameworkId,
    assessmentId: assessmentId,
    title: `${framework.name} Compliance Report`,
    period: period || { 
      start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    status: 'draft',
    overallRating: calculateOverallRating(compliantControls, framework.totalControls),
    summary: {
      totalControls: framework.totalControls,
      compliantControls: compliantControls,
      nonCompliantControls: nonCompliantControls,
      partiallyCompliantControls: partiallyCompliantControls,
      exceptions: nonCompliantControls + partiallyCompliantControls,
      compliancePercentage: Math.round((compliantControls / framework.totalControls) * 100)
    },
    keyFindings: generateKeyFindings(controls),
    recommendations: generateRecommendations(controls),
    generatedDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  complianceReports.push(report);
  
  console.log(`📄 Compliance Report Generated: ${report.title} (${report.summary.compliancePercentage}% compliant)`);
  
  res.json(report);
});

// Helper functions for compliance processing
function calculateEstimatedEffort(controls) {
  const effortMap = { low: 2, medium: 8, high: 24 };
  return controls.reduce((total, control) => {
    return total + (effortMap[control.remediationEffort] || 8);
  }, 0);
}

function prioritizeControls(controls) {
  const priorityScore = (control) => {
    const riskWeight = { low: 1, medium: 3, high: 5 };
    const statusWeight = { compliant: 0, 'partially-compliant': 2, 'non-compliant': 3 };
    return (riskWeight[control.riskLevel] || 3) + (statusWeight[control.status] || 1);
  };
  
  return controls
    .sort((a, b) => priorityScore(b) - priorityScore(a))
    .slice(0, 10)
    .map(control => control.id);
}

function assignControl(control) {
  const assignments = {
    'Security': 'Security Team',
    'Network Security': 'Network Team',
    'Data Protection': 'Data Protection Officer',
    'Privacy by Design': 'Privacy Team',
    'Access Control': 'Identity Team'
  };
  return assignments[control.category] || 'Compliance Team';
}

function estimateControlEffort(control) {
  const baseEffort = { low: 4, medium: 12, high: 32 };
  const statusMultiplier = { compliant: 0.5, 'partially-compliant': 0.8, 'non-compliant': 1.0 };
  
  return Math.round(
    (baseEffort[control.remediationEffort] || 12) * 
    (statusMultiplier[control.status] || 1.0)
  );
}

function findDependencies(control, allControls) {
  // Simplified dependency detection based on categories
  return allControls
    .filter(c => c.category === control.category && c.id !== control.id)
    .slice(0, 2)
    .map(c => c.id);
}

function assessAutomationPotential(control) {
  const automatable = ['System Operations', 'Monitoring', 'Access Control'];
  return automatable.includes(control.category) ? 'high' : 'medium';
}

function generateTimeline(controls) {
  const phases = [
    { name: 'Planning', duration: 5, dependencies: [] },
    { name: 'Implementation', duration: 30, dependencies: ['Planning'] },
    { name: 'Testing', duration: 10, dependencies: ['Implementation'] },
    { name: 'Review', duration: 7, dependencies: ['Testing'] }
  ];
  return phases;
}

function assessRisks(controls) {
  const highRiskControls = controls.filter(c => c.riskLevel === 'high').length;
  const nonCompliantControls = controls.filter(c => c.status === 'non-compliant').length;
  
  return {
    overall: highRiskControls > 5 ? 'high' : nonCompliantControls > 3 ? 'medium' : 'low',
    factors: [
      `${highRiskControls} high-risk controls identified`,
      `${nonCompliantControls} non-compliant controls require attention`
    ]
  };
}

function updateAssessmentProgress(assessment, frameworkId) {
  const controls = complianceControls[frameworkId] || [];
  assessment.progress.completed = controls.filter(c => c.status !== 'not-assessed').length;
  assessment.progress.compliant = controls.filter(c => c.status === 'compliant').length;
  assessment.progress.nonCompliant = controls.filter(c => c.status === 'non-compliant').length;
  assessment.progress.inProgress = controls.filter(c => c.status === 'in-progress').length;
}

function calculateOverallRating(compliantControls, totalControls) {
  const percentage = (compliantControls / totalControls) * 100;
  if (percentage >= 95) return 'unqualified';
  if (percentage >= 85) return 'qualified';
  if (percentage >= 70) return 'qualified-with-exceptions';
  return 'adverse';
}

function generateKeyFindings(controls) {
  const findings = [];
  const nonCompliant = controls.filter(c => c.status === 'non-compliant');
  const highRisk = controls.filter(c => c.riskLevel === 'high' && c.status !== 'compliant');
  
  if (nonCompliant.length > 0) {
    findings.push(`${nonCompliant.length} non-compliant controls identified requiring immediate attention`);
  }
  
  if (highRisk.length > 0) {
    findings.push(`${highRisk.length} high-risk controls require priority remediation`);
  }
  
  return findings.slice(0, 5);
}

function generateRecommendations(controls) {
  const recommendations = [];
  const categories = [...new Set(controls.map(c => c.category))];
  
  categories.forEach(category => {
    const categoryControls = controls.filter(c => c.category === category);
    const nonCompliant = categoryControls.filter(c => c.status === 'non-compliant').length;
    
    if (nonCompliant > 0) {
      recommendations.push(`Address ${nonCompliant} non-compliant ${category} controls through targeted remediation`);
    }
  });
  
  return recommendations.slice(0, 5);
}

// Canary Deployment Simulation
app.post('/api/deployments/:id/simulate-canary', (req, res) => {
  const deployment = deployments.find(d => d.id === req.params.id);
  
  if (!deployment) {
    return res.status(404).json({ error: 'Deployment not found' });
  }
  
  if (deployment.strategy !== 'canary') {
    return res.status(400).json({ error: 'Deployment is not using canary strategy' });
  }
  
  const currentTraffic = deployment.traffic[deployment.traffic.length - 1];
  let nextPercentage = currentTraffic.percentage;
  
  if (nextPercentage < 100) {
    // Progress canary: 25% -> 50% -> 75% -> 100%
    if (nextPercentage === 25) nextPercentage = 50;
    else if (nextPercentage === 50) nextPercentage = 75;
    else if (nextPercentage === 75) nextPercentage = 100;
    
    const newTraffic = {
      timestamp: new Date().toISOString(),
      percentage: nextPercentage,
      status: nextPercentage === 100 ? 'stable' : 'progressing',
      metrics: {
        errorRate: Math.random() * 0.3,
        responseTime: 120 + Math.random() * 60,
        throughput: 1000 + Math.random() * 600,
        cpuUsage: 50 + Math.random() * 30,
        memoryUsage: 60 + Math.random() * 25
      }
    };
    
    deployment.traffic.push(newTraffic);
    
    if (nextPercentage === 100) {
      deployment.status = 'success';
      deployment.completedAt = new Date().toISOString();
    }
    
    // Broadcast WebSocket update
    const updateMessage = {
      type: 'canary-progression',
      deploymentId: deployment.id,
      traffic: newTraffic,
      message: nextPercentage === 100 ? 
        'Canary deployment completed successfully' : 
        `Canary traffic increased to ${nextPercentage}%`
    };
    
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(updateMessage));
      }
    });
    
    console.log(`🚀 Canary Update: ${deployment.id} -> ${nextPercentage}% traffic`);
  }
  
  res.json(deployment);
});

// Blue-Green Deployment Simulation
app.post('/api/deployments/:id/simulate-blue-green', (req, res) => {
  const deployment = deployments.find(d => d.id === req.params.id);
  
  if (!deployment) {
    return res.status(404).json({ error: 'Deployment not found' });
  }
  
  if (deployment.strategy !== 'blue-green') {
    return res.status(400).json({ error: 'Deployment is not using blue-green strategy' });
  }
  
  const { action } = req.body; // 'switch' or 'test'
  
  if (action === 'test') {
    // Test green environment
    deployment.blueGreenState.greenEnvironment.status = 'testing';
    deployment.status = 'testing';
    
    // Simulate health check results
    const testResults = {
      timestamp: new Date().toISOString(),
      environment: 'green',
      healthChecks: {
        readiness: Math.random() > 0.1,
        liveness: Math.random() > 0.05,
        performance: Math.random() > 0.15
      },
      metrics: {
        errorRate: Math.random() * 0.1,
        responseTime: 70 + Math.random() * 30,
        throughput: 800 + Math.random() * 200,
        cpuUsage: 35 + Math.random() * 15,
        memoryUsage: 40 + Math.random() * 20
      }
    };
    
    const allHealthy = Object.values(testResults.healthChecks).every(check => check);
    deployment.blueGreenState.greenEnvironment.status = allHealthy ? 'ready' : 'failed';
    deployment.status = allHealthy ? 'ready' : 'failed';
    
    // Broadcast update
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type: 'blue-green-test',
          deploymentId: deployment.id,
          results: testResults,
          message: allHealthy ? 'Green environment tests passed' : 'Green environment tests failed'
        }));
      }
    });
    
    console.log(`🧪 Blue-Green Test: ${deployment.id} -> ${allHealthy ? 'PASS' : 'FAIL'}`);
    
  } else if (action === 'switch') {
    // Switch traffic from blue to green
    if (deployment.blueGreenState.greenEnvironment.status !== 'ready') {
      return res.status(400).json({ error: 'Green environment is not ready for traffic switch' });
    }
    
    // Perform instant traffic switch
    deployment.blueGreenState.blueEnvironment.traffic = 0;
    deployment.blueGreenState.greenEnvironment.traffic = 100;
    deployment.blueGreenState.blueEnvironment.status = 'inactive';
    deployment.blueGreenState.greenEnvironment.status = 'active';
    deployment.status = 'success';
    deployment.completedAt = new Date().toISOString();
    
    const newTraffic = {
      timestamp: new Date().toISOString(),
      percentage: 100,
      status: 'stable',
      environment: 'green',
      metrics: {
        errorRate: 0.02 + Math.random() * 0.08,
        responseTime: 75 + Math.random() * 25,
        throughput: 850 + Math.random() * 150,
        cpuUsage: 40 + Math.random() * 15,
        memoryUsage: 45 + Math.random() * 15
      }
    };
    
    deployment.traffic.push(newTraffic);
    
    // Broadcast update
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type: 'blue-green-switch',
          deploymentId: deployment.id,
          traffic: newTraffic,
          message: 'Traffic switched to green environment successfully'
        }));
      }
    });
    
    console.log(`🔄 Blue-Green Switch: ${deployment.id} -> Green environment active`);
  }
  
  res.json(deployment);
});

// Rolling Deployment Simulation
app.post('/api/deployments/:id/simulate-rolling', (req, res) => {
  const deployment = deployments.find(d => d.id === req.params.id);
  
  if (!deployment) {
    return res.status(404).json({ error: 'Deployment not found' });
  }
  
  if (deployment.strategy !== 'rolling') {
    return res.status(400).json({ error: 'Deployment is not using rolling strategy' });
  }
  
  const rollingState = deployment.rollingState;
  
  if (rollingState.updatedPods < rollingState.totalPods) {
    // Progress rolling update
    const podsToUpdate = Math.min(rollingState.maxSurge, rollingState.totalPods - rollingState.updatedPods);
    rollingState.updatedPods += podsToUpdate;
    
    // Simulate pod readiness delay
    rollingState.readyPods = Math.min(rollingState.updatedPods - 1, rollingState.readyPods + podsToUpdate);
    rollingState.availablePods = Math.max(rollingState.totalPods - rollingState.maxUnavailable, rollingState.readyPods);
    rollingState.currentBatch = Math.ceil(rollingState.updatedPods / rollingState.maxSurge);
    
    const progressPercentage = Math.round((rollingState.updatedPods / rollingState.totalPods) * 100);
    
    const newTraffic = {
      timestamp: new Date().toISOString(),
      percentage: progressPercentage,
      status: rollingState.updatedPods === rollingState.totalPods ? 'stable' : 'progressing',
      metrics: {
        errorRate: 0.05 + Math.random() * 0.15,
        responseTime: 140 + Math.random() * 40,
        throughput: 2000 + Math.random() * 300,
        cpuUsage: 65 + Math.random() * 15,
        memoryUsage: 70 + Math.random() * 20
      }
    };
    
    deployment.traffic.push(newTraffic);
    
    if (rollingState.updatedPods === rollingState.totalPods) {
      rollingState.readyPods = rollingState.totalPods;
      rollingState.availablePods = rollingState.totalPods;
      deployment.status = 'success';
      deployment.completedAt = new Date().toISOString();
    }
    
    // Broadcast update
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type: 'rolling-progression',
          deploymentId: deployment.id,
          rollingState: rollingState,
          traffic: newTraffic,
          message: rollingState.updatedPods === rollingState.totalPods ? 
            'Rolling deployment completed successfully' : 
            `Rolling update: ${rollingState.updatedPods}/${rollingState.totalPods} pods updated`
        }));
      }
    });
    
    console.log(`📦 Rolling Update: ${deployment.id} -> ${rollingState.updatedPods}/${rollingState.totalPods} pods (${progressPercentage}%)`);
  }
  
  res.json(deployment);
});

// Rollback Simulation
app.post('/api/deployments/:id/rollback', (req, res) => {
  const deployment = deployments.find(d => d.id === req.params.id);
  
  if (!deployment) {
    return res.status(404).json({ error: 'Deployment not found' });
  }
  
  deployment.status = 'rolled_back';
  deployment.rollbackVersion = deployment.version;
  deployment.version = 'v2.1.2'; // Previous version
  deployment.completedAt = new Date().toISOString();
  
  // Reset traffic to 0%
  deployment.traffic.push({
    timestamp: new Date().toISOString(),
    percentage: 0,
    status: 'failed',
    metrics: {
      errorRate: 0,
      responseTime: 0,
      throughput: 0,
      cpuUsage: 0,
      memoryUsage: 0
    }
  });
  
  const rollbackMessage = {
    type: 'deployment-rollback',
    deploymentId: deployment.id,
    message: `Deployment rolled back to ${deployment.version}`,
    timestamp: new Date().toISOString()
  };
  
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(rollbackMessage));
    }
  });
  
  console.log(`🔄 Rollback: ${deployment.id} -> ${deployment.version}`);
  res.json(deployment);
});

// WebSocket Connection Handling
wss.on('connection', (ws) => {
  console.log('🔌 WebSocket client connected');
  
  ws.send(JSON.stringify({ 
    type: 'connection-established',
    message: 'DevOps Dashboard WebSocket active',
    timestamp: new Date().toISOString(),
    features: ['real-time-metrics', 'deployment-updates', 'alert-notifications']
  }));
  
  // Send periodic system metrics
  const metricsInterval = setInterval(() => {
    if (ws.readyState === 1) {
      const runningDeployments = deployments.filter(d => d.status === 'running');
      const activeAlerts = alerts.filter(a => a.status === 'active');
      
      ws.send(JSON.stringify({
        type: 'system-metrics',
        timestamp: new Date().toISOString(),
        data: {
          activeDeployments: runningDeployments.length,
          totalDeployments: deployments.length,
          activeAlerts: activeAlerts.length,
          totalAlerts: alerts.length,
          infrastructureHealth: Math.random() > 0.1 ? 'healthy' : 'degraded',
          totalCost: infrastructure.reduce((sum, infra) => sum + infra.cost.daily, 0)
        }
      }));
    }
  }, 5000);
  
  ws.on('close', () => {
    console.log('🔌 WebSocket client disconnected');
    clearInterval(metricsInterval);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 DevOps Pipeline Dashboard running on port', PORT);
  console.log('📡 WebSocket endpoint: ws://localhost:' + PORT + '/ws');
  console.log('🔧 API endpoints available:');
  console.log('   GET  /api/health - System health check');
  console.log('   GET  /api/pipelines - CI/CD pipeline status');
  console.log('   GET  /api/deployments - Deployment tracking');
  console.log('   GET  /api/alerts - Alert management');
  console.log('   GET  /api/infrastructure - Infrastructure monitoring');
  console.log('   GET  /api/cost-analysis - Complete cost analysis across providers');
  console.log('   GET  /api/cost-analysis/summary - Cost summary and totals');
  console.log('   GET  /api/cost-analysis/by-provider - Provider-specific cost breakdown');
  console.log('   GET  /api/cost-analysis/trends - Historical trends and forecasting');
  console.log('   GET  /api/cost-analysis/optimization - Cost optimization recommendations');
  console.log('   GET  /api/cost-analysis/budgets - Budget monitoring and alerts');
  console.log('   GET  /api/compliance/frameworks - Available compliance frameworks');
  console.log('   GET  /api/compliance/controls/:frameworkId - Framework-specific controls');
  console.log('   GET  /api/compliance/assessments - Compliance assessments and progress');
  console.log('   GET  /api/compliance/reports - Generated compliance reports');
  console.log('   POST /api/compliance/generate-checklist - Automated compliance checklist');
  console.log('   POST /api/compliance/assessments - Create new compliance assessment');
  console.log('   POST /api/compliance/generate-report - Generate compliance report');
  console.log('   POST /api/deployments/:id/simulate-canary - Canary progression (25%→50%→75%→100%)');
  console.log('   POST /api/deployments/:id/simulate-blue-green - Blue-green deployment (test/switch)');
  console.log('   POST /api/deployments/:id/simulate-rolling - Rolling update progression');
  console.log('   POST /api/cost-analysis/recommendations/:id/apply - Apply cost optimization');
  console.log('   POST /api/cost-analysis/simulate-cost-spike - Simulate cost increases');
  console.log('   POST /api/deployments/:id/rollback - Deployment rollback');
  console.log('');
  console.log('🔒 Automated compliance: SOC 2, PCI DSS, GDPR, HIPAA, ISO 27001 with checklist generation!');
});