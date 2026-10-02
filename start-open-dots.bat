@echo off
rem Start Dots by Pao (API server + web client)
rem ใช้ production build ถ้ามี (.next/BUILD_ID) ไม่งั้น fallback เป็น dev mode

setlocal
set "ROOT=%~dp0"

if exist "%ROOT%client\.next\BUILD_ID" (
  start "Dots by Pao Web" cmd /k "cd /d "%ROOT%client" && npm start"
) else (
  echo No production build found - using dev mode. Run "npm run build" in client\ for faster startup.
  start "Dots by Pao Web" cmd /k "cd /d "%ROOT%client" && npm run dev"
)

start "Dots by Pao API" cmd /k "cd /d "%ROOT%server" && .venv\Scripts\activate && python run.py"

timeout /t 10 /nobreak >nul
start http://localhost:3000/app
echo Dots by Pao starting: Web http://localhost:3000  ^|  API http://127.0.0.1:8000
endlocal
