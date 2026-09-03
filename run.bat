@echo off
setlocal
title Claw Grab - Random Name Picker

echo ========================================
echo  Claw Grab - Random Name Picker
echo  Local Dev Launcher (Windows)
echo ========================================
echo.

REM This outer launcher handles the space in "claw picker" path.
REM It forwards to the actual project inside claw-grab-random-name-picker\

set "PROJECT_DIR=%~dp0claw-grab-random-name-picker"

if not exist "%PROJECT_DIR%\package.json" (
    echo [ERROR] Could not find project at:
    echo   %PROJECT_DIR%
    echo.
    echo Make sure this run.bat is next to the claw-grab-random-name-picker folder.
    pause
    exit /b 1
)

echo [OK] Found project at %PROJECT_DIR%
echo Forwarding to project run.bat...
echo.

REM Change to project dir and run its launcher (handles Node, .env, install, dev)
cd /d "%PROJECT_DIR%"
call run.bat

endlocal
