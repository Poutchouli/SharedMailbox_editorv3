#!/bin/bash

# Shared Mailbox Manager - Build and Run Script
# This script builds the Docker image and runs the container

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="shared-mailbox-manager"
CONTAINER_NAME="shared-mailbox-manager"
PORT="17652"

echo -e "${BLUE}🐳 Shared Mailbox Manager - Docker Setup${NC}"
echo "=========================================="

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker is running${NC}"
}

# Function to stop and remove existing container
cleanup_existing() {
    if docker ps -a --format 'table {{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo -e "${YELLOW}🧹 Stopping and removing existing container...${NC}"
        docker stop ${CONTAINER_NAME} 2>/dev/null || true
        docker rm ${CONTAINER_NAME} 2>/dev/null || true
        echo -e "${GREEN}✅ Cleanup completed${NC}"
    fi
}

# Function to build Docker image
build_image() {
    echo -e "${BLUE}🔨 Building Docker image...${NC}"
    docker build -t ${IMAGE_NAME}:latest .
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Docker image built successfully${NC}"
    else
        echo -e "${RED}❌ Failed to build Docker image${NC}"
        exit 1
    fi
}

# Function to run container
run_container() {
    echo -e "${BLUE}🚀 Starting container on port ${PORT}...${NC}"
    docker run -d \
        --name ${CONTAINER_NAME} \
        -p ${PORT}:80 \
        --restart unless-stopped \
        ${IMAGE_NAME}:latest
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Container started successfully${NC}"
        echo -e "${GREEN}🌐 Application is available at: http://localhost:${PORT}${NC}"
    else
        echo -e "${RED}❌ Failed to start container${NC}"
        exit 1
    fi
}

# Function to show container status
show_status() {
    echo -e "\n${BLUE}📊 Container Status:${NC}"
    docker ps --filter name=${CONTAINER_NAME} --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo -e "\n${BLUE}📝 Container Logs (last 10 lines):${NC}"
    docker logs --tail 10 ${CONTAINER_NAME}
}

# Function to run with docker-compose
run_with_compose() {
    echo -e "${BLUE}🐙 Using Docker Compose...${NC}"
    docker-compose up -d
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Docker Compose started successfully${NC}"
        echo -e "${GREEN}🌐 Application is available at: http://localhost:${PORT}${NC}"
    else
        echo -e "${RED}❌ Failed to start with Docker Compose${NC}"
        exit 1
    fi
}

# Main execution
main() {
    check_docker
    
    # Check if docker-compose.yml exists and user wants to use it
    if [ -f "docker-compose.yml" ]; then
        read -p "Use Docker Compose? (y/n) [y]: " use_compose
        use_compose=${use_compose:-y}
        
        if [ "$use_compose" = "y" ] || [ "$use_compose" = "Y" ]; then
            run_with_compose
            return
        fi
    fi
    
    cleanup_existing
    build_image
    run_container
    show_status
    
    echo -e "\n${GREEN}🎉 Setup completed successfully!${NC}"
    echo -e "${BLUE}ℹ️  Useful commands:${NC}"
    echo -e "   View logs:    docker logs -f ${CONTAINER_NAME}"
    echo -e "   Stop app:     docker stop ${CONTAINER_NAME}"
    echo -e "   Start app:    docker start ${CONTAINER_NAME}"
    echo -e "   Remove app:   docker rm -f ${CONTAINER_NAME}"
}

# Handle script arguments
case "${1:-}" in
    "stop")
        echo -e "${YELLOW}🛑 Stopping container...${NC}"
        docker stop ${CONTAINER_NAME}
        ;;
    "start")
        echo -e "${GREEN}▶️  Starting container...${NC}"
        docker start ${CONTAINER_NAME}
        ;;
    "restart")
        echo -e "${YELLOW}🔄 Restarting container...${NC}"
        docker restart ${CONTAINER_NAME}
        ;;
    "logs")
        echo -e "${BLUE}📜 Container logs:${NC}"
        docker logs -f ${CONTAINER_NAME}
        ;;
    "status")
        show_status
        ;;
    "clean")
        echo -e "${RED}🧹 Cleaning up...${NC}"
        docker stop ${CONTAINER_NAME} 2>/dev/null || true
        docker rm ${CONTAINER_NAME} 2>/dev/null || true
        docker rmi ${IMAGE_NAME}:latest 2>/dev/null || true
        echo -e "${GREEN}✅ Cleanup completed${NC}"
        ;;
    *)
        main
        ;;
esac
