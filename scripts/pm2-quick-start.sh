#!/bin/bash

# PM2 Quick Start Script
# One-command setup for production deployment

set -e

echo "🚀 RAG Google Drive - PM2 Quick Start"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm: $(npm --version)${NC}"

# Check PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 is not installed${NC}"
    echo ""
    read -p "Install PM2 globally? (y/n): " install_pm2
    if [ "$install_pm2" = "y" ]; then
        echo "Installing PM2..."
        npm install -g pm2
        echo -e "${GREEN}✅ PM2 installed${NC}"
    else
        echo -e "${RED}❌ PM2 is required. Exiting.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ PM2: $(pm2 --version)${NC}"
fi

echo ""

# Check .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo ""
    if [ -f .env.sample ]; then
        read -p "Create .env from .env.sample? (y/n): " create_env
        if [ "$create_env" = "y" ]; then
            cp .env.sample .env
            echo -e "${GREEN}✅ Created .env file${NC}"
            echo -e "${YELLOW}⚠️  Please edit .env with your credentials before continuing${NC}"
            echo ""
            read -p "Press Enter after editing .env..."
        else
            echo -e "${RED}❌ .env file is required. Exiting.${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ .env.sample not found. Cannot create .env${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

echo ""

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --production
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

echo ""

# Create logs directory
mkdir -p logs
echo -e "${GREEN}✅ Created logs directory${NC}"

echo ""

# Start services
echo "🚀 Starting services with PM2..."
pm2 start ecosystem.config.js

echo ""
echo -e "${GREEN}✅ Services started successfully!${NC}"
echo ""

# Show status
pm2 status

echo ""
echo "📋 Useful commands:"
echo "  npm run pm2:status   - View status"
echo "  npm run pm2:logs     - View logs"
echo "  npm run pm2:monit    - Monitor dashboard"
echo "  npm run pm2:restart  - Restart services"
echo "  npm run pm2:stop     - Stop services"
echo ""

# Ask about auto-start
read -p "Setup auto-start on boot? (y/n): " setup_startup
if [ "$setup_startup" = "y" ]; then
    echo ""
    echo "Setting up PM2 startup..."
    pm2 startup
    echo ""
    echo -e "${YELLOW}⚠️  Please run the command above (if shown)${NC}"
    echo ""
    read -p "Press Enter after running the startup command..."
    pm2 save
    echo -e "${GREEN}✅ PM2 process list saved${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo "Your services are now running:"
echo "  - API Server: http://localhost:3000"
echo "  - Cron Job: Running in background"
echo ""
echo "View logs: npm run pm2:logs"
echo ""
