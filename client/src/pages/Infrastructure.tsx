import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Server, 
  Cloud, 
  Cpu, 
  HardDrive, 
  MemoryStick,
  DollarSign,
  TrendingUp,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getCloudProviderColor, formatCurrency } from '../lib/utils';

export function Infrastructure() {
  const { data: infrastructure, isLoading } = useQuery({ queryKey: ['/api/infrastructure'] });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalCost = infrastructure?.reduce((sum: number, infra: any) => sum + infra.cost.monthly, 0) || 0;
  const totalNodes = infrastructure?.reduce((sum: number, infra: any) => sum + infra.resources.nodes, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Infrastructure</h1>
          <p className="text-muted-foreground">
            Multi-cloud infrastructure monitoring and cost management
          </p>
        </div>
        <Button>
          <Cloud className="mr-2 h-4 w-4" />
          Add Cluster
        </Button>
      </div>

      {/* Infrastructure Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clusters</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{infrastructure?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Across all clouds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNodes}</div>
            <p className="text-xs text-muted-foreground">Active compute nodes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
            <p className="text-xs text-green-400">12% savings vs last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">87%</div>
            <p className="text-xs text-muted-foreground">Resource utilization</p>
          </CardContent>
        </Card>
      </div>

      {/* Infrastructure Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {infrastructure?.map((infra: any) => (
          <Card key={infra.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{infra.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${infra.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`} />
                  <div className={`px-2 py-1 rounded text-xs ${getCloudProviderColor(infra.provider)}`}>
                    {infra.provider.toUpperCase()}
                  </div>
                </div>
              </div>
              <CardDescription>{infra.region} • {infra.type}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Resource Usage */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-4 w-4 text-blue-400" />
                      <span className="text-sm">CPU Cores</span>
                    </div>
                    <div className="text-2xl font-bold">{infra.resources.cpu}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <MemoryStick className="h-4 w-4 text-purple-400" />
                      <span className="text-sm">Memory (GB)</span>
                    </div>
                    <div className="text-2xl font-bold">{infra.resources.memory}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <HardDrive className="h-4 w-4 text-green-400" />
                      <span className="text-sm">Storage (GB)</span>
                    </div>
                    <div className="text-2xl font-bold">{infra.resources.storage}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Server className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm">Nodes</span>
                    </div>
                    <div className="text-2xl font-bold">{infra.resources.nodes}</div>
                  </div>
                </div>

                {/* Cost Information */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Monthly Cost</span>
                    <span className="text-lg font-bold">{formatCurrency(infra.cost.monthly)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Daily Average</span>
                    <span className="text-sm">{formatCurrency(infra.cost.daily)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button size="sm" variant="outline">
                    <Activity className="h-3 w-3 mr-1" />
                    Monitor
                  </Button>
                  <Button size="sm" variant="outline">
                    Scale
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cost Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Analysis</CardTitle>
          <CardDescription>Monthly infrastructure costs by provider</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={infrastructure}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Bar dataKey="cost.monthly" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}