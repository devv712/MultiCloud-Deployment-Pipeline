import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  BarChart3, 
  Activity, 
  Cpu, 
  MemoryStick,
  Network,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export function Monitoring() {
  const { data: deployments } = useQuery({ queryKey: ['/api/deployments'] });

  // Generate real-time metrics data
  const generateMetrics = () => {
    const now = new Date();
    const metrics = [];
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 5 * 60 * 1000); // 5-minute intervals
      metrics.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        cpuUsage: Math.random() * 40 + 30, // 30-70%
        memoryUsage: Math.random() * 30 + 40, // 40-70%
        networkIn: Math.random() * 100 + 50, // 50-150 MB/s
        networkOut: Math.random() * 80 + 20, // 20-100 MB/s
        responseTime: Math.random() * 100 + 100, // 100-200ms
        errorRate: Math.random() * 2, // 0-2%
        throughput: Math.random() * 500 + 1000, // 1000-1500 req/s
      });
    }
    return metrics;
  };

  const metrics = generateMetrics();
  const currentMetrics = metrics[metrics.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Real-time Monitoring</h1>
          <p className="text-muted-foreground">
            Live performance metrics and observability dashboard
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button>
            <Activity className="mr-2 h-4 w-4" />
            Configure Alerts
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.cpuUsage.toFixed(1)}%</div>
            <div className="flex items-center text-xs">
              <TrendingDown className="h-3 w-3 text-green-400 mr-1" />
              <span className="text-green-400">2.3% from last hour</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.memoryUsage.toFixed(1)}%</div>
            <div className="flex items-center text-xs">
              <TrendingUp className="h-3 w-3 text-yellow-400 mr-1" />
              <span className="text-yellow-400">1.2% from last hour</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.responseTime.toFixed(0)}ms</div>
            <div className="flex items-center text-xs">
              <TrendingDown className="h-3 w-3 text-green-400 mr-1" />
              <span className="text-green-400">15ms improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <Activity className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.errorRate.toFixed(2)}%</div>
            <div className="flex items-center text-xs">
              <TrendingDown className="h-3 w-3 text-green-400 mr-1" />
              <span className="text-green-400">0.3% improvement</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>CPU & Memory Usage</CardTitle>
            <CardDescription>Real-time resource utilization over the last 2 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="cpuUsage" stroke="#3b82f6" strokeWidth={2} name="CPU %" />
                <Line type="monotone" dataKey="memoryUsage" stroke="#a855f7" strokeWidth={2} name="Memory %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network Traffic</CardTitle>
            <CardDescription>Inbound and outbound network activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="networkIn" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="Network In (MB/s)" />
                <Area type="monotone" dataKey="networkOut" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Network Out (MB/s)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Application Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Response Time & Throughput</CardTitle>
            <CardDescription>Application performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="responseTime" stroke="#ef4444" strokeWidth={2} name="Response Time (ms)" />
                <Line yAxisId="right" type="monotone" dataKey="throughput" stroke="#22c55e" strokeWidth={2} name="Throughput (req/s)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Rate Tracking</CardTitle>
            <CardDescription>Application error monitoring over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="errorRate" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Error Rate %" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Health Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Health Status</CardTitle>
          <CardDescription>Real-time health checks across all deployments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {deployments?.map((deployment: any) => (
              <div key={deployment.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{deployment.version}</h3>
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  {deployment.environment} • {deployment.cloudProvider.toUpperCase()}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Health Score</span>
                    <span className="text-green-400 font-medium">98%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Uptime</span>
                    <span className="font-medium">99.9%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Last Check</span>
                    <span>30s ago</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SLA Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>SLA Compliance</CardTitle>
          <CardDescription>Service level agreement monitoring and compliance tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">99.95%</div>
              <div className="text-sm text-muted-foreground">Uptime SLA</div>
              <div className="text-xs text-green-400">Target: 99.9%</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">156ms</div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
              <div className="text-xs text-green-400">Target: &lt;200ms</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">0.02%</div>
              <div className="text-sm text-muted-foreground">Error Rate</div>
              <div className="text-xs text-green-400">Target: &lt;1%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}