import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  GitBranch, 
  Rocket, 
  Server, 
  AlertTriangle, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Pause
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatDate, getStatusColor, getCloudProviderColor } from '../lib/utils';

export function Dashboard() {
  const { data: pipelines } = useQuery({ queryKey: ['/api/pipelines'] });
  const { data: deployments } = useQuery({ queryKey: ['/api/deployments'] });
  const { data: alerts } = useQuery({ queryKey: ['/api/alerts'] });
  const { data: infrastructure } = useQuery({ queryKey: ['/api/infrastructure'] });

  const stats = {
    totalPipelines: pipelines?.length || 0,
    activePipelines: pipelines?.filter((p: any) => p.status === 'running').length || 0,
    successfulDeployments: deployments?.filter((d: any) => d.status === 'success').length || 0,
    activeAlerts: alerts?.filter((a: any) => a.status === 'active').length || 0,
  };

  const deploymentTrends = [
    { name: 'Mon', deployments: 12, success: 11, failed: 1 },
    { name: 'Tue', deployments: 19, success: 17, failed: 2 },
    { name: 'Wed', deployments: 15, success: 14, failed: 1 },
    { name: 'Thu', deployments: 22, success: 20, failed: 2 },
    { name: 'Fri', deployments: 18, success: 16, failed: 2 },
    { name: 'Sat', deployments: 8, success: 8, failed: 0 },
    { name: 'Sun', deployments: 6, success: 6, failed: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">DevOps Dashboard</h1>
          <p className="text-muted-foreground">
            Multi-cloud CI/CD pipeline monitoring and observability
          </p>
        </div>
        <Button>
          <Play className="mr-2 h-4 w-4" />
          Trigger Deployment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pipelines</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPipelines}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activePipelines} currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployments Today</CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successfulDeployments}</div>
            <p className="text-xs text-green-400">
              98.5% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Infrastructure</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{infrastructure?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active clusters
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{stats.activeAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Deployment Trends</CardTitle>
            <CardDescription>
              Weekly deployment success and failure rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deploymentTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="success" fill="#22c55e" />
                <Bar dataKey="failed" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline Performance</CardTitle>
            <CardDescription>
              Average build times across environments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[
                { time: '00:00', dev: 4.2, staging: 6.8, prod: 12.1 },
                { time: '04:00', dev: 3.8, staging: 5.9, prod: 11.4 },
                { time: '08:00', dev: 5.1, staging: 7.2, prod: 13.8 },
                { time: '12:00', dev: 4.7, staging: 6.5, prod: 12.9 },
                { time: '16:00', dev: 4.3, staging: 6.1, prod: 11.7 },
                { time: '20:00', dev: 3.9, staging: 5.8, prod: 10.9 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="dev" stroke="#22c55e" strokeWidth={2} />
                <Line type="monotone" dataKey="staging" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="prod" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Deployments</CardTitle>
            <CardDescription>Latest deployment activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deployments?.slice(0, 5).map((deployment: any) => (
                <div key={deployment.id} className="flex items-center space-x-3">
                  <div className={`h-2 w-2 rounded-full ${getStatusColor(deployment.status)}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{deployment.environment}</p>
                    <p className="text-xs text-muted-foreground">
                      {deployment.version} • {deployment.strategy}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${getCloudProviderColor(deployment.cloudProvider)}`}>
                    {deployment.cloudProvider.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Infrastructure Status</CardTitle>
            <CardDescription>Multi-cloud infrastructure overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {infrastructure?.map((infra: any) => (
                <div key={infra.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`h-2 w-2 rounded-full ${infra.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`} />
                    <div>
                      <p className="text-sm font-medium">{infra.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {infra.region} • {infra.resources.nodes} nodes
                      </p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${getCloudProviderColor(infra.provider)}`}>
                    {infra.provider.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}