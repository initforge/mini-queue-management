# Script to setup .env file from template
# This script creates .env with current API keys (for migration)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Environment Variables Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$envFile = Join-Path $PSScriptRoot ".env"
$templateFile = Join-Path $PSScriptRoot "env.template"

if (Test-Path $envFile) {
    Write-Host "⚠️  File .env đã tồn tại!" -ForegroundColor Yellow
    $overwrite = Read-Host "Bạn có muốn ghi đè không? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Đã hủy." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "📝 Đang tạo file .env..." -ForegroundColor Green

# Create .env with current values (for migration)
$envContent = @"
# Environment Variables - DO NOT COMMIT THIS FILE!
# This file contains sensitive API keys

# Gemini AI Configuration
GEMINI_API_KEY=AIzaSyBS33D0yduetuAklMPhfL4CFA_4hYkfd3g

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dghawsj8e
CLOUDINARY_API_KEY=872237255328765
CLOUDINARY_API_SECRET=AeKphmHpQi6c1sW2nIxOR_0mlz8

# Debug Mode
DEBUG=true

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://frontend:3000,http://localhost,http://127.0.0.1

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_WS_URL=ws://localhost:8000/ws
"@

$envContent | Out-File -FilePath $envFile -Encoding utf8 -NoNewline

Write-Host "✅ Đã tạo file .env thành công!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Bước tiếp theo:" -ForegroundColor Cyan
Write-Host "   1. Kiểm tra file .env đã có đầy đủ API keys chưa" -ForegroundColor White
Write-Host "   2. Restart containers:" -ForegroundColor White
Write-Host "      docker-compose down" -ForegroundColor Gray
Write-Host "      docker-compose up -d --build" -ForegroundColor Gray
Write-Host ""
Write-Host "NOTE: File .env is in .gitignore and will NOT be committed to Git." -ForegroundColor Yellow
Write-Host ""

