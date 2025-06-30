import React from 'react';
import { Router, Route, Switch } from 'wouter';
import { useWebSocket } from './hooks/useWebSocket';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Pipelines } from './pages/Pipelines';
import { Deployments } from './pages/Deployments';
import { Infrastructure } from './pages/Infrastructure';
import { Alerts } from './pages/Alerts';
import { Monitoring } from './pages/Monitoring';

export default function App() {
  const { isConnected } = useWebSocket();

  return (
    <div className="min-h-screen bg-background dashboard-grid">
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header isConnected={isConnected} />
          <main className="flex-1 overflow-y-auto p-6">
            <Router>
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/pipelines" component={Pipelines} />
                <Route path="/deployments" component={Deployments} />
                <Route path="/infrastructure" component={Infrastructure} />
                <Route path="/alerts" component={Alerts} />
                <Route path="/monitoring" component={Monitoring} />
              </Switch>
            </Router>
          </main>
        </div>
      </div>
    </div>
  );
}