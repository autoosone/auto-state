Write-Host "🚀 Starting CopilotKit Auto-State Development Server" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green

Set-Location "C:\auto\auto-state"

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "🔧 Starting development server..." -ForegroundColor Yellow
    Write-Host "✅ Project will be available at: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "📱 Responsive fixes have been applied" -ForegroundColor Cyan
    Write-Host "💬 CopilotKit chat should be fully functional" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🎯 Key fixes applied:" -ForegroundColor Magenta
    Write-Host "   - Fixed desktop text cutoff" -ForegroundColor White
    Write-Host "   - Added mobile responsiveness" -ForegroundColor White  
    Write-Host "   - Made iframe-compatible" -ForegroundColor White
    Write-Host "   - Enhanced chat widget" -ForegroundColor White
    Write-Host ""
    
    npm run dev
} else {
    Write-Host "❌ npm install failed. Please check for errors above." -ForegroundColor Red
}
