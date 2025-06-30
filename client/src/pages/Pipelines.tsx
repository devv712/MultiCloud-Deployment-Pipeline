import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  GitBranch, 
  Play, 
  Pause, 
  Settings, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { formatDate, getStatusColor } from '../lib/utils';

export function Pipelines() {
  const { data: pipelines, isLoading } = useQuery({ queryKey: ['/api/pipelines'] });
  const { data: pipelineRuns } = useQuery({ queryKey: ['/api/pipeline-runs'] });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CI/CD Pipelines</h1>
          <p className="text-muted-foreground">
            Multi-cloud continuous integration and deployment pipelines
          </p>
        </div>
        <Button>
          <Play className="mr-2 h-4 w-4" />
          Create Pipeline
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pipelines?.map((pipeline: any) => (
          <Card key={pipeline.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{pipeline.name}</CardTitle>
                <div className={`h-2 w-2 rounded-full ${getStatusColor(pipeline.status)}`} />
              </div>
              <CardDescription>{pipeline.repository}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Branch:</span>
                  <code className="bg-muted px-2 py-1 rounded">{pipeline.branch}</code>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Environments:</span>
                  <span>{pipeline.environments.join(', ')}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Last Updated:</span>
                  <span>{formatDate(pipeline.updatedAt)}</span>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button size="sm" variant="outline">
                    <Settings className="h-3 w-3" />
                  </Button>
                  <Button size="sm">
                    <Play className="h-3 w-3 mr-1" />
                    Run
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Pipeline Runs</CardTitle>
          <CardDescription>Latest execution history across all pipelines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pipelineRuns?.map((run: any) => (
              <div key={run.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`h-2 w-2 rounded-full ${getStatusColor(run.status)}`} />
                  <div>
                    <div className="font-medium">{run.commitMessage}</div>
                    <div className="text-sm text-muted-foreground">
                      {run.author} • {run.commitHash.substring(0, 8)}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(run.startedAt)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}