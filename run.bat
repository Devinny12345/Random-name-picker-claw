@echo off
setlocal
title Claw Grab - Random Name Picker

echo ========================================
echo  Claw Grab - Random Name Picker
echo  Local Dev Launcher (Windows)
echo ========================================
echo.

REM --- Check Node.js ---
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js 18+ from https://nodejs.org/
    echo Then double-click run.bat again.
    pause
    exit /b 1
)

echo [OK] Node %~nx0
node --version
echo.

REM --- Create .env.local from .env.example if missing ---
if not exist ".env.local" (
    if exist ".env.example" (
        echo [.env.local not found] Creating from .env.example...
        copy /Y ".env.example" ".env.local" >nul
        echo [OK] Created .env.local - edit it if you need a different Convex URL.
        echo      Default: https://bright-mink-448.convex.cloud
        echo.
    ) else (
        echo [WARN] No .env.local and no .env.example found.
        echo        The app will use the built-in fallback Convex URL.
        echo.
    )
) else (
    echo [OK] Found .env.local
    echo.
)

REM --- Install dependencies if node_modules missing ---
if not exist "node_modules" (
    echo Installing dependencies (npm install)...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed.
    echo.
) else (
    echo [OK] Dependencies already installed.
    echo.
)

REM --- Start dev server ---
echo Starting dev server on http://localhost:4545 ...
echo Press Ctrl+C to stop.
echo.
call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Dev server exited with an error.
    pause
    exit /b %ERRORLEVEL%
)

endlocal
