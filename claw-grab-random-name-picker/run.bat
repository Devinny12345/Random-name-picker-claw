@echo off
setlocal EnableDelayedExpansion
title Claw Grab - Random Name Picker

echo ========================================
echo  Claw Grab - Random Name Picker
echo  Local Dev Launcher (Windows)
echo  Auto-installs all dependencies
echo ========================================
echo.

REM --- 1) Check Node.js ---
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [CHECK] Node.js not found in PATH.
    echo.
    where winget >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo [INSTALL] Trying winget install OpenJS.NodeJS.LTS ...
        winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
        echo.
        echo Please CLOSE this window and DOUBLE-CLICK run.bat again after install.
        pause
        exit /b 1
    ) else (
        echo [ERROR] Node.js 18+ is required.
        echo   1) Install from https://nodejs.org/  (LTS)
        echo   2) Re-open this folder and double-click run.bat again
        echo.
        pause
        exit /b 1
    )
)

echo [OK] Node found:
node --version
echo.

REM --- Check Node version >=18 ---
for /f "tokens=2 delims=v." %%A in ('node --version') do set MAJOR=%%A
if "%MAJOR%"=="" set MAJOR=0
if %MAJOR% LSS 18 (
    echo [WARN] Node %MAJOR% is old. Please update to Node 18+ from https://nodejs.org/
    echo Continuing anyway...
    echo.
)

REM --- 2) Check npm ---
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm not found (should come with Node.js).
    echo Re-install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] npm found:
call npm --version
echo.

REM --- 3) Check Git (optional, for updates) ---
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Git not found - you can still run, but 'git pull' updates won't work.
    echo        Install from https://git-scm.com/ if you need it.
    echo.
) else (
    echo [OK] Git found:
    git --version
    echo.
)

REM --- 4) Create .env.local from .env.example if missing ---
if not exist ".env.local" (
    if exist ".env.example" (
        echo [.env.local missing] Creating from .env.example...
        copy /Y ".env.example" ".env.local" >nul
        echo [OK] Created .env.local - default uses https://bright-mink-448.convex.cloud
        echo      Edit .env.local if you need a different Convex URL.
        echo.
    ) else (
        echo [WARN] No .env.local and no .env.example found.
        echo        App will use built-in fallback https://bright-mink-448.convex.cloud
        echo.
    )
) else (
    echo [OK] Found .env.local
    echo.
)

REM --- 5) Install ALL Windows dependencies ---
echo ========================================
echo  Installing / Verifying dependencies
echo ========================================
echo.

REM Prefer npm ci if lock file exists (faster, clean), else npm install
if exist "package-lock.json" (
    echo [INSTALL] package-lock.json found - running npm ci ...
    call npm ci
    if %ERRORLEVEL% NEQ 0 (
        echo [WARN] npm ci failed, trying npm install ...
        call npm install
        if %ERRORLEVEL% NEQ 0 (
            echo [ERROR] npm install failed. See above.
            echo Try deleting node_modules and running again, or run: npm install --legacy-peer-deps
            pause
            exit /b 1
        )
    )
) else if exist "bun.lock" (
    echo [INSTALL] bun.lock found
    where bun >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo   Using bun install ...
        call bun install
        if %ERRORLEVEL% NEQ 0 (
            echo [WARN] bun install failed, trying npm install ...
            call npm install
        )
    ) else (
        echo   bun not found, using npm install ...
        call npm install
    )
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Install failed.
        pause
        exit /b 1
    )
) else (
    echo [INSTALL] Running npm install ...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
)

echo.
echo [OK] Dependencies ready.
echo.

REM --- 6) Verify Vite ---
where npx >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] npx found, Vite will run via npm run dev
    echo.
)

REM --- 7) Start dev server ---
echo ========================================
echo  Starting dev server
echo  http://localhost:4545
echo  Press Ctrl+C to stop
echo ========================================
echo.
call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Dev server exited with an error.
    echo Try: npm run build  to see if build works, or delete node_modules and run again.
    pause
    exit /b %ERRORLEVEL%
)

endlocal
