import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta

def show_alerts(alert_data, metrics_calc):
    """Display alerts page"""
    
    st.header("Alert Management")
    
    if not alert_data:
        st.warning("No alert data available for the selected filters.")
        return
    
    df = pd.DataFrame(alert_data)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Alert summary metrics
    active_alerts = df[df['status'] == 'active']
    resolved_alerts = df[df['status'] == 'resolved']
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Total Alerts", len(df))
    
    with col2:
        st.metric("Active Alerts", len(active_alerts))
    
    with col3:
        st.metric("Resolved Alerts", len(resolved_alerts))
    
    with col4:
        mttr = metrics_calc.calculate_mttr(alert_data)
        st.metric("MTTR", f"{mttr:.1f}m")
    
    # Alert severity breakdown
    st.subheader("Alert Severity Distribution")
    
    col1, col2 = st.columns(2)
    
    with col1:
        severity_counts = df['severity'].value_counts()
        fig = px.pie(
            values=severity_counts.values,
            names=severity_counts.index,
            title="All Alerts by Severity",
            color_discrete_map={
                'low': 'green',
                'medium': 'yellow',
                'high': 'orange',
                'critical': 'red'
            }
        )
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        if len(active_alerts) > 0:
            active_severity_counts = active_alerts['severity'].value_counts()
            fig = px.pie(
                values=active_severity_counts.values,
                names=active_severity_counts.index,
                title="Active Alerts by Severity",
                color_discrete_map={
                    'low': 'green',
                    'medium': 'yellow',
                    'high': 'orange',
                    'critical': 'red'
                }
            )
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.success("No active alerts!")
    
    # Alert trends over time
    st.subheader("Alert Trends")
    
    # Group alerts by hour
    df['hour'] = df['timestamp'].dt.floor('h')
    hourly_alerts = df.groupby(['hour', 'severity']).size().reset_index(name='count')
    
    fig = px.bar(
        hourly_alerts,
        x='hour',
        y='count',
        color='severity',
        title="Alerts Over Time by Severity",
        color_discrete_map={
            'low': 'green',
            'medium': 'yellow',
            'high': 'orange',
            'critical': 'red'
        }
    )
    fig.update_layout(height=400)
    st.plotly_chart(fig, use_container_width=True)
    
    # Alert types analysis
    st.subheader("Alert Types Analysis")
    
    col1, col2 = st.columns(2)
    
    with col1:
        alert_type_counts = df['type'].value_counts().head(8)
        fig = px.bar(
            x=alert_type_counts.values,
            y=alert_type_counts.index,
            orientation='h',
            title="Most Common Alert Types"
        )
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        env_alert_counts = df['environment'].value_counts()
        fig = px.bar(
            x=env_alert_counts.index,
            y=env_alert_counts.values,
            title="Alerts by Environment"
        )
        st.plotly_chart(fig, use_container_width=True)
    
    # Active alerts table
    st.subheader("Active Alerts")
    
    if len(active_alerts) > 0:
        # Sort by severity and timestamp
        severity_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
        active_alerts_sorted = active_alerts.copy()
        active_alerts_sorted['severity_order'] = active_alerts_sorted['severity'].map(severity_order)
        active_alerts_sorted = active_alerts_sorted.sort_values(['severity_order', 'timestamp'])
        
        # Add severity indicators
        def get_severity_indicator(severity):
            indicators = {
                'critical': '🔴',
                'high': '🟠',
                'medium': '🟡',
                'low': '🟢'
            }
            return indicators.get(severity, '⚪')
        
        display_df = active_alerts_sorted.copy()
        display_df['severity_icon'] = display_df['severity'].apply(get_severity_indicator)
        display_df['timestamp'] = display_df['timestamp'].dt.strftime('%Y-%m-%d %H:%M:%S')
        
        st.dataframe(
            display_df[['severity_icon', 'type', 'environment', 'service', 'description', 'timestamp']],
            use_container_width=True,
            hide_index=True,
            column_config={
                'severity_icon': st.column_config.TextColumn('🚨', width='small'),
                'type': st.column_config.TextColumn('Alert Type'),
                'environment': st.column_config.TextColumn('Environment'),
                'service': st.column_config.TextColumn('Service'),
                'description': st.column_config.TextColumn('Description'),
                'timestamp': st.column_config.TextColumn('Timestamp')
            }
        )
    else:
        st.success("No active alerts! Your systems are running smoothly. 🎉")
    
    # Alert configuration section
    st.subheader("Alert Thresholds Configuration")
    
    with st.expander("Configure Alert Thresholds"):
        col1, col2 = st.columns(2)
        
        with col1:
            st.write("**Infrastructure Metrics**")
            cpu_threshold = st.slider("CPU Usage (%)", 0, 100, 80)
            memory_threshold = st.slider("Memory Usage (%)", 0, 100, 85)
            disk_threshold = st.slider("Disk Usage (%)", 0, 100, 90)
        
        with col2:
            st.write("**Application Metrics**")
            error_rate_threshold = st.slider("Error Rate (%)", 0.0, 20.0, 5.0, step=0.1)
            response_time_threshold = st.slider("Response Time (ms)", 0, 5000, 1000, step=100)
            availability_threshold = st.slider("Availability (%)", 90.0, 100.0, 99.0, step=0.1)
        
        if st.button("Save Configuration"):
            st.success("Alert thresholds updated successfully!")
    
    # Resolution time analysis
    st.subheader("Resolution Time Analysis")
    
    if len(resolved_alerts) > 0:
        resolved_with_time = resolved_alerts[resolved_alerts['resolved_at'].notna()].copy()
        
        if len(resolved_with_time) > 0:
            resolved_with_time['resolved_at'] = pd.to_datetime(resolved_with_time['resolved_at'])
            resolved_with_time['resolution_time'] = (
                resolved_with_time['resolved_at'] - resolved_with_time['timestamp']
            ).dt.total_seconds() / 60  # Convert to minutes
            
            # Resolution time by severity
            fig = px.box(
                resolved_with_time,
                x='severity',
                y='resolution_time',
                title="Resolution Time by Severity",
                labels={'resolution_time': 'Resolution Time (minutes)'}
            )
            fig.update_layout(height=400)
            st.plotly_chart(fig, use_container_width=True)
            
            # Resolution time statistics
            col1, col2, col3 = st.columns(3)
            
            with col1:
                avg_resolution = resolved_with_time['resolution_time'].mean()
                st.metric("Avg Resolution Time", f"{avg_resolution:.1f}m")
            
            with col2:
                median_resolution = resolved_with_time['resolution_time'].median()
                st.metric("Median Resolution Time", f"{median_resolution:.1f}m")
            
            with col3:
                max_resolution = resolved_with_time['resolution_time'].max()
                st.metric("Max Resolution Time", f"{max_resolution:.1f}m")
