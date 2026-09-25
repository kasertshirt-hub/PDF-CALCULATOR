@echo off
setlocal
cd /d "%~dp0.."
if not exist node_modules (
  echo Installing Electron dependencies...
  call npm install || exit /b 1
)
call npm run build:win || exit /b 1
echo.
echo Installer selesai. Cek folder dist.
endlocal
pause
