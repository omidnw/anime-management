#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧹 Cleaning build output directories...${NC}"

# Clean up x64 output
if [ -d "linux-dist-x64" ]; then
  echo -e "${YELLOW}Cleaning linux-dist-x64 directory...${NC}"
  rm -rf linux-dist-x64/dmg linux-dist-x64/macos linux-dist-x64/msi linux-dist-x64/nsis
  echo -e "${GREEN}✅ Removed non-Linux formats from linux-dist-x64${NC}"
fi

# Clean up ARM64 output
if [ -d "linux-dist-arm64" ]; then
  echo -e "${YELLOW}Cleaning linux-dist-arm64 directory...${NC}"
  rm -rf linux-dist-arm64/dmg linux-dist-arm64/macos linux-dist-arm64/msi linux-dist-arm64/nsis
  echo -e "${GREEN}✅ Removed non-Linux formats from linux-dist-arm64${NC}"
fi

# List remaining files
echo -e "${BLUE}📋 Remaining Linux build outputs:${NC}"
if [ -d "linux-dist-x64" ]; then
  echo -e "${YELLOW}x64 Linux builds:${NC}"
  find linux-dist-x64 -type f | sort
fi

if [ -d "linux-dist-arm64" ]; then
  echo -e "${YELLOW}ARM64 Linux builds:${NC}"
  find linux-dist-arm64 -type f | sort
fi

echo -e "${GREEN}✅ All non-Linux formats have been removed.${NC}"
