#!/usr/bin/env python3
"""
DevOps Pipeline Dashboard Startup Script
Comprehensive multi-cloud CI/CD monitoring with canary deployments
"""

import subprocess
import sys
import os
import signal
import time
from pathlib import Path

def run_command(command, cwd=None):
    """Run a shell command and return the process"""
    try:
        return subprocess.Popen(
            command,
            shell=True,
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
    except Exception as e:
        print(f"Error running command '{command}': {e}")
        return None

def install_dependencies():
    """Install Node.js dependencies if needed"""
    print("Installing dependencies...")
    
    # Install tsx for TypeScript execution
    process = run_command("npm install -g tsx")
    if process:
        process.wait()
    
    # Install project dependencies
    process = run_command("npm install")
    if process:
        process.wait()
    
    print("Dependencies installed successfully!")

def start_backend():
    """Start the Express backend server"""
    print("Starting DevOps Pipeline Dashboard backend...")
    return run_command("tsx server/vite.ts")

def main():
    """Main startup function"""
    print("=" * 60)
    print("🚀 DevOps Pipeline Dashboard - Multi-Cloud CI/CD Monitor")
    print("=" * 60)
    print("Features:")
    print("• Real-time pipeline monitoring")
    print("• Canary deployment tracking") 
    print("• Multi-cloud infrastructure management")
    print("• Live alerting and notifications")
    print("• WebSocket-based real-time updates")
    print("=" * 60)
    
    # Install dependencies
    install_dependencies()
    
    # Start backend server
    backend_process = start_backend()
    
    if not backend_process:
        print("❌ Failed to start backend server")
        sys.exit(1)
    
    print("✅ DevOps Pipeline Dashboard is starting...")
    print("📊 Dashboard will be available at: http://localhost:5173")
    print("🔌 API server running on: http://localhost:3000")
    print("📡 WebSocket endpoint: ws://localhost:3000/ws")
    print("\n🎯 Features available:")
    print("   • Multi-cloud CI/CD pipeline monitoring")
    print("   • Canary deployment simulation and rollback")
    print("   • Real-time infrastructure metrics")
    print("   • Alert management and notifications")
    print("   • Live performance monitoring")
    print("\n⚡ Press Ctrl+C to stop the server")
    
    def signal_handler(sig, frame):
        print("\n🛑 Shutting down DevOps Pipeline Dashboard...")
        if backend_process:
            backend_process.terminate()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    
    try:
        # Keep the main process alive
        backend_process.wait()
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    main()