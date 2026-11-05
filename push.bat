@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul

REM ============================================================
REM   Unified Kids Platform - Auto Release Script
REM   Source of truth: version.json
REM ============================================================

cd /d "D:\unified-kids-platform"
if errorlevel 1 (
    echo [ERROR] Could not enter project directory.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   Unified Kids Platform - Auto Release Script
echo ============================================================
echo.

where git >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Git is not installed or not in PATH.
    pause
    exit /b 1
)

if not exist "version.json" (
    echo [ERROR] version.json is missing.
    pause
    exit /b 1
)

for /f "tokens=2 delims=:," %%a in ('findstr /i "version" version.json') do set "RAW=%%a"
set "RAW=%RAW: =%"
set "RAW=%RAW:"=%"
set "CURRENT_VERSION=%RAW%"
if not defined CURRENT_VERSION (
    echo [ERROR] Could not read version.json.
    pause
    exit /b 1
)

echo [INFO] Current version: v%CURRENT_VERSION%
for /f "tokens=1,2,3 delims=." %%a in ("%CURRENT_VERSION%") do (
    set "MAJOR=%%a"
    set "MINOR=%%b"
    set "PATCH=%%c"
)
set /a NEW_PATCH=%PATCH%+1
set "NEW_VERSION=%MAJOR%.%MINOR%.%NEW_PATCH%"
set "NEW_TAG=v%NEW_VERSION%"
echo [INFO] New version will be: %NEW_TAG%
echo.

REM Fetch first and refuse to release from a stale/diverged local branch.
echo [INFO] Checking GitHub branch state...
git fetch origin
if errorlevel 1 (
    echo [ERROR] Could not fetch origin. Check network and GitHub access.
    pause
    exit /b 1
)
for /f %%b in ('git branch --show-current') do set "CURRENT_BRANCH=%%b"
if /i not "%CURRENT_BRANCH%"=="main" (
    echo [ERROR] Current branch is "%CURRENT_BRANCH%", expected "main".
    pause
    exit /b 1
)
git merge-base --is-ancestor origin/main HEAD
if errorlevel 1 (
    echo [ERROR] Local main is behind or has diverged from origin/main.
    echo         Run: git pull --rebase origin main
    pause
    exit /b 1
)

git show-ref --verify --quiet "refs/tags/%NEW_TAG%"
if not errorlevel 1 (
    echo [ERROR] Tag %NEW_TAG% already exists locally. No changes were made.
    pause
    exit /b 1
)
git ls-remote --exit-code --tags origin "refs/tags/%NEW_TAG%" >nul 2>nul
if not errorlevel 1 (
    echo [ERROR] Tag %NEW_TAG% already exists on GitHub. No changes were made.
    pause
    exit /b 1
)

REM Update release metadata BEFORE creating the release commit/tag.
echo {> version.json
echo   "version": "%NEW_VERSION%">> version.json
echo }>> version.json
call npm version %NEW_VERSION% --no-git-tag-version --allow-same-version
if errorlevel 1 (
    echo [ERROR] npm could not update package version files.
    pause
    exit /b 1
)
echo ## [%NEW_TAG%] - %date% %time%>> CHANGELOG.md

echo [INFO] Staging changes...
git add -A
if errorlevel 1 (
    echo [ERROR] git add failed.
    pause
    exit /b 1
)

git diff --cached --quiet
if not errorlevel 1 (
    echo [ERROR] Nothing to release after updating version metadata.
    pause
    exit /b 1
)

echo [STEP 1/3] Committing release %NEW_TAG%...
git commit -m "Release %NEW_TAG%"
if errorlevel 1 (
    echo [ERROR] Commit failed.
    pause
    exit /b 1
)

echo [STEP 2/3] Creating tag %NEW_TAG%...
git tag -a "%NEW_TAG%" -m "Release %NEW_TAG%"
if errorlevel 1 (
    echo [ERROR] Tag creation failed. Check local tags.
    pause
    exit /b 1
)

REM Push only this release tag, atomically with main; never replay old tags.
echo [STEP 3/3] Pushing main and %NEW_TAG% to GitHub...
git push --atomic origin main "refs/tags/%NEW_TAG%"
if errorlevel 1 (
    echo [ERROR] Atomic push failed. GitHub did not accept this release push.
    echo         Check origin/main and whether %NEW_TAG% exists remotely.
    echo         Do not delete or force-push tags; inspect with git status and git ls-remote.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   SUCCESS: Released %NEW_TAG%
echo ============================================================
echo.
pause
endlocal
