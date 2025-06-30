import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

// Enums for pipeline states
export const PipelineStatus = z.enum([
  "pending",
  "running", 
  "success",
  "failed",
  "cancelled"
]);

export const DeploymentStrategy = z.enum([
  "canary",
  "blue-green",
  "rolling",
  "recreate"
]);

export const CloudProvider = z.enum([
  "aws",
  "gcp",
  "azure"
]);

export const Environment = z.enum([
  "development",
  "staging", 
  "production"
]);

// Core data models
export interface Pipeline {
  id: string;
  name: string;
  repository: string;
  branch: string;
  status: z.infer<typeof PipelineStatus>;
  environments: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PipelineRun {
  id: string;
  pipelineId: string;
  commitHash: string;
  commitMessage: string;
  author: string;
  status: z.infer<typeof PipelineStatus>;
  startedAt: Date;
  completedAt?: Date;
  stages: PipelineStage[];
}

export interface PipelineStage {
  id: string;
  runId: string;
  name: string;
  type: "ci" | "cd" | "test" | "security" | "deploy";
  status: z.infer<typeof PipelineStatus>;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  logs: string[];
  artifacts?: string[];
}

export interface Deployment {
  id: string;
  runId: string;
  environment: z.infer<typeof Environment>;
  cloudProvider: z.infer<typeof CloudProvider>;
  cluster: string;
  namespace: string;
  strategy: z.infer<typeof DeploymentStrategy>;
  status: z.infer<typeof PipelineStatus>;
  version: string;
  traffic: CanaryTraffic[];
  healthChecks: HealthCheck[];
  rollbackVersion?: string;
  startedAt: Date;
  completedAt?: Date;
}

export interface CanaryTraffic {
  timestamp: Date;
  percentage: number;
  status: "stable" | "progressing" | "failed";
  metrics: {
    errorRate: number;
    responseTime: number;
    throughput: number;
    cpuUsage: number;
    memoryUsage: number;
  };
}

export interface HealthCheck {
  id: string;
  deploymentId: string;
  type: "http" | "tcp" | "exec";
  endpoint?: string;
  status: "healthy" | "unhealthy" | "unknown";
  timestamp: Date;
  responseTime?: number;
  message?: string;
}

export interface Alert {
  id: string;
  deploymentId?: string;
  pipelineId?: string;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  status: "active" | "resolved" | "silenced";
  createdAt: Date;
  resolvedAt?: Date;
  tags: string[];
}

export interface Metrics {
  timestamp: Date;
  deploymentId: string;
  cpuUsage: number;
  memoryUsage: number;
  networkIn: number;
  networkOut: number;
  diskUsage: number;
  requestCount: number;
  errorCount: number;
  responseTime: number;
}

export interface Infrastructure {
  id: string;
  name: string;
  provider: z.infer<typeof CloudProvider>;
  region: string;
  type: "kubernetes" | "vm" | "serverless";
  status: "active" | "inactive" | "maintenance";
  resources: {
    cpu: number;
    memory: number;
    storage: number;
    nodes: number;
  };
  cost: {
    daily: number;
    monthly: number;
    currency: string;
  };
}

// Zod schemas for validation
export const pipelineSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  repository: z.string().url(),
  branch: z.string().min(1),
  status: PipelineStatus,
  environments: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const pipelineRunSchema = z.object({
  id: z.string(),
  pipelineId: z.string(),
  commitHash: z.string().length(40),
  commitMessage: z.string(),
  author: z.string(),
  status: PipelineStatus,
  startedAt: z.date(),
  completedAt: z.date().optional(),
  stages: z.array(z.any())
});

export const deploymentSchema = z.object({
  id: z.string(),
  runId: z.string(),
  environment: Environment,
  cloudProvider: CloudProvider,
  cluster: z.string(),
  namespace: z.string(),
  strategy: DeploymentStrategy,
  status: PipelineStatus,
  version: z.string(),
  traffic: z.array(z.any()),
  healthChecks: z.array(z.any()),
  rollbackVersion: z.string().optional(),
  startedAt: z.date(),
  completedAt: z.date().optional()
});

export const alertSchema = z.object({
  id: z.string(),
  deploymentId: z.string().optional(),
  pipelineId: z.string().optional(),
  severity: z.enum(["info", "warning", "critical"]),
  title: z.string(),
  message: z.string(),
  status: z.enum(["active", "resolved", "silenced"]),
  createdAt: z.date(),
  resolvedAt: z.date().optional(),
  tags: z.array(z.string())
});

// Insert schemas for forms
export const insertPipelineSchema = pipelineSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertDeploymentSchema = deploymentSchema.omit({ 
  id: true,
  traffic: true,
  healthChecks: true,
  startedAt: true,
  completedAt: true
});

export const insertAlertSchema = alertSchema.omit({ 
  id: true, 
  createdAt: true, 
  resolvedAt: true 
});

// Type exports
export type InsertPipeline = z.infer<typeof insertPipelineSchema>;
export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;
export type InsertAlert = z.infer<typeof insertAlertSchema>;