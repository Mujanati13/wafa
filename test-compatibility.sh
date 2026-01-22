#!/bin/bash

# Quick Fix Script for Firefox/Brave Compatibility Issues
# This script helps you test the fixes applied

echo "================================"
echo "WAFA - Browser Compatibility Fix"
echo "================================"
echo ""

# Check if backend is running
echo "1. Checking if backend is running..."
if curl -s http://localhost:5010/api/v1/test > /dev/null 2>&1; then
    echo "   ✓ Backend is running"
else
    echo "   ✗ Backend is NOT running"
    echo "   Please start the backend first:"
    echo "   cd wafa-backend && npm start"
    echo ""
    read -p "Press Enter after starting the backend..."
fi

# Check if frontend is running
echo ""
echo "2. Checking if frontend is running..."
if curl -s http://localhost:4010 > /dev/null 2>&1; then
    echo "   ✓ Frontend is running"
else
    echo "   ✗ Frontend is NOT running"
    echo "   Please start the frontend first:"
    echo "   cd wafa-frentend && npm run dev"
    echo ""
    read -p "Press Enter after starting the frontend..."
fi

echo ""
echo "================================"
echo "Testing Browser Compatibility"
echo "================================"
echo ""

# Test API endpoint
echo "3. Testing API connection..."
response=$(curl -s -w "\n%{http_code}" http://localhost:5010/api/v1/test)
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$status_code" = "200" ]; then
    echo "   ✓ API responding correctly"
    echo "   Response: $body"
else
    echo "   ✗ API error (Status: $status_code)"
fi

echo ""
echo "4. Testing CORS headers..."
cors_headers=$(curl -s -I -X OPTIONS http://localhost:5010/api/v1/test)
if echo "$cors_headers" | grep -q "Access-Control-Allow-Credentials"; then
    echo "   ✓ CORS credentials header present"
else
    echo "   ✗ CORS credentials header missing"
fi

if echo "$cors_headers" | grep -q "Access-Control-Allow-Origin"; then
    echo "   ✓ CORS origin header present"
else
    echo "   ✗ CORS origin header missing"
fi

echo ""
echo "================================"
echo "Next Steps"
echo "================================"
echo ""
echo "1. Open the test page in Firefox/Brave:"
echo "   file://$(pwd)/test-browser-compatibility.html"
echo ""
echo "2. Run all tests and check the results"
echo ""
echo "3. If tests fail, check:"
echo "   - Browser console for errors (F12)"
echo "   - Network tab for CORS errors"
echo "   - Privacy/Shield settings"
echo ""
echo "4. Read the full guide:"
echo "   cat BROWSER_COMPATIBILITY_FIX.md"
echo ""
echo "================================"
echo "Common Issues & Quick Fixes"
echo "================================"
echo ""
echo "Issue: Cookies not being set"
echo "Fix: In Firefox -> Settings -> Privacy -> Standard mode"
echo ""
echo "Issue: CORS errors"
echo "Fix: Restart backend after code changes"
echo ""
echo "Issue: Session expires immediately"  
echo "Fix: Clear all cookies and try again"
echo ""
echo "================================"

# Offer to restart services
echo ""
read -p "Do you want to restart the backend to apply changes? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Please restart your backend manually:"
    echo "1. Stop the backend (Ctrl+C)"
    echo "2. cd wafa-backend"
    echo "3. npm start"
fi

echo ""
echo "Testing complete! 🎉"
