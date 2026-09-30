@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
title Classroom Quiz Server
color 0B
cls

echo ============================================================
echo           Classroom Quiz Server - Starting Server
echo ============================================================
echo.

set "PY_CMD="

python --version >nul 2>&1
if not errorlevel 1 (
    set "PY_CMD=python"
    goto :START_PY
)

py --version >nul 2>&1
if not errorlevel 1 (
    set "PY_CMD=py"
    goto :START_PY
)

python3 --version >nul 2>&1
if not errorlevel 1 (
    set "PY_CMD=python3"
    goto :START_PY
)

node --version >nul 2>&1
if not errorlevel 1 (
    echo [*] Launching server with Node.js...
    start http://localhost:3000
    node standalone-server.js
    goto :END
)

echo [!] Python or Node.js was not found. Please install Python from https://www.python.org/
pause
exit /b 1

:START_PY
echo [*] Starting server with %PY_CMD%...
start http://localhost:3000
%PY_CMD% classroom_server.py

:END
pause
