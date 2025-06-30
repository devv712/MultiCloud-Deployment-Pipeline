import { 
  Pipeline, 
  PipelineRun, 
  PipelineStage, 
  Deployment, 
  CanaryTraffic, 
  HealthCheck, 
  Alert, 
  Metrics, 
  Infrastructure,
  InsertPipeline,
  InsertDeployment,
  InsertAlert
} from "../shared/schema";

export interface IStorage {
  // Pipeline operations
  getPipelines(): Promise<Pipeline[]>;
  getPipeline(id: string): Promise<Pipeline | null>;
  createPipeline(pipeline: InsertPipeline): Promise<Pipeline>;
  updatePipeline(id: string, updates: Partial<Pipeline>): Promise<Pipeline>;
  deletePipeline(id: string): Promise<void>;

  // Pipeline run operations
  getPipelineRuns(pipelineId?: string): Promise<PipelineRun[]>;
  getPipelineRun(id: string): Promise<PipelineRun | null>;
  createPipelineRun(run: Omit<PipelineRun, 'id'>): Promise<PipelineRun>;
  updatePipelineRun(id: string, updates: Partial<PipelineRun>): Promise<PipelineRun>;

  // Pipeline stage operations
  getPipelineStages(runId: string): Promise<PipelineStage[]>;
  updatePipelineStage(id: string, updates: Partial<PipelineStage>): Promise<PipelineStage>;

  // Deployment operations
  getDeployments(runId?: string): Promise<Deployment[]>;
  getDeployment(id: string): Promise<Deployment | null>;
  createDeployment(deployment: InsertDeployment): Promise<Deployment>;
  updateDeployment(id: string, updates: Partial<Deployment>): Promise<Deployment>;

  // Canary traffic operations
  getCanaryTraffic(deploymentId: string): Promise<CanaryTraffic[]>;
  addCanaryTraffic(deploymentId: string, traffic: Omit<CanaryTraffic, 'timestamp'>): Promise<CanaryTraffic>;

  // Health check operations
  getHealthChecks(deploymentId: string): Promise<HealthCheck[]>;
  addHealthCheck(check: Omit<HealthCheck, 'id' | 'timestamp'>): Promise<HealthCheck>;

  // Alert operations
  getAlerts(status?: string): Promise<Alert[]>;
  getAlert(id: string): Promise<Alert | null>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: string, updates: Partial<Alert>): Promise<Alert>;
  deleteAlert(id: string): Promise<void>;

  // Metrics operations
  getMetrics(deploymentId: string, timeframe?: { start: Date; end: Date }): Promise<Metrics[]>;
  addMetrics(metrics: Omit<Metrics, 'timestamp'>): Promise<Metrics>;

  // Infrastructure operations
  getInfrastructure(): Promise<Infrastructure[]>;
  getInfrastructureItem(id: string): Promise<Infrastructure | null>;
  updateInfrastructure(id: string, updates: Partial<Infrastructure>): Promise<Infrastructure>;
}

export class MemStorage implements IStorage {
  private pipelines: Map<string, Pipeline> = new Map();
  private pipelineRuns: Map<string, PipelineRun> = new Map();
  private pipelineStages: Map<string, PipelineStage> = new Map();
  private deployments: Map<string, Deployment> = new Map();
  private canaryTraffic: Map<string, CanaryTraffic[]> = new Map();
  private healthChecks: Map<string, HealthCheck[]> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private metrics: Map<string, Metrics[]> = new Map();
  private infrastructure: Map<string, Infrastructure> = new Map();

