import { useEffect, useRef, useState } from 'react';
import { queryClient } from '@/lib/queryClient';

interface WebSocketMessage {
  type: string;
  data?: any;
  deploymentId?: string;
  id?: string;
  message?: string;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      console.log('Connected to WebSocket');
    };

    ws.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        setLastMessage(message);
        
        // Handle different message types and invalidate appropriate queries
        switch (message.type) {
          case 'pipeline_created':
          case 'pipeline_updated':
          case 'pipeline_deleted':
            queryClient.invalidateQueries({ queryKey: ['/api/pipelines'] });
            break;
            
          case 'pipeline_run_created':
          case 'pipeline_run_updated':
            queryClient.invalidateQueries({ queryKey: ['/api/pipeline-runs'] });
            break;
            
          case 'deployment_created':
          case 'deployment_updated':
          case 'deployment_completed':
          case 'deployment_rollback':
            queryClient.invalidateQueries({ queryKey: ['/api/deployments'] });
            if (message.deploymentId) {
              queryClient.invalidateQueries({ 
                queryKey: ['/api/deployments', message.deploymentId] 
              });
            }
            break;
            
          case 'canary_traffic_updated':
          case 'canary_progressed':
          case 'canary_failed':
            if (message.deploymentId) {
              queryClient.invalidateQueries({ 
                queryKey: ['/api/deployments', message.deploymentId, 'canary-traffic'] 
              });
            }
            break;
            
          case 'health_check_updated':
            if (message.deploymentId) {
              queryClient.invalidateQueries({ 
                queryKey: ['/api/deployments', message.deploymentId, 'health-checks'] 
              });
            }
            break;
            
          case 'alert_created':
          case 'alert_updated':
          case 'alert_deleted':
            queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
            break;
            
          case 'metrics_updated':
            if (message.deploymentId) {
              queryClient.invalidateQueries({ 
                queryKey: ['/api/deployments', message.deploymentId, 'metrics'] 
              });
            }
            break;
            
          case 'infrastructure_updated':
            queryClient.invalidateQueries({ queryKey: ['/api/infrastructure'] });
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      console.log('Disconnected from WebSocket');
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    lastMessage,
    sendMessage: (message: any) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(message));
      }
    }
  };
}