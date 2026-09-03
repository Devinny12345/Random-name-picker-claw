#!/bin/bash
set -e
echo "========================================"
echo " Claw Grab - Random Name Picker"
echo " Local Dev Launcher (macOS / Linux)"
echo "========================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "[ERROR] Node.js is not installed or not in PATH."
  echo "Please install Node.js 18+ from https://nodejs.org/"
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
  echo "[OK] Dependencies installed."
  echo ""
else
  echo "[OK] Dependencies already installed."
  echo ""
fi

echo "Starting dev server on http://localhost:4545 ..."
echo "Press Ctrl+C to stop."
echo ""
npm run dev
