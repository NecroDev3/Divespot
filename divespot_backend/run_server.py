#!/usr/bin/env python3

import os
import sys

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app import create_app
    
    app = create_app()
    
    print("🚀 DiveSpot Backend Server")
    print("📡 Health: http://localhost:8000/ (localhost)")
    print("📡 Health: http://192.168.50.101:8000/ (network)")
    print("🔧 API: http://localhost:8000/api/ (localhost)")  
    print("🔧 API: http://192.168.50.101:8000/api/ (network)")
    print("=" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=8000)
    
except Exception as e:
    print(f"❌ Error starting server: {e}")
    import traceback
    traceback.print_exc()
