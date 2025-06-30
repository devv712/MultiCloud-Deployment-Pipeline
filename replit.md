# DevOps Monitoring Dashboard

## Overview

This repository contains a Streamlit-based DevOps monitoring dashboard that provides comprehensive insights into CI/CD pipelines, deployments, alerts, and canary deployments. The application is designed to simulate realistic DevOps monitoring scenarios with interactive visualizations and real-time data updates.

## System Architecture

The system follows a modular Streamlit application architecture:

### Frontend Architecture
- **Framework**: Streamlit for web-based dashboard interface
- **Visualization**: Plotly Express and Plotly Graph Objects for interactive charts
- **Layout**: Multi-page application with sidebar navigation
- **State Management**: Streamlit session state with caching for performance

### Backend Architecture
- **Data Layer**: Mock data generation with realistic patterns
- **Business Logic**: Metrics calculation engine
- **Structure**: Utility classes for data generation and metrics computation

### Key Design Decisions
- **Problem**: Need for realistic DevOps monitoring simulation
- **Solution**: Mock data generators with configurable patterns
- **Rationale**: Allows demonstration without requiring actual DevOps infrastructure
- **Pros**: Easy setup, controllable data patterns, no external dependencies
- **Cons**: Simulated data only, requires enhancement for production use

## Key Components

### Core Application (`app.py`)
- Main dashboard entry point
- Environment and time range filtering
- Auto-refresh functionality
- Data generator and metrics calculator initialization

### Page Modules
- **Pipeline Overview** (`pages/pipeline_overview.py`): CI/CD pipeline monitoring
- **Deployments** (`pages/deployments.py`): Deployment tracking and analysis
- **Alerts** (`pages/alerts.py`): Alert management and MTTR calculation
- **Canary Deployments** (`pages/canary.py`): Canary deployment monitoring

### Utility Layer
- **Data Generator** (`utils/data_generator.py`): Realistic mock data creation
- **Metrics Calculator** (`utils/metrics.py`): DevOps KPI calculations

## Data Flow

1. **User Interaction**: User selects environment and time range filters
2. **Data Generation**: Mock data generated based on realistic patterns
3. **Metrics Calculation**: KPIs computed from generated data
4. **Visualization**: Interactive charts and metrics displayed
5. **Real-time Updates**: Optional auto-refresh for live monitoring simulation

### Data Models
- **Pipeline Data**: Build status, duration, environment, timestamps
- **Deployment Data**: Service versions, environments, success rates
- **Alert Data**: Severity levels, status, resolution times
- **Canary Data**: Traffic splitting, version comparison, rollout progress

## External Dependencies

### Core Libraries
- **streamlit**: Web dashboard framework
- **pandas**: Data manipulation and analysis
- **plotly**: Interactive visualization library
- **numpy**: Numerical computing

### Visualization Stack
- Plotly Express for quick statistical charts
- Plotly Graph Objects for custom visualizations
- Streamlit native components for metrics and controls

## Deployment Strategy

### Current Setup
- Single-file Streamlit application
- Local development with `streamlit run app.py`
- No external database requirements

### Scalability Considerations
- **Problem**: Mock data limits real-world applicability
- **Future Enhancement**: Integration with actual CI/CD systems
- **Alternatives**: Database integration, API connections to Jenkins/GitLab/GitHub
- **Deployment Options**: Streamlit Cloud, Docker containers, cloud platforms

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

```
Changelog:
- June 30, 2025. Initial setup
```

## Architecture Notes

### Performance Optimizations
- Streamlit caching decorators for data generators
- Efficient pandas operations for data processing
- Lazy loading of visualizations

### Extensibility
- Modular page structure for easy feature addition
- Configurable data patterns in generators
- Pluggable metrics calculation system

### Monitoring Capabilities
- Real-time dashboard simulation
- Multiple environment support
- Comprehensive DevOps metrics (MTTR, deployment frequency, success rates)
- Alert management with severity classification
- Canary deployment progress tracking