#!/bin/bash

echo "🎮 Setting up Aethoria Console..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "🐍 Installing backend dependencies..."
cd api
pip install -r requirements.txt
cd ..

# Create environment files
echo "🔧 Setting up environment files..."

# Frontend .env.local
if [ ! -f .env.local ]; then
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/game
EOF
    echo "✅ Created .env.local"
fi

# Backend .env
if [ ! -f api/.env ]; then
    cat > api/.env << EOF
# Database
DATABASE_URL=postgresql://user:password@localhost/aethoria_db

# Redis
REDIS_URL=redis://localhost:6379

# AI APIs
OPENROUTER_API_KEY=your_openrouter_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Security
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Environment
ENVIRONMENT=development
DEBUG=true
EOF
    echo "✅ Created api/.env"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit api/.env with your API keys"
echo "2. Start the backend: cd api && python main.py"
echo "3. Start the frontend: npm run dev"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "For production deployment, see README.md" 