  constructor() {
    this.seedData();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private seedData(): void {
    // Seed pipelines
    const pipeline1: Pipeline = {
      id: 'pipe-1',
      name: 'E-Commerce Platform',
      repository: 'https://github.com/company/ecommerce-platform',
      branch: 'main',
      status: 'success',
      environments: ['development', 'staging', 'production'],
      createdAt: new Date('2025-06-20'),
      updatedAt: new Date('2025-06-29')
    };

    const pipeline2: Pipeline = {
      id: 'pipe-2',
      name: 'Payment Service',
      repository: 'https://github.com/company/payment-service',
      branch: 'develop',
      status: 'running',
      environments: ['staging', 'production'],
      createdAt: new Date('2025-06-15'),
      updatedAt: new Date('2025-06-29')
    };

    this.pipelines.set(pipeline1.id, pipeline1);
    this.pipelines.set(pipeline2.id, pipeline2);

    // Seed pipeline runs
    const run1: PipelineRun = {
      id: 'run-1',
      pipelineId: 'pipe-1',
      commitHash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
      commitMessage: 'feat: Add canary deployment support',
      author: 'john.doe@company.com',
      status: 'success',
      startedAt: new Date('2025-06-29T10:00:00Z'),
      completedAt: new Date('2025-06-29T10:45:00Z'),
      stages: []
    };

    const run2: PipelineRun = {
      id: 'run-2',
      pipelineId: 'pipe-2',
      commitHash: 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0a1',
      commitMessage: 'fix: Handle payment timeout edge cases',
      author: 'jane.smith@company.com',
      status: 'running',
      startedAt: new Date('2025-06-29T11:30:00Z'),
      stages: []
    };

    this.pipelineRuns.set(run1.id, run1);
    this.pipelineRuns.set(run2.id, run2);

    // Seed deployments
    const deployment1: Deployment = {
      id: 'deploy-1',
      runId: 'run-1',
      environment: 'production',
      cloudProvider: 'aws',
      cluster: 'prod-eks-cluster',
      namespace: 'ecommerce',
      strategy: 'canary',
      status: 'success',
      version: 'v2.1.0',
      traffic: [],
      healthChecks: [],
      startedAt: new Date('2025-06-29T10:30:00Z'),
      completedAt: new Date('2025-06-29T10:45:00Z')
    };

    const deployment2: Deployment = {
      id: 'deploy-2',
      runId: 'run-2',
      environment: 'staging',
      cloudProvider: 'gcp',
      cluster: 'staging-gke-cluster',
      namespace: 'payment',
      strategy: 'canary',
      status: 'running',
      version: 'v1.3.2',
      traffic: [],
      healthChecks: [],
      startedAt: new Date('2025-06-29T11:45:00Z')
    };

    this.deployments.set(deployment1.id, deployment1);
    this.deployments.set(deployment2.id, deployment2);

    // Seed infrastructure
    const infra1: Infrastructure = {
      id: 'infra-1',
      name: 'AWS EKS Production',
      provider: 'aws',
      region: 'us-west-2',
      type: 'kubernetes',
      status: 'active',
      resources: {
        cpu: 64,
        memory: 256,
        storage: 2000,
        nodes: 8
      },
      cost: {
        daily: 240.50,
        monthly: 7215.00,
        currency: 'USD'
      }
    };

    const infra2: Infrastructure = {
      id: 'infra-2',
      name: 'GCP GKE Staging',
      provider: 'gcp',
      region: 'us-central1',
      type: 'kubernetes',
      status: 'active',
      resources: {
        cpu: 32,
        memory: 128,
        storage: 1000,
        nodes: 4
      },
      cost: {
        daily: 120.25,
        monthly: 3607.50,
        currency: 'USD'
      }
    };

    this.infrastructure.set(infra1.id, infra1);
    this.infrastructure.set(infra2.id, infra2);

    // Seed alerts
    const alert1: Alert = {
      id: 'alert-1',
      deploymentId: 'deploy-2',
      severity: 'warning',
      title: 'High Error Rate Detected',
      message: 'Error rate increased to 3.2% during canary deployment',
      status: 'active',
      createdAt: new Date('2025-06-29T11:50:00Z'),
      tags: ['canary', 'error-rate', 'payment-service']
    };

    this.alerts.set(alert1.id, alert1);
  }

  // Pipeline operations
  async getPipelines(): Promise<Pipeline[]> {
    return Array.from(this.pipelines.values());
  }

  async getPipeline(id: string): Promise<Pipeline | null> {
    return this.pipelines.get(id) || null;
  }

  async createPipeline(pipeline: InsertPipeline): Promise<Pipeline> {
    const id = this.generateId();
    const now = new Date();
    const newPipeline: Pipeline = {
      ...pipeline,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.pipelines.set(id, newPipeline);
    return newPipeline;
  }

  async updatePipeline(id: string, updates: Partial<Pipeline>): Promise<Pipeline> {
    const existing = this.pipelines.get(id);
    if (!existing) throw new Error('Pipeline not found');
    
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.pipelines.set(id, updated);
    return updated;
  }

  async deletePipeline(id: string): Promise<void> {
    this.pipelines.delete(id);
  }

  // Pipeline run operations
  async getPipelineRuns(pipelineId?: string): Promise<PipelineRun[]> {
    const runs = Array.from(this.pipelineRuns.values());
    return pipelineId ? runs.filter(run => run.pipelineId === pipelineId) : runs;
  }

  async getPipelineRun(id: string): Promise<PipelineRun | null> {
    return this.pipelineRuns.get(id) || null;
  }

  async createPipelineRun(run: Omit<PipelineRun, 'id'>): Promise<PipelineRun> {
    const id = this.generateId();
    const newRun: PipelineRun = { ...run, id };
    this.pipelineRuns.set(id, newRun);
    return newRun;
  }

  async updatePipelineRun(id: string, updates: Partial<PipelineRun>): Promise<PipelineRun> {
    const existing = this.pipelineRuns.get(id);
    if (!existing) throw new Error('Pipeline run not found');
    
    const updated = { ...existing, ...updates };
    this.pipelineRuns.set(id, updated);
    return updated;
  }

  // Pipeline stage operations
  async getPipelineStages(runId: string): Promise<PipelineStage[]> {
    return Array.from(this.pipelineStages.values())
      .filter(stage => stage.runId === runId);
  }

  async updatePipelineStage(id: string, updates: Partial<PipelineStage>): Promise<PipelineStage> {
    const existing = this.pipelineStages.get(id);
    if (!existing) throw new Error('Pipeline stage not found');
    
    const updated = { ...existing, ...updates };
    this.pipelineStages.set(id, updated);
    return updated;
  }

  // Deployment operations
  async getDeployments(runId?: string): Promise<Deployment[]> {
    const deployments = Array.from(this.deployments.values());
    return runId ? deployments.filter(dep => dep.runId === runId) : deployments;
  }

  async getDeployment(id: string): Promise<Deployment | null> {
    return this.deployments.get(id) || null;
  }

  async createDeployment(deployment: InsertDeployment): Promise<Deployment> {
    const id = this.generateId();
    const newDeployment: Deployment = {
      ...deployment,
      id,
      traffic: [],
      healthChecks: [],
      startedAt: new Date()
    };
    this.deployments.set(id, newDeployment);
    return newDeployment;
  }

  async updateDeployment(id: string, updates: Partial<Deployment>): Promise<Deployment> {
    const existing = this.deployments.get(id);
    if (!existing) throw new Error('Deployment not found');
    
    const updated = { ...existing, ...updates };
    this.deployments.set(id, updated);
    return updated;
  }

  // Canary traffic operations
  async getCanaryTraffic(deploymentId: string): Promise<CanaryTraffic[]> {
    return this.canaryTraffic.get(deploymentId) || [];
  }

  async addCanaryTraffic(deploymentId: string, traffic: Omit<CanaryTraffic, 'timestamp'>): Promise<CanaryTraffic> {
    const newTraffic: CanaryTraffic = {
      ...traffic,
      timestamp: new Date()
    };
    
    const existing = this.canaryTraffic.get(deploymentId) || [];
    existing.push(newTraffic);
    this.canaryTraffic.set(deploymentId, existing);
    
    return newTraffic;
  }

  // Health check operations
  async getHealthChecks(deploymentId: string): Promise<HealthCheck[]> {
    return this.healthChecks.get(deploymentId) || [];
  }

  async addHealthCheck(check: Omit<HealthCheck, 'id' | 'timestamp'>): Promise<HealthCheck> {
    const newCheck: HealthCheck = {
      ...check,
      id: this.generateId(),
      timestamp: new Date()
    };
    
    const existing = this.healthChecks.get(check.deploymentId) || [];
    existing.push(newCheck);
    this.healthChecks.set(check.deploymentId, existing);
    
    return newCheck;
  }

  // Alert operations
  async getAlerts(status?: string): Promise<Alert[]> {
    const alerts = Array.from(this.alerts.values());
    return status ? alerts.filter(alert => alert.status === status) : alerts;
  }

  async getAlert(id: string): Promise<Alert | null> {
    return this.alerts.get(id) || null;
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const id = this.generateId();
    const newAlert: Alert = {
      ...alert,
      id,
      createdAt: new Date()
    };
    this.alerts.set(id, newAlert);
    return newAlert;
  }

  async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert> {
    const existing = this.alerts.get(id);
    if (!existing) throw new Error('Alert not found');
    
    const updated = { ...existing, ...updates };
    this.alerts.set(id, updated);
    return updated;
  }

  async deleteAlert(id: string): Promise<void> {
    this.alerts.delete(id);
  }

  // Metrics operations
  async getMetrics(deploymentId: string, timeframe?: { start: Date; end: Date }): Promise<Metrics[]> {
    const metrics = this.metrics.get(deploymentId) || [];
    if (timeframe) {
      return metrics.filter(m => 
        m.timestamp >= timeframe.start && m.timestamp <= timeframe.end
      );
    }
    return metrics;
  }

  async addMetrics(metrics: Omit<Metrics, 'timestamp'>): Promise<Metrics> {
    const newMetrics: Metrics = {
      ...metrics,
      timestamp: new Date()
    };
    
    const existing = this.metrics.get(metrics.deploymentId) || [];
    existing.push(newMetrics);
    this.metrics.set(metrics.deploymentId, existing);
    
    return newMetrics;
  }

  // Infrastructure operations
  async getInfrastructure(): Promise<Infrastructure[]> {
    return Array.from(this.infrastructure.values());
  }

  async getInfrastructureItem(id: string): Promise<Infrastructure | null> {
    return this.infrastructure.get(id) || null;
  }

  async updateInfrastructure(id: string, updates: Partial<Infrastructure>): Promise<Infrastructure> {
    const existing = this.infrastructure.get(id);
    if (!existing) throw new Error('Infrastructure not found');
    
    const updated = { ...existing, ...updates };
    this.infrastructure.set(id, updated);
    return updated;
  }
}