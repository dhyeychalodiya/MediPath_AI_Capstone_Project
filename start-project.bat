@echo off
setlocal enabledelayedexpansion
title MediPath AI - One-Click Launcher
cd /d "%~dp0"

echo ===================================================
echo     MediPath AI - Intelligent Healthcare Navigator
echo     Version: Capstone V4 -- Primary Model: MedP_AI_V2.0
echo ===================================================
echo.

:: Detect if running from root or inner folder
if exist "%~dp0backend" (
    set "PROJECT_ROOT=%~dp0"
) else if exist "%~dp0MediPath_AI_Capstone\backend" (
    set "PROJECT_ROOT=%~dp0MediPath_AI_Capstone\"
) else if exist "%~dp0..\backend" (
    set "PROJECT_ROOT=%~dp0..\"
) else (
    echo [ERROR] Cannot locate backend directory!
    echo Looked in:
    echo   - %~dp0backend
    echo   - %~dp0MediPath_AI_Capstone\backend
    pause
    exit /b 1
)

:: Verify Node.js and npm in PATH
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not found in PATH!
    echo Please install Node.js v18 or higher from https://nodejs.org
    pause
    exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not found in PATH!
    pause
    exit /b 1
)

:: Check for force restart flags
set "FORCE_RESTART=0"
if /i "%~1"=="--restart" set "FORCE_RESTART=1"
if /i "%~1"=="-r" set "FORCE_RESTART=1"
if /i "%~1"=="/r" set "FORCE_RESTART=1"

if "!FORCE_RESTART!"=="1" (
    echo [INFO] Restart requested. Terminating processes on ports 5000 and 8080...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":5000 .*LISTENING"') do taskkill /f /pid %%a >nul 2>&1
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":8080 .*LISTENING"') do taskkill /f /pid %%a >nul 2>&1
    ping 127.0.0.1 -n 2 >nul
)

:: Ensure environment templates are active if .env missing
if not exist "!PROJECT_ROOT!backend\.env" (
    if exist "!PROJECT_ROOT!backend\.env.example" (
        echo [CONFIG] Setting up backend\.env from template...
        copy "!PROJECT_ROOT!backend\.env.example" "!PROJECT_ROOT!backend\.env" >nul
    )
)
if not exist "!PROJECT_ROOT!frontend\healthpath-ai-main\.env" (
    if exist "!PROJECT_ROOT!frontend\healthpath-ai-main\.env.example" (
        echo [CONFIG] Setting up frontend\.env from template...
        copy "!PROJECT_ROOT!frontend\healthpath-ai-main\.env.example" "!PROJECT_ROOT!frontend\healthpath-ai-main\.env" >nul
    )
)

:: Check dependencies
if not exist "!PROJECT_ROOT!backend\node_modules" (
    echo [INSTALL] Installing backend dependencies...
    pushd "!PROJECT_ROOT!backend"
    call npm install
    popd
)

if not exist "!PROJECT_ROOT!frontend\healthpath-ai-main\node_modules" (
    echo [INSTALL] Installing frontend dependencies...
    pushd "!PROJECT_ROOT!frontend\healthpath-ai-main"
    call npm install
    popd
)

:: Check and Launch Backend on Port 5000
netstat -ano | findstr /R /C:":5000 .*LISTENING" >nul 2>&1
if !errorlevel!==0 (
    echo [OK] Backend API is already active on port 5000.
) else (
    echo [STARTING] Launching Backend on http://localhost:5000...
    start "MediPath Backend Port 5000" cmd.exe /K "cd /d "!PROJECT_ROOT!backend" && node server.js"
)

:: Check and Launch Frontend on Port 8080
netstat -ano | findstr /R /C:":8080 .*LISTENING" >nul 2>&1
if !errorlevel!==0 (
    echo [OK] Frontend service is already active on port 8080.
) else (
    echo [STARTING] Launching Frontend on http://localhost:8080...
    start "MediPath Frontend Port 8080" cmd.exe /K "cd /d "!PROJECT_ROOT!frontend\healthpath-ai-main" && npm run dev"
)

echo.
echo Waiting for services to initialize...
ping 127.0.0.1 -n 5 >nul

echo.
echo ===================================================
echo [SUCCESS] MediPath AI Capstone V4 is live and ready!
echo   * Primary Model: MedP_AI_V2.0 (In-Memory Node.js Engine)
echo   * Web Navigator: http://localhost:8080
echo   * Backend API:   http://localhost:5000/api/health
echo   * Hospital Registry: 920 Verified Facilities
echo ===================================================
echo.
echo Opening web application in default browser...
start http://localhost:8080

echo.
echo ---------------------------------------------------
echo  * Frontend running at: http://localhost:8080
echo  * Backend running at:  http://localhost:5000
echo  * To restart fresh:    Run "start-project.bat --restart"
echo ---------------------------------------------------
echo Both servers are running in separate terminal windows.
echo Press any key to close this launcher...
pause >nul
endlocal
