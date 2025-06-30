import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'success':
      return 'status-success';
    case 'running':
      return 'status-running';
    case 'failed':
      return 'status-failed';
    case 'pending':
      return 'status-pending';
    case 'cancelled':
      return 'status-cancelled';
    default:
      return 'status-pending';
  }
}

export function getCloudProviderColor(provider: string): string {
  switch (provider) {
    case 'aws':
      return 'cloud-aws';
    case 'gcp':
      return 'cloud-gcp';
    case 'azure':
      return 'cloud-azure';
    default:
      return 'cloud-aws';
  }
}

export function getEnvironmentColor(environment: string): string {
  switch (environment) {
    case 'production':
      return 'env-production';
    case 'staging':
      return 'env-staging';
    case 'development':
      return 'env-development';
    default:
      return 'env-development';
  }
}

export function getStrategyColor(strategy: string): string {
  switch (strategy) {
    case 'canary':
      return 'strategy-canary';
    case 'blue-green':
      return 'strategy-blue-green';
    case 'rolling':
      return 'strategy-rolling';
    case 'recreate':
      return 'strategy-recreate';
    default:
      return 'strategy-canary';
  }
}

export function getAlertSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'alert-critical';
    case 'warning':
      return 'alert-warning';
    case 'info':
      return 'alert-info';
    default:
      return 'alert-info';
  }
}

export function generateCommitHash(): string {
  return Math.random().toString(36).substr(2, 40).padEnd(40, '0');
}

export function truncateHash(hash: string): string {
  return hash.substring(0, 8);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function calculateHealthScore(metrics: any): number {
  if (!metrics) return 0;
  
  const errorRateScore = Math.max(0, 100 - (metrics.errorRate * 20));
  const responseTimeScore = Math.max(0, 100 - ((metrics.responseTime - 100) / 10));
  const cpuScore = Math.max(0, 100 - metrics.cpuUsage);
  const memoryScore = Math.max(0, 100 - metrics.memoryUsage);
  
  return Math.round((errorRateScore + responseTimeScore + cpuScore + memoryScore) / 4);
}