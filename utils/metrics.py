import pandas as pd
import numpy as np
from typing import List, Dict, Any

class MetricsCalculator:
    """Calculate various DevOps metrics from pipeline and deployment data"""
    
    def calculate_success_rate(self, pipeline_data: List[Dict[str, Any]]) -> float:
        """Calculate build success rate"""
        if not pipeline_data:
            return 0.0
        
        df = pd.DataFrame(pipeline_data)
        successful_builds = len(df[df['status'] == 'success'])
        total_builds = len(df)
        
        return (successful_builds / total_builds) * 100 if total_builds > 0 else 0.0
    
    def calculate_deployment_frequency(self, deployment_data: List[Dict[str, Any]]) -> float:
        """Calculate deployment frequency per day"""
        if not deployment_data:
            return 0.0
        
        df = pd.DataFrame(deployment_data)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Calculate time span in days
        time_span = (df['timestamp'].max() - df['timestamp'].min()).total_seconds() / (24 * 3600)
        time_span = max(time_span, 1)  # Minimum 1 day
        
        return len(df) / time_span
    
    def calculate_average_duration(self, pipeline_data: List[Dict[str, Any]]) -> float:
        """Calculate average build duration"""
        if not pipeline_data:
            return 0.0
        
        df = pd.DataFrame(pipeline_data)
        return df['duration'].mean()
    
    def calculate_lead_time(self, pipeline_data: List[Dict[str, Any]], deployment_data: List[Dict[str, Any]]) -> float:
        """Calculate lead time from commit to deployment"""
        # This is a simplified calculation
        # In real scenarios, you'd track from commit timestamp to deployment
        if not pipeline_data or not deployment_data:
            return 0.0
        
        pipeline_df = pd.DataFrame(pipeline_data)
        deployment_df = pd.DataFrame(deployment_data)
        
        avg_build_time = pipeline_df['duration'].mean()
        avg_deploy_time = deployment_df['duration'].mean()
        
        # Simplified lead time calculation
        return avg_build_time + avg_deploy_time + np.random.uniform(30, 120)  # Add some waiting time
    
    def calculate_mttr(self, alert_data: List[Dict[str, Any]]) -> float:
        """Calculate Mean Time To Recovery (MTTR)"""
        if not alert_data:
            return 0.0
        
        df = pd.DataFrame(alert_data)
        resolved_alerts = df[df['status'] == 'resolved'].copy()
        
        if len(resolved_alerts) == 0:
            return 0.0
        
        resolved_alerts['timestamp'] = pd.to_datetime(resolved_alerts['timestamp'])
        resolved_alerts['resolved_at'] = pd.to_datetime(resolved_alerts['resolved_at'])
        
        # Calculate resolution time in minutes
        resolved_alerts['resolution_time'] = (
            resolved_alerts['resolved_at'] - resolved_alerts['timestamp']
        ).dt.total_seconds() / 60
        
        return resolved_alerts['resolution_time'].mean()
    
    def calculate_change_failure_rate(self, deployment_data: List[Dict[str, Any]]) -> float:
        """Calculate change failure rate"""
        if not deployment_data:
            return 0.0
        
        df = pd.DataFrame(deployment_data)
        failed_deployments = len(df[df['status'] == 'failed'])
        total_deployments = len(df)
        
        return (failed_deployments / total_deployments) * 100 if total_deployments > 0 else 0.0
    
    def calculate_availability(self, alert_data: List[Dict[str, Any]], hours: int) -> float:
        """Calculate system availability percentage"""
        if not alert_data:
            return 99.9  # Assume high availability if no alerts
        
        df = pd.DataFrame(alert_data)
        critical_alerts = df[df['severity'] == 'critical']
        
        if len(critical_alerts) == 0:
            return 99.9
        
        # Simplified calculation: assume each critical alert means 30 minutes downtime
        total_downtime_minutes = len(critical_alerts) * 30
        total_minutes = hours * 60
        
        uptime_percentage = ((total_minutes - total_downtime_minutes) / total_minutes) * 100
        return max(uptime_percentage, 95.0)  # Minimum 95% availability
    
    def get_environment_health_score(self, pipeline_data: List[Dict[str, Any]], 
                                   deployment_data: List[Dict[str, Any]], 
                                   alert_data: List[Dict[str, Any]], 
                                   environment: str) -> Dict[str, float]:
        """Calculate overall health score for an environment"""
        
        # Filter data for specific environment
        env_pipelines = [p for p in pipeline_data if p['environment'] == environment.lower()]
        env_deployments = [d for d in deployment_data if d['environment'] == environment.lower()]
        env_alerts = [a for a in alert_data if a['environment'] == environment.lower()]
        
        # Calculate component scores
        build_success_rate = self.calculate_success_rate(env_pipelines)
        deployment_success_rate = 100 - self.calculate_change_failure_rate(env_deployments)
        
        # Alert score (fewer alerts = higher score)
        active_alerts = len([a for a in env_alerts if a['status'] == 'active'])
        alert_score = max(0, 100 - (active_alerts * 10))  # Each active alert reduces score by 10
        
        # Overall health score (weighted average)
        health_score = (
            build_success_rate * 0.4 +
            deployment_success_rate * 0.3 +
            alert_score * 0.3
        )
        
        return {
            "overall_health": round(health_score, 1),
            "build_success_rate": round(build_success_rate, 1),
            "deployment_success_rate": round(deployment_success_rate, 1),
            "alert_score": round(alert_score, 1)
        }
