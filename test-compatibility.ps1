# Quick Fix Script for Firefox/Brave Compatibility Issues
# PowerShell version for Windows

Write-Host "================================" -ForegroundColor Cyan
Write-Host "WAFA - Browser Compatibility Fix" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "1. Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5010/api/v1/test" -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✓ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Backend is NOT running" -ForegroundColor Red
    Write-Host "   Please start the backend first:" -ForegroundColor Yellow
    Write-Host "   cd wafa-backend" -ForegroundColor White
    Write-Host "   npm start" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter after starting the backend"
}

# Check if frontend is running
Write-Host ""
Write-Host "2. Checking if frontend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4010" -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✓ Frontend is running" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Frontend is NOT running" -ForegroundColor Red
    Write-Host "   Please start the frontend first:" -ForegroundColor Yellow
    Write-Host "   cd wafa-frentend" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter after starting the frontend"
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Testing Browser Compatibility" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Test API endpoint
Write-Host "3. Testing API connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5010/api/v1/test" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✓ API responding correctly" -ForegroundColor Green
        Write-Host "   Response: $($response.Content)" -ForegroundColor White
    }
} catch {
    Write-Host "   ✗ API error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. Testing CORS headers..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5010/api/v1/test" -Method Options -UseBasicParsing
    
    if ($response.Headers["Access-Control-Allow-Credentials"]) {
        Write-Host "   ✓ CORS credentials header present" -ForegroundColor Green
    } else {
        Write-Host "   ✗ CORS credentials header missing" -ForegroundColor Red
    }
    
    if ($response.Headers["Access-Control-Allow-Origin"]) {
        Write-Host "   ✓ CORS origin header present" -ForegroundColor Green
    } else {
        Write-Host "   ✗ CORS origin header missing" -ForegroundColor Red
    }
} catch {
    Write-Host "   ⚠ Could not test CORS headers: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Next Steps" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$testPagePath = Join-Path $PSScriptRoot "test-browser-compatibility.html"
Write-Host "1. Open the test page in Firefox/Brave:" -ForegroundColor Yellow
Write-Host "   $testPagePath" -ForegroundColor White
Write-Host ""

Write-Host "2. Run all tests and check the results" -ForegroundColor Yellow
Write-Host ""

Write-Host "3. If tests fail, check:" -ForegroundColor Yellow
Write-Host "   - Browser console for errors (F12)" -ForegroundColor White
Write-Host "   - Network tab for CORS errors" -ForegroundColor White
Write-Host "   - Privacy/Shield settings" -ForegroundColor White
Write-Host ""

Write-Host "4. Read the full guide:" -ForegroundColor Yellow
Write-Host "   Get-Content BROWSER_COMPATIBILITY_FIX.md" -ForegroundColor White
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Common Issues & Quick Fixes" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Issue: Cookies not being set" -ForegroundColor Yellow
Write-Host "Fix: In Firefox -> Settings -> Privacy -> Standard mode" -ForegroundColor White
Write-Host ""

Write-Host "Issue: CORS errors" -ForegroundColor Yellow
Write-Host "Fix: Restart backend after code changes" -ForegroundColor White
Write-Host ""

Write-Host "Issue: Session expires immediately" -ForegroundColor Yellow
Write-Host "Fix: Clear all cookies and try again" -ForegroundColor White
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Offer to open test page
$openPage = Read-Host "Do you want to open the test page in your default browser? (y/n)"
if ($openPage -eq 'y' -or $openPage -eq 'Y') {
    Start-Process $testPagePath
}

Write-Host ""
Write-Host "Testing complete! 🎉" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Remember to restart your backend to apply the changes!" -ForegroundColor Yellow
