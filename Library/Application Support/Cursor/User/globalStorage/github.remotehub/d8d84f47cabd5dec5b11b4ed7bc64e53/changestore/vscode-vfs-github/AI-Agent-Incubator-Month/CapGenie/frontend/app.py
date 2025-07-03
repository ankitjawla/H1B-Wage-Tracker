"""
Main application file for CapGenie Fraud Detection System
"""
import streamlit as st
import sys
import os

# Add paths for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Import the package modules
from styles import load_css
from pages import (
    dashboard,
    transaction_monitor,
    alert_validation,
    customer_verification,
    ml_data_analysis
)
from utils import logger

# Import fraud detection functions or provide mock alternatives
try:
    from fraud_detector.main import detect_fraud, validate_alert, send_notification
    logger.info("Successfully imported fraud detection functions")
except ImportError as e:
    logger.warning(f"Unable to import fraud detection functions: {e}")
    logger.info("Mock functions will be used instead")

# Set page configuration
st.set_page_config(
    page_title="CapGenie Fraud Detection System",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Load CSS styles
load_css()

# Sidebar navigation
st.sidebar.markdown('<div class="main-header">🔍 CapGenie</div>', unsafe_allow_html=True)
st.sidebar.markdown("### Fraud Detection System")
page = st.sidebar.radio("Navigation", [
    "Dashboard", 
    "Transaction Monitor", 
    "Alert Validation", 
    "Customer Verification",
    "ML Data Analysis",
    "Settings"
])

# Display the selected page
if page == "Dashboard":
    dashboard.render()
elif page == "Transaction Monitor":
    transaction_monitor.render()
elif page == "Alert Validation":
    alert_validation.render()
elif page == "Customer Verification":
    customer_verification.render()
elif page == "ML Data Analysis":
    ml_data_analysis.render()
elif page == "Settings":
    st.markdown('<div class="main-header">System Settings</div>', unsafe_allow_html=True)
    
    st.markdown("### API Configuration")
    
    # API configuration settings
    api_key = st.text_input("API Key", type="password")
    api_endpoint = st.text_input("API Endpoint URL", "https://api.example.com/fraud-detection")
    
    col1, col2 = st.columns(2)
    with col1:
        api_version = st.selectbox("API Version", ["v1", "v2", "v3 (Beta)"])
    with col2:
        timeout = st.number_input("Request Timeout (seconds)", min_value=1, max_value=60, value=30)
    
    st.markdown("### Notification Settings")
    
    col1, col2 = st.columns(2)
    with col1:
        st.checkbox("Enable Email Notifications", True)
        st.text_input("Email Sender Address", "alerts@example.com")
    with col2:
        st.checkbox("Enable SMS Notifications", True)
        st.text_input("SMS Sender ID", "CapGenie")
    
    st.markdown("### Risk Threshold Configuration")
    
    col1, col2, col3 = st.columns(3)
    with col1:
        st.slider("Low Risk Threshold", 0, 100, 40)
    with col2:
        st.slider("Medium Risk Threshold", 0, 100, 75)
    with col3:
        st.slider("High Risk Auto-Block Threshold", 0, 100, 90)
    
    st.markdown("### Integration Settings")
    
    st.checkbox("Enable Real-Time Transaction Monitoring", True)
    st.checkbox("Enable Customer Verification for Medium Risk Alerts", True)
    st.checkbox("Auto-Block Transactions for High Risk Alerts", False)
    
    if st.button("Save Settings"):
        st.success("Settings saved successfully!")
else:
    # Default page if none selected
    st.markdown('<div class="main-header">Welcome to CapGenie Fraud Detection</div>', unsafe_allow_html=True)
    st.markdown("""
    Please select a page from the sidebar to get started.
    
    This system helps detect and manage fraudulent transactions through:
    - Real-time transaction monitoring
    - Alert validation and prioritization
    - Customer and staff notifications
    - Adaptive learning from past fraud cases
    """) 