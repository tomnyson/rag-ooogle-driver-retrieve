#!/bin/bash

# PM2 Setup Script for RAG Google Drive
# This script helps you setup and manage the application with PM2

set -e

echo "🚀 RAG Google Drive - PM2 Setup"
echo "================================"
echo ""

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 is not installed"
    echo ""
    echo "Install PM2 globally:"
    echo "  npm install -g pm2"
    echo ""
    exit 1
fi

echo "✅ PM2 is installed: $(pm2 --version)"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found"
    echo ""
    echo "Please create .env file first:"
    echo "  cp .env.sample .env"
    echo "  # Edit .env with your credentials"
    echo ""
    exit 1
fi

echo "✅ .env file exists"
echo ""

# Create logs directory
mkdir -p logs
echo "✅ Created logs directory"
echo ""

# Show menu
echo "What would you like to do?"
echo ""
echo "1) Start services"
echo "2) Stop services"
echo "3) Restart services"
echo "4) View status"
echo "5) View logs"
echo "6) Setup PM2 startup (auto-start on boot)"
echo "7) Exit"
echo ""

read -p "Enter your choice [1-7]: " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting services..."
        pm2 start ecosystem.config.cjs
        echo ""
        echo "✅ Services started!"
        pm2 status
        ;;
    2)
        echo ""
        echo "🛑 Stopping services..."
        pm2 stop ecosystem.config.cjs
        echo ""
        echo "✅ Services stopped!"
        pm2 status
        ;;
    3)
        echo ""
        echo "🔄 Restarting services..."
        pm2 restart ecosystem.config.cjs
        echo ""
        echo "✅ Services restarted!"
        pm2 status
        ;;
    4)
        echo ""
        pm2 status
        ;;
    5)
        echo ""
        echo "📋 Viewing logs (Ctrl+C to exit)..."
        pm2 logs
        ;;
    6)
        echo ""
        echo "⚙️  Setting up PM2 startup..."
        pm2 startup
        echo ""
        echo "After running the command above, save the PM2 process list:"
        echo "  pm2 save"
        ;;
    7)
        echo ""
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo ""
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "💡 Useful commands:"
echo "  npm run pm2:status   - View status"
echo "  npm run pm2:logs     - View logs"
echo "  npm run pm2:monit    - Monitor dashboard"
echo "  npm run pm2:restart  - Restart services"
echo ""
