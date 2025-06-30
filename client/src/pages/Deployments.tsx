import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Rocket, 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatDate, getStatusColor, getCloudProviderColor, getEnvironmentColor, getStrategyColor, calculateHealthScore } from '../lib/utils';
import { apiRequest, queryClient } from '../lib/queryClient';

export function Deployments() {
  const { data: deployments, isLoading } = useQuery({ queryKey: ['/api/deployments'] });

  const simulateCanaryMutation = useMutation({
    mutationFn: (deploymentId: string) => 
      apiRequest(`/api/deployments/${deploymentId}/simulate-canary`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deployments'] });
    }
  });

  const rollbackMutation = useMutation({
    mutationFn: (deploymentId: string) => 
      apiRequest(`/api/deployments/${deploymentId}/rollback`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deployments'] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const runningDeployments = deployments?.filter((d: any) => d.status === 'running') || [];
  const completedDeployments = deployments?.filter((d: any) => d.status === 'success') || [];
  const failedDeployments = deployments?.filter((d: any) => d.status === 'failed') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Deployments</h1>
          <p className="text-muted-foreground">
            Multi-cloud canary deployments and rollback management
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Pause className="mr-2 h-4 w-4" />
            Pause All
          </Button>
          <Button>
            <Play className="mr-2 h-4 w-4" />
            New Deployment
          </Button>
        </div>
      </div>

      {/* Deployment Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deployments</CardTitle>
            <Activity className="h-4 w-4 text-blue-400 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{runningDeployments.length}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{completedDeployments.length}</div>
            <p className="text-xs text-muted-foreground">Completed today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{failedDeployments.length}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {deployments?.length ? Math.round((completedDeployments.length / deployments.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Deployments */}
      {runningDeployments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Canary Deployments</CardTitle>
            <CardDescription>
              Real-time monitoring of progressive deployments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {runningDeployments.map((deployment: any) => (
                <div key={deployment.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`h-3 w-3 rounded-full ${getStatusColor(deployment.status)} animate-pulse`} />
                      <div>
                        <h3 className="font-medium">{deployment.version}</h3>
                        <p className="text-sm text-muted-foreground">
                          {deployment.environment} • {deployment.cluster}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`px-2 py-1 rounded text-xs ${getCloudProviderColor(deployment.cloudProvider)}`}>
                        {deployment.cloudProvider.toUpperCase()}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${getStrategyColor(deployment.strategy)}`}>
                        {deployment.strategy}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => simulateCanaryMutation.mutate(deployment.id)}
                        disabled={simulateCanaryMutation.isPending}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Simulate
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rollbackMutation.mutate(deployment.id)}
                        disabled={rollbackMutation.isPending}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Rollback
                      </Button>
                    </div>
                  </div>
                  
                  {/* Canary Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Traffic Distribution</span>
                      <span>10% → 100%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="canary-progress h-2 rounded-full transition-all duration-500"
                        style={{ width: '25%' }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Started {formatDate(deployment.startedAt)}</span>
                      <span>Next stage in 2m 30s</span>
                    </div>
                  </div>

                  {/* Health Metrics */}
                  <div className="grid grid-cols-4 gap-4 pt-2 border-t">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">0.8%</div>
                      <div className="text-xs text-muted-foreground">Error Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">185ms</div>
                      <div className="text-xs text-muted-foreground">Response Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-400">45%</div>
                      <div className="text-xs text-muted-foreground">CPU Usage</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-400">62%</div>
                      <div className="text-xs text-muted-foreground">Memory</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deployment History */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment History</CardTitle>
          <CardDescription>Recent deployment activities across all environments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deployments?.map((deployment: any) => (
              <div key={deployment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`h-2 w-2 rounded-full ${getStatusColor(deployment.status)}`} />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{deployment.version}</span>
                      <div className={`px-2 py-1 rounded text-xs ${getEnvironmentColor(deployment.environment)}`}>
                        {deployment.environment}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${getStrategyColor(deployment.strategy)}`}>
                        {deployment.strategy}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {deployment.cluster} • {formatDate(deployment.startedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`px-2 py-1 rounded text-xs ${getCloudProviderColor(deployment.cloudProvider)}`}>
                    {deployment.cloudProvider.toUpperCase()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {deployment.completedAt ? 
                      `${Math.round((new Date(deployment.completedAt).getTime() - new Date(deployment.startedAt).getTime()) / 60000)}m` :
                      'Running'
                    }
                  </div>
                  {deployment.status === 'failed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rollbackMutation.mutate(deployment.id)}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deployment Analytics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Deployment Success Rate</CardTitle>
            <CardDescription>Success vs failure rate by environment</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Success', value: completedDeployments.length, fill: '#22c55e' },
                    { name: 'Failed', value: failedDeployments.length, fill: '#ef4444' },
                    { name: 'Running', value: runningDeployments.length, fill: '#3b82f6' },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deployment Duration Trends</CardTitle>
            <CardDescription>Average deployment time by strategy</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[
                { time: '1h', canary: 12, 'blue-green': 8, rolling: 15 },
                { time: '2h', canary: 11, 'blue-green': 9, rolling: 14 },
                { time: '3h', canary: 13, 'blue-green': 7, rolling: 16 },
                { time: '4h', canary: 10, 'blue-green': 8, rolling: 13 },
                { time: '5h', canary: 12, 'blue-green': 9, rolling: 15 },
                { time: '6h', canary: 11, 'blue-green': 8, rolling: 14 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="canary" stroke="#a855f7" strokeWidth={2} />
                <Line type="monotone" dataKey="blue-green" stroke="#06b6d4" strokeWidth={2} />
                <Line type="monotone" dataKey="rolling" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}