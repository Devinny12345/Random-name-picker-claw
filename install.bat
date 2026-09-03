@echo off
setlocal EnableDelayedExpansion
title Claw Grab - Install Windows Dependencies

echo ========================================
echo  Claw Grab - Install Dependencies
echo  (Windows - one-time setup)
echo ========================================
echo.
echo This will check Node.js/npm and install all required packages.
echo You can then run the app with run.bat or npm run dev
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found. Install Node 18+ from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node %NODE_VER% - node --version
node --version
call npm --version >nul 2>nul && echo [OK] npm & call npm --version

if not exist ".env.local" if exist ".env.example" (
    echo Creating .env.local from .env.example ...
    copy /Y ".env.example" ".env.local" >nul
    echo [OK] Created .env.local
)

echo.
echo Installing dependencies ...
if exist "package-lock.json" (
    call npm ci
    if %ERRORLEVEL% NEQ 0 call npm install
) else (
    call npm install
)

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Install failed.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  [OK] All Windows dependencies installed!
echo  Double-click run.bat to start http://localhost:4545
echo ========================================
pause
endlocal
