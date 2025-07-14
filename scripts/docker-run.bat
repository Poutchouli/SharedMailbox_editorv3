@echo off
REM Shared Mailbox Manager - Build and Run Script for Windows
REM This script builds the Docker image and runs the container

setlocal enabledelayedexpansion

REM Configuration
set IMAGE_NAME=shared-mailbox-manager
set CONTAINER_NAME=shared-mailbox-manager
set PORT=17652

echo.
echo 🐳 Shared Mailbox Manager - Docker Setup
echo ==========================================

REM Function to check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)
echo ✅ Docker is running

REM Function to stop and remove existing container
docker ps -a --format "table {{.Names}}" | findstr /r "^%CONTAINER_NAME%$" >nul 2>&1
if not errorlevel 1 (
    echo 🧹 Stopping and removing existing container...
    docker stop %CONTAINER_NAME% >nul 2>&1
    docker rm %CONTAINER_NAME% >nul 2>&1
    echo ✅ Cleanup completed
)

REM Check if user wants to use Docker Compose
if exist "docker-compose.yml" (
    set /p "use_compose=Use Docker Compose? (y/n) [y]: "
    if "!use_compose!"=="" set use_compose=y
    
    if /i "!use_compose!"=="y" (
        echo 🐙 Using Docker Compose...
        docker-compose up -d
        if not errorlevel 1 (
            echo ✅ Docker Compose started successfully
            echo 🌐 Application is available at: http://localhost:%PORT%
        ) else (
            echo ❌ Failed to start with Docker Compose
            pause
            exit /b 1
        )
        goto :end
    )
)

REM Function to build Docker image
echo 🔨 Building Docker image...
docker build -t %IMAGE_NAME%:latest .
if errorlevel 1 (
    echo ❌ Failed to build Docker image
    pause
    exit /b 1
)
echo ✅ Docker image built successfully

REM Function to run container
echo 🚀 Starting container on port %PORT%...
docker run -d --name %CONTAINER_NAME% -p %PORT%:80 --restart unless-stopped %IMAGE_NAME%:latest
if errorlevel 1 (
    echo ❌ Failed to start container
    pause
    exit /b 1
)
echo ✅ Container started successfully
echo 🌐 Application is available at: http://localhost:%PORT%

REM Function to show container status
echo.
echo 📊 Container Status:
docker ps --filter name=%CONTAINER_NAME% --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo 📝 Container Logs (last 10 lines):
docker logs --tail 10 %CONTAINER_NAME%

echo.
echo 🎉 Setup completed successfully!
echo ℹ️  Useful commands:
echo    View logs:    docker logs -f %CONTAINER_NAME%
echo    Stop app:     docker stop %CONTAINER_NAME%
echo    Start app:    docker start %CONTAINER_NAME%
echo    Remove app:   docker rm -f %CONTAINER_NAME%

:end
echo.
pause
