import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import numpy as np
from datetime import datetime, timedelta

def show_canary_deployments():
    """Display canary deployments page"""
    
    st.header("Canary Deployment Management")
    
    # Simulate current canary deployment status
    canary_active = st.checkbox("Canary Deployment Active", value=True)
    
    if not canary_active:
        st.info("No active canary deployments. Start a new canary deployment to monitor progress.")
        
        if st.button("Start New Canary Deployment", type="primary"):
            st.success("New canary deployment started!")
            st.rerun()
        return
    
    # Canary deployment configuration
    st.subheader("Current Canary Deployment")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        service_name = st.selectbox("Service", ["payment-service", "auth-service", "frontend-app"], index=0)
        environment = st.selectbox("Environment", ["Production", "Staging"], index=0)
    
    with col2:
        canary_version = st.text_input("Canary Version", value="v2.1.5")
        production_version = st.text_input("Production Version", value="v2.1.4")
    
    with col3:
        # Simulate canary progress
        canary_progress = st.slider("Canary Progress (%)", 0, 100, 25, disabled=True)
        traffic_split = min(canary_progress, 50)  # Max 50% traffic to canary
        
        st.write(f"**Traffic Split:**")
        st.write(f"Canary: {traffic_split}%")
        st.write(f"Production: {100 - traffic_split}%")
    
    # Progress visualization
    progress_col1, progress_col2 = st.columns([3, 1])
    
    with progress_col1:
        st.progress(canary_progress / 100)
        
        if canary_progress < 100:
            st.write(f"Canary deployment is {canary_progress}% complete")
        else:
            st.success("Canary deployment completed successfully!")
    
    with progress_col2:
        if canary_progress < 100:
            if st.button("Promote to 100%", type="primary"):
                st.success("Canary promoted to full traffic!")
                st.rerun()
    
    # Real-time metrics comparison
    st.subheader("Real-time Metrics Comparison")
    
    # Generate sample metrics data
    time_points = pd.date_range(start=datetime.now() - timedelta(hours=2), end=datetime.now(), freq='5min')
    
    # Simulate metrics with canary performing slightly better or worse
    canary_performance_factor = np.random.uniform(0.8, 1.2)  # Random performance difference
    
    metrics_data = {
        'timestamp': time_points,
        'response_time_canary': np.random.normal(200 * canary_performance_factor, 30, len(time_points)),
        'response_time_production': np.random.normal(250, 40, len(time_points)),
        'error_rate_canary': np.random.uniform(0, 2 * canary_performance_factor, len(time_points)),
        'error_rate_production': np.random.uniform(1, 4, len(time_points)),
        'cpu_usage_canary': np.random.normal(45 * canary_performance_factor, 10, len(time_points)),
        'cpu_usage_production': np.random.normal(55, 12, len(time_points)),
        'memory_usage_canary': np.random.normal(60 * canary_performance_factor, 8, len(time_points)),
        'memory_usage_production': np.random.normal(70, 10, len(time_points))
    }
    
    df = pd.DataFrame(metrics_data)
    
    # Metrics tabs
    tab1, tab2, tab3, tab4 = st.tabs(["Response Time", "Error Rate", "CPU Usage", "Memory Usage"])
    
    with tab1:
        fig = go.Figure()
        
        fig.add_trace(go.Scatter(
            x=df['timestamp'],
            y=df['response_time_canary'],
            mode='lines',
            name='Canary',
            line=dict(color='blue', width=2)
        ))
        
        fig.add_trace(go.Scatter(
            x=df['timestamp'],
            y=df['response_time_production'],
            mode='lines',
            name='Production',
            line=dict(color='red', width=2)
        ))
        
        fig.update_layout(
            title="Response Time Comparison",
            xaxis_title="Time",
            yaxis_title="Response Time (ms)",
            height=400
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        # Show current averages
        col1, col2 = st.columns(2)
        with col1:
            canary_avg = df['response_time_canary'].iloc[-10:].mean()
            st.metric("Canary Avg (last 50min)", f"{canary_avg:.1f}ms")
        with col2:
            prod_avg = df['response_time_production'].iloc[-10:].mean()
            st.metric("Production Avg (last 50min)", f"{prod_avg:.1f}ms")
    
    with tab2:
        fig = go.Figure()
        
        fig.add_trace(go.Scatter(
            x=df['timestamp'],
            y=df['error_rate_canary'],
            mode='lines',
            name='Canary',
            line=dict(color='blue', width=2)
        ))
        
        fig.add_trace(go.Scatter(
            x=df['timestamp'],
            y=df['error_rate_production'],
            mode='lines',
            name='Production',
            line=dict(color='red', width=2)
        ))
        
        fig.update_layout(
            title="Error Rate Comparison",
            xaxis_title="Time",
            yaxis_title="Error Rate (%)",
            height=400
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        col1, col2 = st.columns(2)
        with col1:
            canary_err = df['error_rate_canary'].iloc[-10:].mean()
            st.metric("Canary Error Rate", f"{canary_err:.2f}%")
        with col2:
            prod_err = df['error_rate_production'].iloc[-10:].mean()
            st.metric("Production Error Rate", f"{prod_err:.2f}%")
    
    with tab3:
        fig = go.Figure()
        
        fig.add_trace(go.Scatter(
            x=df['timestamp'],
            y=df['cpu_usage_canary'],
            mode='lines',
            name='Canary',
            line=dict(color='blue', width=2)
        ))
        
        fig.add_trace(go.Scatter(
            x=df['timestamp'],
            y=df['cpu_usage_production'],
            mode='lines',
            name='Production',
            line=dict(color='red', width=2)
        ))
        
        fig.update_layout(
            title="CPU Usage Comparison",
            xaxis_title="Time",
            yaxis_title="CPU Usage (%)",
            height=400
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        col1, col2 = st.columns(2)
        with col1:
            canary_cpu = df['cpu_usage_canary'].iloc[-10:].mean()
            st.metric("Canary CPU Usage", f"{canary_cpu:.1f}%")
        with col2:
            prod_cpu = df['cpu_usage_production'].iloc[-10:].mean()
            st.metric("Production CPU Usage", f"{prod_cpu:.1f}%")
    
    with tab4:
        fig = go.Figure()
        
        fig.add_trace(go.Scatter(
            x=df['timestamp'],
            y=df['memory_usage_canary'],
            mode='lines',
            name='Canary',
            line=dict(color='blue', width=2)
        ))
        
        fig.add_trace(go.Scatter(
            x=df['timestamp'],
            y=df['memory_usage_production'],
            mode='lines',
            name='Production',
            line=dict(color='red', width=2)
        ))
        
        fig.update_layout(
            title="Memory Usage Comparison",
            xaxis_title="Time",
            yaxis_title="Memory Usage (%)",
            height=400
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        col1, col2 = st.columns(2)
        with col1:
            canary_mem = df['memory_usage_canary'].iloc[-10:].mean()
            st.metric("Canary Memory Usage", f"{canary_mem:.1f}%")
        with col2:
            prod_mem = df['memory_usage_production'].iloc[-10:].mean()
            st.metric("Production Memory Usage", f"{prod_mem:.1f}%")
    
    # Canary controls
    st.subheader("Canary Controls")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        if st.button("🚀 Promote Canary", type="primary"):
            st.success("Canary successfully promoted to production!")
            st.balloons()
    
    with col2:
        if st.button("⏸️ Pause Canary"):
            st.info("Canary deployment paused. Traffic remains at current split.")
    
    with col3:
        if st.button("🔄 Rollback Canary", type="secondary"):
            st.warning("Canary deployment rolled back. All traffic redirected to production.")
    
    with col4:
        if st.button("⏩ Increase Traffic"):
            st.info("Canary traffic increased by 10%")
    
    # Auto-rollback configuration
    st.subheader("Auto-Rollback Configuration")
    
    with st.expander("Configure Auto-Rollback Triggers"):
        col1, col2 = st.columns(2)
        
        with col1:
            st.write("**Performance Thresholds**")
            error_rate_threshold = st.number_input("Error Rate Threshold (%)", min_value=0.0, max_value=20.0, value=5.0, step=0.1)
            response_time_threshold = st.number_input("Response Time Threshold (ms)", min_value=0, value=500, step=50)
            cpu_threshold = st.number_input("CPU Usage Threshold (%)", min_value=0, max_value=100, value=90)
        
        with col2:
            st.write("**Trigger Conditions**")
            consecutive_failures = st.number_input("Consecutive Failures", min_value=1, max_value=10, value=3)
            time_window = st.number_input("Time Window (minutes)", min_value=1, max_value=60, value=5)
            
            enable_auto_rollback = st.checkbox("Enable Auto-Rollback", value=True)
        
        # Check current metrics against thresholds
        current_error_rate = df['error_rate_canary'].iloc[-1]
        current_response_time = df['response_time_canary'].iloc[-1]
        current_cpu = df['cpu_usage_canary'].iloc[-1]
        
        st.write("**Current Status:**")
        
        if current_error_rate > error_rate_threshold:
            st.error(f"⚠️ Error rate ({current_error_rate:.2f}%) exceeds threshold ({error_rate_threshold}%)")
        else:
            st.success(f"✅ Error rate ({current_error_rate:.2f}%) within threshold")
        
        if current_response_time > response_time_threshold:
            st.error(f"⚠️ Response time ({current_response_time:.1f}ms) exceeds threshold ({response_time_threshold}ms)")
        else:
            st.success(f"✅ Response time ({current_response_time:.1f}ms) within threshold")
        
        if current_cpu > cpu_threshold:
            st.error(f"⚠️ CPU usage ({current_cpu:.1f}%) exceeds threshold ({cpu_threshold}%)")
        else:
            st.success(f"✅ CPU usage ({current_cpu:.1f}%) within threshold")
    
    # Deployment history
    st.subheader("Recent Canary Deployments")
    
    # Generate sample deployment history
    history_data = []
    for i in range(5):
        days_ago = i * 2 + 1
        timestamp = datetime.now() - timedelta(days=days_ago)
        
        history_data.append({
            'service': np.random.choice(['payment-service', 'auth-service', 'frontend-app']),
            'version': f"v2.1.{4-i}",
            'environment': 'Production',
            'status': np.random.choice(['Completed', 'Rolled Back', 'Completed'], p=[0.6, 0.2, 0.2]),
            'duration': f"{np.random.randint(30, 180)}m",
            'timestamp': timestamp.strftime('%Y-%m-%d %H:%M'),
            'max_traffic': f"{np.random.randint(25, 100)}%"
        })
    
    history_df = pd.DataFrame(history_data)
    
    # Add status indicators
    def get_status_indicator(status):
        if status == 'Completed':
            return '🟢'
        elif status == 'Rolled Back':
            return '🔴'
        else:
            return '🟡'
    
    history_df['status_icon'] = history_df['status'].apply(get_status_indicator)
    
    st.dataframe(
        history_df[['status_icon', 'service', 'version', 'environment', 'status', 'max_traffic', 'duration', 'timestamp']],
        use_container_width=True,
        hide_index=True,
        column_config={
            'status_icon': st.column_config.TextColumn('Status', width='small'),
            'service': st.column_config.TextColumn('Service'),
            'version': st.column_config.TextColumn('Version'),
            'environment': st.column_config.TextColumn('Environment'),
            'status': st.column_config.TextColumn('Final Status'),
            'max_traffic': st.column_config.TextColumn('Max Traffic'),
            'duration': st.column_config.TextColumn('Duration'),
            'timestamp': st.column_config.TextColumn('Started At')
        }
    )
