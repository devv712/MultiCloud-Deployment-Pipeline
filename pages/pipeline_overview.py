import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta

def show_pipeline_overview(pipeline_data, metrics_calc):
    """Display pipeline overview page"""
    
    st.header("Pipeline Overview")
    
    if not pipeline_data:
        st.warning("No pipeline data available for the selected filters.")
        return
    
    df = pd.DataFrame(pipeline_data)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Pipeline summary metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        total_builds = len(df)
        st.metric("Total Builds", total_builds)
    
    with col2:
        success_rate = metrics_calc.calculate_success_rate(pipeline_data)
        st.metric("Success Rate", f"{success_rate:.1f}%")
    
    with col3:
        avg_duration = df['duration'].mean()
        st.metric("Avg Duration", f"{avg_duration:.1f}m")
    
    with col4:
        failed_builds = len(df[df['status'] == 'failed'])
        st.metric("Failed Builds", failed_builds)
    
    # Build trends
    st.subheader("Build Trends")
    
    # Group by date and calculate daily metrics
    df['date'] = df['timestamp'].dt.date
    daily_stats = df.groupby('date').agg({
        'status': ['count', lambda x: (x == 'success').sum()],
        'duration': 'mean'
    }).round(2)
    
    daily_stats.columns = ['total_builds', 'successful_builds', 'avg_duration']
    daily_stats['success_rate'] = (daily_stats['successful_builds'] / daily_stats['total_builds'] * 100).round(1)
    daily_stats = daily_stats.reset_index()
    
    # Plot daily success rate
    fig = px.line(
        daily_stats,
        x='date',
        y='success_rate',
        title="Daily Build Success Rate",
        markers=True
    )
    fig.update_layout(height=400)
    st.plotly_chart(fig, use_container_width=True)
    
    # Pipeline performance by environment
    st.subheader("Performance by Environment")
    
    env_stats = df.groupby('environment').agg({
        'status': ['count', lambda x: (x == 'success').sum()],
        'duration': 'mean'
    }).round(2)
    
    env_stats.columns = ['total_builds', 'successful_builds', 'avg_duration']
    env_stats['success_rate'] = (env_stats['successful_builds'] / env_stats['total_builds'] * 100).round(1)
    env_stats = env_stats.reset_index()
    
    col1, col2 = st.columns(2)
    
    with col1:
        fig = px.bar(
            env_stats,
            x='environment',
            y='success_rate',
            title="Success Rate by Environment",
            color='success_rate',
            color_continuous_scale='RdYlGn'
        )
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        fig = px.bar(
            env_stats,
            x='environment',
            y='avg_duration',
            title="Average Duration by Environment",
            color='avg_duration',
            color_continuous_scale='RdYlBu_r'
        )
        st.plotly_chart(fig, use_container_width=True)
    
    # Recent failures analysis
    st.subheader("Recent Failures Analysis")
    
    failed_builds = df[df['status'] == 'failed'].sort_values('timestamp', ascending=False)
    
    if len(failed_builds) > 0:
        st.write(f"**{len(failed_builds)}** failed builds in the selected time range")
        
        # Show top failing pipelines
        failure_counts = failed_builds['pipeline_name'].value_counts().head(5)
        
        if len(failure_counts) > 0:
            fig = px.bar(
                x=failure_counts.values,
                y=failure_counts.index,
                orientation='h',
                title="Top Failing Pipelines",
                labels={'x': 'Number of Failures', 'y': 'Pipeline Name'}
            )
            st.plotly_chart(fig, use_container_width=True)
        
        # Recent failures table
        st.write("**Recent Failed Builds:**")
        st.dataframe(
            failed_builds[['pipeline_name', 'environment', 'timestamp', 'duration', 'branch']].head(10),
            use_container_width=True,
            hide_index=True
        )
    else:
        st.success("No failed builds in the selected time range! 🎉")
