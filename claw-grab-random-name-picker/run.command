#!/bin/bash
# Double-clickable macOS launcher - same as run.sh but handles Finder double-click
# Change to this script's directory (handles space in "claw picker" path)
cd "$(dirname "$0")"

echo "========================================"
echo " Claw Grab - Random Name Picker"
echo " Local Dev Launcher (macOS)"
echo "========================================"
echo ""
echo "Project: $(pwd)"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "[ERROR] Node.js is not installed or not in PATH."
  echo "Please install Node.js 18+ from https://nodejs.org/"
  echo "Then double-click run.command again."
  read -p "Press Enter to close..."
  exit 1
fi
echo "[OK] Node $(node --version)"
echo ""

# Create .env.local from .env.example if missing
if [ ! -f ".env.local" ]; then
  if [ -f ".env.example" ]; then
    echo "[.env.local not found] Creating from .env.example..."
    cp .env.example .env.local
    echo "[OK] Created .env.local - edit it if you need a different Convex URL."
    echo "     Default: https://bright-mink-448.convex.cloud"
    echo ""
  else
    echo "[WARN] No .env.local and no .env.example found."
    echo "       The app will use the built-in fallback Convex URL."
    echo ""
  fi
else
  echo "[OK] Found .env.local"
  echo ""
fi

# Install dependencies if node_modules missing
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies (npm install)..."
  npm install
  if [ $? -ne 0 ]; then
    echo "[ERROR] npm install failed."
    read -p "Press Enter to close..."
    exit 1
  fi
  echo "[OK] Dependencies installed."
  echo ""
else
  echo "[OK] Dependencies already installed."
  echo ""
fi

echo "Starting dev server on http://localhost:4545 ..."
echo "Press Ctrl+C to stop. Close this window to quit."
echo ""
npm run dev
