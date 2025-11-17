#!/bin/bash
# MediFlow Anvil Startup Script for WSL
# Run this script in WSL to start the local Ethereum blockchain

echo "======================================="
echo "   MediFlow - Anvil Blockchain (WSL) "
echo "======================================="
echo ""
echo "📍 Location: WSL (Windows Subsystem for Linux)"
echo "🌐 RPC URL: http://127.0.0.1:8545"
echo "🔗 Chain ID: 31337"
echo "💰 Each account starts with 10,000 ETH (test)"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Keep this terminal open while using MediFlow"
echo "   - Press Ctrl+C to stop the blockchain"
echo "   - Connect MetaMask to: http://127.0.0.1:8545"
echo ""
echo "======================================="
echo ""

# Check if anvil is installed
if ! command -v anvil &> /dev/null; then
    echo "❌ ERROR: Anvil not found!"
    echo ""
    echo "Please install Foundry first:"
    echo "  1. curl -L https://foundry.paradigm.xyz | bash"
    echo "  2. source ~/.bashrc"
    echo "  3. foundryup"
    echo ""
    exit 1
fi

echo "✅ Anvil found: $(which anvil)"
echo "📦 Version: $(anvil --version)"
echo ""
echo "Starting Anvil blockchain..."
echo ""

# Start Anvil with proper settings for WSL
# --host 0.0.0.0 allows connections from Windows
anvil --host 0.0.0.0 --port 8545
