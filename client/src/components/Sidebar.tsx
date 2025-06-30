import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  GitBranch, 
  Rocket, 
  Server, 
  AlertTriangle, 
  BarChart3,
  Cloud,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Pipelines', href: '/pipelines', icon: GitBranch },
  { name: 'Deployments', href: '/deployments', icon: Rocket },
  { name: 'Infrastructure', href: '/infrastructure', icon: Server },
  { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
  { name: 'Monitoring', href: '/monitoring', icon: BarChart3 },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-border">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <Cloud className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-lg font-bold text-foreground">DevOps Hub</h1>
            <p className="text-xs text-muted-foreground">Multi-Cloud CI/CD</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                {item.name}
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-2 text-sm">
          <Activity className="h-4 w-4 text-green-400 animate-pulse" />
          <span className="text-muted-foreground">Real-time monitoring active</span>
        </div>
      </div>
    </div>
  );
}