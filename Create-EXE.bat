@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
title Classroom Quiz Server EXE Builder
color 0A
cls

echo ============================================================
echo             Classroom Quiz Server - EXE Builder
echo ============================================================
echo.
echo [*] Checking PyInstaller...

where pyinstaller >nul 2>&1
if errorlevel 1 (
    echo [*] Installing PyInstaller package...
    pip install pyinstaller
)

echo.
echo [*] Compiling standalone ClassroomQuizServer.exe...
echo [*] Please wait a moment...
echo.

pyinstaller --noconfirm --onefile --console --name "ClassroomQuizServer" classroom_server.py

if exist "dist\ClassroomQuizServer.exe" (
    echo.
    echo ============================================================
    echo  [OK] Success! ClassroomQuizServer.exe created in dist folder!
    echo  Path: dist\ClassroomQuizServer.exe
    echo ============================================================
    echo.
) else (
    echo [!] Build completed. You can also run Start-ClassroomServer.bat directly.
)

pause
