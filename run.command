#!/bin/bash
# Outer macOS launcher - handles space in "claw picker" path
# Double-click from Finder at /Users/jose/Documents/claw picker/
cd "$(dirname "$0")/claw-grab-random-name-picker"

echo "========================================"
echo " Claw Grab - Random Name Picker"
echo " Local Dev Launcher (macOS - outer)"
echo "========================================"
echo ""
echo "Forwarding to project: $(pwd)"
echo ""

if [ ! -f "package.json" ]; then
  echo "[ERROR] Could not find project at $(pwd)"
  echo "Make sure this file is next to claw-grab-random-name-picker/"
  read -p "Press Enter to close..."
  exit 1
fi

# Run the project's launcher
exec ./run.command
