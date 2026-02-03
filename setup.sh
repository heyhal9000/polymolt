#!/bin/bash

set -e

echo "🦞 Setting up Polymolt..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd app
npm install
cd ..

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Build Anchor program
echo "⚓ Building Anchor program..."
cd programs/polymolt
cargo build-bpf
cd ../..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start development:"
echo "   npm run dev          # Starts both server and frontend"
echo ""
echo "Or run separately:"
echo "   npm run dev:server   # WebSocket server on :3001"
echo "   npm run dev:app      # Next.js frontend on :3000"
echo ""
echo "📁 Project structure:"
echo "   programs/polymolt/   # Solana Anchor program"
echo "   app/                 # Next.js frontend"
echo "   server/              # WebSocket chat server"
echo ""
