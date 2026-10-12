@echo off
echo === ضغط ملفات الفيديو - رحلتي ===
echo.

REM تأكد من وجود ffmpeg
ffmpeg -version >nul 2>&1
if errorlevel 1 (
    echo خطأ: ffmpeg غير مثبت
    pause
    exit /b
)

REM نسخة احتياطية
mkdir "public\video_backup" 2>nul
echo جاري النسخ الاحتياطي...
xcopy "public\video" "public\video_backup" /E /I /Y /Q

echo.
echo جاري الضغط...

for /r "public\video" %%f in (*.mp4) do (
    echo يعالج: %%~nxf
    ffmpeg -i "%%f" ^
        -c:v libx264 ^
        -crf 28 ^
        -preset slow ^
        -c:a aac ^
        -b:a 96k ^
        -movflags +faststart ^
        "%%f_compressed.mp4" -y -loglevel quiet
    move /y "%%f_compressed.mp4" "%%f" >nul
    echo تم: %%~nxf
)

echo.
echo === انتهى! ===
echo النسخة الاحتياطية في: public\video_backup
pause