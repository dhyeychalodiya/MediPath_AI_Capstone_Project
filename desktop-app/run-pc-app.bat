@echo off
setlocal
title MediPath AI - Desktop Application
cd /d "%~dp0"

echo ========================================================
echo     MediPath AI - Desktop Application Launcher
echo ========================================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not found in PATH!
    echo Please install Node.js v18 or higher from https://nodejs.org
    pause
    exit /b 1
)

if not exist "%~dp0node_modules" (
    echo [INFO] Installing required desktop dependencies...
    call npm install
)

echo [INFO] Launching MediPath AI Desktop Window...
call npm start

endlocal
