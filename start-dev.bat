@echo off
echo 🚀 Starting CopilotKit Auto-State Development Server
echo ====================================================

cd /d C:\auto\auto-state

echo 📦 Installing dependencies...
call npm install

echo 🔧 Starting development server...
echo ✅ Project will be available at: http://localhost:3000
echo 📱 Responsive fixes have been applied
echo 💬 CopilotKit chat should be fully functional

call npm run dev
