import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta

def show_deployments(deployment_data, metrics_calc):
    """Display deployments page"""
    
    st.header("Deployment Analysis")
    
    if not deployment_data:
        st.warning("No deployment data available for the selected filters.")
        return
    
    df = pd.DataFrame(deployment_data)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Deployment metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        total_deployments = len(df)
        st.metric("Total Deployments", total_deployments)
    
    with col2:
        success_rate = (len(df[df['status'] == 'success']) / len(df) * 100) if len(df) > 0 else 0
        st.metric("Success Rate", f"{success_rate:.1f}%")
    
    with col3:
        deploy_freq = metrics_calc.calculate_deployment_frequency(deployment_data)
        st.metric("Deployments/Day", f"{deploy_freq:.1f}")
    
    with col4:
        avg_duration = df['duration'].mean()
        st.metric("Avg Duration", f"{avg_duration:.1f}m")
    
    # Deployment timeline
    st.subheader("Deployment Timeline")
    
    fig = px.scatter(
        df,
        x='timestamp',
        y='environment',
        color='status',
        size='duration',
        hover_data=['service', 'version', 'deployed_by'],
        title="Deployment Timeline",
        color_discrete_map={
            'success': 'green',
            'failed': 'red',
            'running': 'orange'
        }
    )
    fig.update_layout(height=400)
    st.plotly_chart(fig, use_container_width=True)
    
    # Deployment frequency analysis
    st.subheader("Deployment Frequency Analysis")
    
    col1, col2 = st.columns(2)
    
    with col1:
        # Deployments by environment
        env_counts = df['environment'].value_counts()
        fig = px.pie(
            values=env_counts.values,
            names=env_counts.index,
            title="Deployments by Environment"
        )
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        # Deployments by service
        service_counts = df['service'].value_counts().head(8)
        fig = px.bar(
            x=service_counts.values,
            y=service_counts.index,
            orientation='h',
            title="Deployments by Service"
        )
        st.plotly_chart(fig, use_container_width=True)
    
    # Deployment performance trends
    st.subheader("Performance Trends")
    
    # Group by day
    df['date'] = df['timestamp'].dt.date
    daily_deployments = df.groupby(['date', 'environment']).size().reset_index(name='count')
    
    fig = px.bar(
        daily_deployments,
        x='date',
        y='count',
        color='environment',
        title="Daily Deployments by Environment",
        barmode='stack'
    )
    fig.update_layout(height=400)
    st.plotly_chart(fig, use_container_width=True)
    
    # Deployment duration analysis
    st.subheader("Duration Analysis")
    
    fig = px.box(
        df,
        x='environment',
        y='duration',
        color='status',
        title="Deployment Duration Distribution by Environment"
    )
    fig.update_layout(height=400)
    st.plotly_chart(fig, use_container_width=True)
    
    # Recent deployments table
    st.subheader("Recent Deployments")
    
    recent_deployments = df.sort_values('timestamp', ascending=False).head(20)
    
    # Format the dataframe for better display
    display_df = recent_deployments.copy()
    display_df['timestamp'] = display_df['timestamp'].dt.strftime('%Y-%m-%d %H:%M:%S')
    
    st.dataframe(
        display_df[['service', 'environment', 'version', 'status', 'timestamp', 'duration', 'deployed_by']],
        use_container_width=True,
        hide_index=True
    )
    
    # Deployment health by environment
    st.subheader("Environment Health Summary")
    
    env_health = df.groupby('environment').agg({
        'status': ['count', lambda x: (x == 'success').sum()],
        'duration': 'mean'
    }).round(2)
    
    env_health.columns = ['total_deployments', 'successful_deployments', 'avg_duration']
    env_health['success_rate'] = (env_health['successful_deployments'] / env_health['total_deployments'] * 100).round(1)
    env_health = env_health.reset_index()
    
    # Color code based on health
    def get_health_color(success_rate):
        if success_rate >= 95:
            return "🟢"
        elif success_rate >= 85:
            return "🟡"
        else:
            return "🔴"
    
    for _, row in env_health.iterrows():
        health_indicator = get_health_color(row['success_rate'])
        st.write(f"{health_indicator} **{row['environment'].title()}**: {row['success_rate']:.1f}% success rate, {row['avg_duration']:.1f}m avg duration")
