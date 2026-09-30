@echo off
chcp 65001 >nul
title صانع ملف EXE - Classroom Quiz Server
color 0A
cls

echo ===============================================================================
echo            أداة تحويل الخادم إلى برنامج تنفيذي مستقل (EXE)
echo                     Classroom Quiz Server Builder
echo ===============================================================================
echo.
echo [1/3] جاري فحص مكتبة PyInstaller...

where pyinstaller >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] جاري تثبيت PyInstaller تلقائياً...
    pip install pyinstaller
)

echo.
echo [2/3] جاري بناء ملف EXE المستقل مع دمج ملفات الواجهة وقاعدة البيانات...
echo يرجى الانتظار دقيقة واحدة...
echo.

pyinstaller --noconfirm --onedir --windowed --name "ClassroomQuizServer" --add-data "dist;dist" classroom_server.py

if exist "dist\ClassroomQuizServer\ClassroomQuizServer.exe" (
    echo.
    echo ===============================================================================
    echo  [✓] تهانينا! تم إنشاء ملف EXE بنجاح!
    echo  المسار: dist\ClassroomQuizServer\ClassroomQuizServer.exe
    echo.
    echo  يمكنك الآن تشغيل البرنامج مباشرة بالنقر على ملف EXE بدون أي ملفات إضافية!
    echo ===============================================================================
) else (
    echo [!] يمكنك تشغيل البرنامج مباشرة باستخدام Start-ClassroomServer.bat
)

echo.
pause
