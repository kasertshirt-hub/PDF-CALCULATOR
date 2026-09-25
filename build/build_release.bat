@echo off
setlocal
cd /d "%~dp0.."
echo ==============================================
echo KASER PRINTING PDF CALCULATOR - ELECTRON ONLY
echo ==============================================
if not exist node_modules call npm install || exit /b 1
call npm run build:win || exit /b 1
echo Installer ada di folder dist.
pause
endlocal
