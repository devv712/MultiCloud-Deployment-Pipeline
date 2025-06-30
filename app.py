import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import numpy as np
from utils.data_generator import DataGenerator
from utils.metrics import MetricsCalculator
from pages.pipeline_overview import show_pipeline_overview
from pages.deployments import show_deployments
from pages.alerts import show_alerts
from pages.canary import show_canary_deployments

# Page configuration
st.set_page_config(
    page_title="DevOps Monitoring Dashboard",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize data generator and metrics calculator
@st.cache_resource
def get_data_generator():
    return DataGenerator()

@st.cache_resource
def get_metrics_calculator():
    return MetricsCalculator()

data_gen = get_data_generator()
metrics_calc = get_metrics_calculator()

# Sidebar navigation
st.sidebar.title("🚀 DevOps Dashboard")
st.sidebar.markdown("---")

# Environment selector
selected_env = st.sidebar.selectbox(
    "Environment",
    ["All", "Production", "Staging", "Development"],
    index=0
)

# Time range selector
time_range = st.sidebar.selectbox(
    "Time Range",
    ["Last 24 Hours", "Last 7 Days", "Last 30 Days"],
    index=1
)

# Auto-refresh toggle
auto_refresh = st.sidebar.checkbox("Auto Refresh (30s)", value=False)

st.sidebar.markdown("---")

# Navigation
page = st.sidebar.radio(
    "Navigate to:",
    ["Overview", "Pipeline Status", "Deployments", "Alerts", "Canary Deployments"]
)

# Auto-refresh functionality (disabled to prevent infinite loops)
# if auto_refresh:
#     st.rerun()

# Main content area
st.title("DevOps Monitoring Dashboard")
st.markdown(f"**Environment:** {selected_env} | **Time Range:** {time_range}")

# Debug information
st.write(f"Debug: Current page selected = '{page}'")

# Generate data based on selections
if time_range == "Last 24 Hours":
    hours = 24
elif time_range == "Last 7 Days":
    hours = 24 * 7
else:
    hours = 24 * 30

pipeline_data = data_gen.generate_pipeline_data(hours, selected_env)
deployment_data = data_gen.generate_deployment_data(hours, selected_env)
alert_data = data_gen.generate_alert_data(hours, selected_env)

st.write(f"Debug: Generated {len(pipeline_data)} pipeline records, {len(deployment_data)} deployments, {len(alert_data)} alerts")

if page == "Overview":
    # Key metrics row
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        success_rate = metrics_calc.calculate_success_rate(pipeline_data)
        st.metric(
            "Build Success Rate",
            f"{success_rate:.1f}%",
            delta=f"{np.random.uniform(-2, 3):.1f}%"
        )
    
    with col2:
        deploy_freq = metrics_calc.calculate_deployment_frequency(deployment_data)
        st.metric(
            "Deployments/Day",
            f"{deploy_freq:.1f}",
            delta=f"{np.random.uniform(-0.5, 1.2):.1f}"
        )
    
    with col3:
        avg_duration = metrics_calc.calculate_average_duration(pipeline_data)
        st.metric(
            "Avg Build Time",
            f"{avg_duration:.1f}m",
            delta=f"{np.random.uniform(-2, 1):.1f}m"
        )
    
    with col4:
        active_alerts = len([a for a in alert_data if a['status'] == 'active'])
        st.metric(
            "Active Alerts",
            str(active_alerts),
            delta=f"{np.random.randint(-2, 3)}"
        )
    
    st.markdown("---")
    
    # Charts row
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Build Success Rate Trend")
        df = pd.DataFrame(pipeline_data)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Group by hour and calculate success rate
        hourly_data = df.groupby(pd.Grouper(key='timestamp', freq='h')).agg({
            'status': lambda x: (x == 'success').mean() * 100
        }).reset_index()
        
        fig = px.line(
            hourly_data, 
            x='timestamp', 
            y='status',
            title="Hourly Success Rate",
            labels={'status': 'Success Rate (%)', 'timestamp': 'Time'}
        )
        fig.update_layout(height=400)
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.subheader("Pipeline Status Distribution")
        status_counts = df['status'].value_counts()
        
        fig = px.pie(
            values=status_counts.values,
            names=status_counts.index,
            title="Build Status Distribution"
        )
        fig.update_layout(height=400)
        st.plotly_chart(fig, use_container_width=True)
    
    # Recent activity
    st.subheader("Recent Pipeline Activity")
    recent_pipelines = df.sort_values('timestamp', ascending=False).head(10)
    
    for _, pipeline in recent_pipelines.iterrows():
        status_color = "🟢" if pipeline['status'] == 'success' else "🔴" if pipeline['status'] == 'failed' else "🟡"
        timestamp_dt = pd.to_datetime(pipeline['timestamp'])
        timestamp_str = timestamp_dt.strftime('%H:%M:%S')
        st.write(f"{status_color} **{pipeline['pipeline_name']}** - {pipeline['environment']} - {timestamp_str} - {pipeline['duration']:.1f}m")

elif page == "Pipeline Status":
    st.write("Debug: Entering Pipeline Status page")
    try:
        show_pipeline_overview(pipeline_data, metrics_calc)
    except Exception as e:
        st.error(f"Error in Pipeline Status: {str(e)}")
        import traceback
        st.code(traceback.format_exc())

elif page == "Deployments":
    st.write("Debug: Entering Deployments page")
    try:
        show_deployments(deployment_data, metrics_calc)
    except Exception as e:
        st.error(f"Error in Deployments: {str(e)}")
        import traceback
        st.code(traceback.format_exc())

elif page == "Alerts":
    st.write("Debug: Entering Alerts page")
    try:
        show_alerts(alert_data, metrics_calc)
    except Exception as e:
        st.error(f"Error in Alerts: {str(e)}")
        import traceback
        st.code(traceback.format_exc())

elif page == "Canary Deployments":
    st.write("Debug: Entering Canary Deployments page")
    try:
        show_canary_deployments()
    except Exception as e:
        st.error(f"Error in Canary Deployments: {str(e)}")
        import traceback
        st.code(traceback.format_exc())

# Footer
st.markdown("---")
st.markdown("**DevOps Monitoring Dashboard** | Last updated: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
