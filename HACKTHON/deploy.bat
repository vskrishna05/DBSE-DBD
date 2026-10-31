@echo off
TITLE MechX Enterprise Deployment Launcher
echo ============================================================
echo          MECHX VEHICLE SERVICE MANAGEMENT PLATFORM
echo               Production Deployment Launcher
echo ============================================================
echo.

:: Check Docker availability
where docker >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Docker detected. Do you want to launch with Docker Compose? [Y/N]
    set /p USE_DOCKER="Choice (default N): "
    if /I "%USE_DOCKER%"=="Y" (
        echo [INFO] Launching full containerized cluster with Docker Compose...
        docker compose up -d --build
        echo.
        echo [SUCCESS] Cluster started:
        echo   - Frontend: http://localhost:5173
        echo   - Backend:  http://localhost:8080
        echo   - AI Svc:   http://localhost:8000
        goto END
    )
)

echo [INFO] Running Native Production Stack...
echo.

:: 1. Launch AI FastAPI microservice
echo [1/3] Starting AI Predictive Maintenance Microservice (Port 8000)...
start "MechX-AI-Microservice" /min cmd /c "cd /d %~dp0ai-service && python -u -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

:: 2. Launch Spring Boot Fat JAR
echo [2/3] Starting Spring Boot 3.3.4 Production JAR (Port 8080)...
start "MechX-Backend" /min cmd /c "cd /d %~dp0backend && java -jar target\mechx-backend-1.0.0.jar"

:: 3. Launch Frontend Production Server
echo [3/3] Serving Frontend Production Distribution (Port 5173)...
start "MechX-Frontend" cmd /c "cd /d %~dp0frontend && npm run preview -- --host 0.0.0.0 --port 5173"

echo.
echo ============================================================
echo [SUCCESS] MechX Production Deployment is ACTIVE!
echo ============================================================
echo   - Frontend Web App:     http://localhost:5173
echo   - Local Network (LAN):   http://10.250.28.195:5173
echo   - Spring Boot REST API:  http://localhost:8080
echo   - Swagger UI API Docs:   http://localhost:8080/swagger-ui/index.html
echo   - FastAPI AI Docs:       http://localhost:8000/docs
echo ============================================================
echo.

:END
pause
