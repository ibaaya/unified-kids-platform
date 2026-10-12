@echo off
echo === ضغط ملفات الصوت - رحلتي ===
echo.

REM تأكد من وجود ffmpeg
ffmpeg -version >nul 2>&1
if errorlevel 1 (
    echo خطأ: ffmpeg غير مثبت. ثبته أولاً.
    pause
    exit /b
)

REM أنشئ مجلد للنسخة الاحتياطية
mkdir "public\audio_backup" 2>nul
echo جاري نسخ احتياطي...
xcopy "public\audio" "public\audio_backup" /E /I /Y /Q

echo.
echo جاري الضغط...
set count=0

for /r "public\audio" %%f in (*.mp3) do (
    ffmpeg -i "%%f" -b:a 32k -ar 22050 -ac 1 "%%f_compressed.mp3" -y -loglevel quiet
    move /y "%%f_compressed.mp3" "%%f" >nul
    set /a count+=1
    echo تم: %%~nxf
)

echo.
echo === انتهى! عدد الملفات: %count% ===
echo النسخة الاحتياطية في: public\audio_backup
pause