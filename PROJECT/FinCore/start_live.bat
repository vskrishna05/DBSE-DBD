@echo off
title FinCore Live Public Server
color 0A

echo ===================================================
echo           FinCore Live Deployment Launcher
echo ===================================================
echo.
echo [1/2] Starting FinCore Unified Server (FastAPI + React)...
start /b "" "%~dp0venv\Scripts\python.exe" -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000

timeout /t 2 /nobreak >nul

echo [2/2] Launching Cloudflare Tunnel for Instant HTTPS URL...
echo.
echo ===================================================
echo Copy the HTTPS URL shown below and share it!
echo ===================================================
echo.

"%~dp0cloudflared.exe" tunnel --url http://127.0.0.1:8000
