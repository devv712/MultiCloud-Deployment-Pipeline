import random
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any

class DataGenerator:
    """Generates realistic mock data for DevOps monitoring dashboard"""
    
    def __init__(self):
        self.pipeline_names = [
            "frontend-build", "backend-api", "database-migration", 
            "mobile-app", "auth-service", "payment-service",
            "notification-service", "data-pipeline", "ml-model-training"
        ]
        
        self.environments = ["development", "staging", "production"]
        
        self.alert_types = [
            "High CPU Usage", "Memory Leak", "Disk Space Low",
            "High Error Rate", "Slow Response Time", "Service Down",
            "Database Connection Failed", "Cache Miss Rate High"
        ]
        
        self.severities = ["low", "medium", "high", "critical"]
        
        # Realistic patterns for different times and environments
        self.success_rates = {
            "development": 0.85,
            "staging": 0.92,
            "production": 0.97
        }
    
    def generate_pipeline_data(self, hours: int, environment_filter: str = "All") -> List[Dict[str, Any]]:
        """Generate pipeline execution data"""
        data = []
        current_time = datetime.now()
        
        # Generate data points every 15-30 minutes
        time_interval = timedelta(minutes=random.randint(15, 30))
        
        for i in range(hours * 3):  # Approximate number of builds
            timestamp = current_time - timedelta(hours=hours) + (i * time_interval)
            
            # Randomly select environment
            if environment_filter == "All":
                env = random.choice(self.environments)
            else:
                env = environment_filter.lower()
            
            # Determine status based on environment success rate
            success_rate = self.success_rates.get(env, 0.9)
            status_rand = random.random()
            
            if status_rand < success_rate:
                status = "success"
            elif status_rand < success_rate + 0.05:
                status = "running"
            else:
                status = "failed"
            
            # Generate realistic build duration
            base_duration = random.uniform(5, 45)  # 5-45 minutes
            if status == "failed":
                base_duration *= random.uniform(0.3, 1.2)  # Failed builds might be shorter or longer
            
            pipeline_data = {
                "id": f"build-{i+1}",
                "pipeline_name": random.choice(self.pipeline_names),
                "environment": env,
                "status": status,
                "timestamp": timestamp,
                "duration": round(base_duration, 1),
                "commit_hash": f"{random.randint(1000000, 9999999):x}",
                "branch": random.choice(["main", "develop", "feature/new-ui", "hotfix/critical-bug"])
            }
            
            data.append(pipeline_data)
        
        return sorted(data, key=lambda x: x["timestamp"])
    
    def generate_deployment_data(self, hours: int, environment_filter: str = "All") -> List[Dict[str, Any]]:
        """Generate deployment data"""
        data = []
        current_time = datetime.now()
        
        # Deployments are less frequent than builds
        num_deployments = max(1, hours // 4)  # Roughly 1 deployment every 4 hours
        
        for i in range(num_deployments):
            timestamp = current_time - timedelta(hours=random.uniform(0, hours))
            
            if environment_filter == "All":
                env = random.choice(self.environments)
            else:
                env = environment_filter.lower()
            
            # Production deployments have higher success rate
            success_rate = 0.95 if env == "production" else 0.90
            status = "success" if random.random() < success_rate else "failed"
            
            deployment_data = {
                "id": f"deploy-{i+1}",
                "environment": env,
                "status": status,
                "timestamp": timestamp,
                "duration": round(random.uniform(2, 20), 1),  # 2-20 minutes
                "version": f"v{random.randint(1, 5)}.{random.randint(0, 20)}.{random.randint(0, 100)}",
                "service": random.choice(self.pipeline_names),
                "deployed_by": random.choice(["john.doe", "jane.smith", "bob.wilson", "alice.johnson"])
            }
            
            data.append(deployment_data)
        
        return sorted(data, key=lambda x: x["timestamp"])
    
    def generate_alert_data(self, hours: int, environment_filter: str = "All") -> List[Dict[str, Any]]:
        """Generate alert data"""
        data = []
        current_time = datetime.now()
        
        # Generate alerts with varying frequency
        num_alerts = random.randint(hours // 6, hours // 2)  # Variable alert frequency
        
        for i in range(num_alerts):
            timestamp = current_time - timedelta(hours=random.uniform(0, hours))
            
            if environment_filter == "All":
                env = random.choice(self.environments)
            else:
                env = environment_filter.lower()
            
            # 70% of alerts should be resolved
            status = "resolved" if random.random() < 0.7 else "active"
            
            severity = random.choices(
                self.severities,
                weights=[30, 40, 25, 5],  # Most alerts are low/medium severity
                k=1
            )[0]
            
            alert_data = {
                "id": f"alert-{i+1}",
                "type": random.choice(self.alert_types),
                "severity": severity,
                "environment": env,
                "status": status,
                "timestamp": timestamp,
                "service": random.choice(self.pipeline_names),
                "description": self._generate_alert_description(),
                "resolved_at": timestamp + timedelta(minutes=random.randint(5, 120)) if status == "resolved" else None
            }
            
            data.append(alert_data)
        
        return sorted(data, key=lambda x: x["timestamp"])
    
    def _generate_alert_description(self) -> str:
        """Generate realistic alert descriptions"""
        descriptions = [
            "CPU usage exceeded 85% for more than 5 minutes",
            "Memory usage reached 90% threshold",
            "Error rate increased to 8.5% in the last 10 minutes",
            "Response time exceeded 2000ms for critical endpoints",
            "Database connection pool exhausted",
            "Disk space usage above 90% on primary volume",
            "Service health check failed 3 consecutive times",
            "Cache hit ratio dropped below 70%",
            "SSL certificate expires in 7 days",
            "Unusual spike in 5xx HTTP errors detected"
        ]
        
        return random.choice(descriptions)
    
    def generate_metric_time_series(self, hours: int, metric_type: str) -> List[Dict[str, Any]]:
        """Generate time series data for specific metrics"""
        data = []
        current_time = datetime.now()
        
        # Generate data points every 5 minutes
        intervals = hours * 12
        
        for i in range(intervals):
            timestamp = current_time - timedelta(hours=hours) + (i * timedelta(minutes=5))
            
            if metric_type == "cpu":
                value = np.random.normal(45, 15)  # Average 45% CPU
                value = max(0, min(100, value))  # Clamp between 0-100
            elif metric_type == "memory":
                value = np.random.normal(60, 20)  # Average 60% memory
                value = max(0, min(100, value))
            elif metric_type == "response_time":
                value = np.random.lognormal(5.5, 0.5)  # Log-normal distribution for response times
                value = max(50, min(5000, value))
            elif metric_type == "error_rate":
                value = np.random.exponential(1.5)  # Most values near 0, occasional spikes
                value = max(0, min(20, value))
            else:
                value = np.random.uniform(0, 100)
            
            data.append({
                "timestamp": timestamp,
                "value": round(value, 2),
                "metric_type": metric_type
            })
        
        return data
