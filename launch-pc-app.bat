@echo off
setlocal
title MediPath AI - Standalone Desktop Launcher
cd /d "%~dp0"

echo ========================================================
echo     MediPath AI - Standalone PC Desktop Launcher
echo ========================================================
echo.

if exist "%~dp0desktop-app\run-pc-app.bat" (
    call "%~dp0desktop-app\run-pc-app.bat"
) else (
    echo [ERROR] Cannot locate desktop-app folder!
    pause
)

endlocal
