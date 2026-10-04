@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

REM ============================================================
REM   Unified Kids Platform - Auto Version & Push Script
REM   Source of truth: version.json
REM ============================================================

cd /d "D:\kids-learning-platform\unified-kids-platform"

echo.
echo ============================================================
echo   Unified Kids Platform - Auto Release Script
echo ============================================================
echo.

REM --- التحقق من وجود Git ---
where git >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Git is not installed or not in PATH.
    pause
    exit /b 1
)

REM --- التحقق من وجود version.json ---
if not exist "version.json" (
    echo {> version.json
    echo   "version": "1.0.0">> version.json
    echo }>> version.json
    echo [INFO] version.json created with 1.0.0
)

REM --- قراءة النسخة الحالية من version.json ---
for /f "tokens=2 delims=:," %%a in ('findstr /i "version" version.json') do (
    set RAW=%%a
)
set RAW=%RAW: =%
set RAW=%RAW:"=%
set CURRENT_VERSION=%RAW%

echo [INFO] Current version: v%CURRENT_VERSION%

REM --- حساب النسخة الجديدة (زيادة PATCH) ---
for /f "tokens=1,2,3 delims=." %%a in ("%CURRENT_VERSION%") do (
    set MAJOR=%%a
    set MINOR=%%b
    set PATCH=%%c
)

set /a NEW_PATCH=%PATCH%+1
set NEW_VERSION=%MAJOR%.%MINOR%.%NEW_PATCH%

echo [INFO] New version will be: v%NEW_VERSION%
echo.

REM --- التحقق من وجود تغييرات ---
git add .
git diff --cached --quiet
if not errorlevel 1 (
    echo [WARN] No changes detected. Nothing to commit.
    pause
    exit /b 0
)

REM --- Commit ---
echo [STEP 1/5] Committing changes...
git commit -m "Release v%NEW_VERSION%"
if errorlevel 1 (
    echo [ERROR] Commit failed.
    pause
    exit /b 1
)

REM --- Tag ---
echo [STEP 2/5] Creating tag v%NEW_VERSION% ...
git tag -a "v%NEW_VERSION%" -m "Release v%NEW_VERSION%"
if errorlevel 1 (
    echo [ERROR] Tag creation failed. Tag may already exist.
    pause
    exit /b 1
)

REM --- Push branch ---
echo [STEP 3/5] Pushing to origin main ...
git push origin main
if errorlevel 1 (
    echo [ERROR] Push to main failed.
    pause
    exit /b 1
)

REM --- Push tags ---
echo [STEP 4/5] Pushing tags ...
git push origin --tags
if errorlevel 1 (
    echo [ERROR] Push tags failed.
    pause
    exit /b 1
)

REM --- تحديث version.json ---
echo {> version.json
echo   "version": "%NEW_VERSION%">> version.json
echo }>> version.json

REM --- تحديث package.json ---
call npm version %NEW_VERSION% --no-git-tag-version --allow-same-version >nul 2>nul

REM --- تحديث CHANGELOG.md ---
echo ## [v%NEW_VERSION%] - %date% %time% >> CHANGELOG.md

REM --- Commit الملفات المحدثة (version.json + package.json + CHANGELOG) ---
echo [STEP 5/5] Committing version bump files...
git add version.json package.json package-lock.json CHANGELOG.md >nul 2>nul
git commit -m "Bump version to v%NEW_VERSION%" >nul 2>nul
git push origin main >nul 2>nul

echo.
echo ============================================================
echo   SUCCESS: Released v%NEW_VERSION%
echo ============================================================
echo.
pause
endlocal