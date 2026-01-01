@echo off
echo Starting Volitus Backend...
cd /d "%~dp0backend"
start "Volitus Backend" cmd /k "venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo Starting Volitus Streamer Frontend...
cd /d "%~dp0frontend-streamer"
start "Volitus Streamer" cmd /k "npm run dev"

echo.
echo ========================================
echo Volitus is starting...
echo Backend: http://localhost:8000
echo Streamer: http://localhost:5174
echo API Docs: http://localhost:8000/docs
echo ========================================
echo.
pause
