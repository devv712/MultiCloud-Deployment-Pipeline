import streamlit as st
import pandas as pd
from utils.data_generator import DataGenerator
from utils.metrics import MetricsCalculator

# Test the basic functionality
st.title("Test Dashboard")

# Initialize data
data_gen = DataGenerator()
metrics_calc = MetricsCalculator()

# Sidebar
page = st.sidebar.radio("Navigate to:", ["Test Overview", "Test Pipeline"])

st.write(f"Current page: {page}")

if page == "Test Overview":
    st.header("Test Overview Page")
    st.write("This is the overview page")
    
    # Generate some test data
    pipeline_data = data_gen.generate_pipeline_data(24, "All")
    st.write(f"Generated {len(pipeline_data)} pipeline records")
    
    if len(pipeline_data) > 0:
        df = pd.DataFrame(pipeline_data)
        st.dataframe(df.head())

elif page == "Test Pipeline":
    st.header("Test Pipeline Page")
    st.write("This is the pipeline page")
    
    # Test importing the pipeline function
    try:
        from pages.pipeline_overview import show_pipeline_overview
        st.success("Pipeline module imported successfully")
        
        pipeline_data = data_gen.generate_pipeline_data(24, "All")
        st.write(f"Generated {len(pipeline_data)} pipeline records")
        
        # Try to call the function
        show_pipeline_overview(pipeline_data, metrics_calc)
        
    except Exception as e:
        st.error(f"Error: {str(e)}")
        import traceback
        st.code(traceback.format_exc())