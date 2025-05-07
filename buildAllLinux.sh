#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Tauri Linux builds for multiple architectures...${NC}"

# Make sure the scripts are executable
echo -e "${YELLOW}Making build scripts executable...${NC}"
chmod +x linuxBuild.x64.sh
chmod +x linuxBuild.sh

# Build for x64 first
echo -e "${YELLOW}===============================================${NC}"
echo -e "${YELLOW}🖥️  Starting x64 (Intel/AMD) Linux build...${NC}"
echo -e "${YELLOW}===============================================${NC}"
./linuxBuild.x64.sh

# Build for ARM64
echo -e "${YELLOW}===============================================${NC}"
echo -e "${YELLOW}🔄 Starting ARM64 Linux build...${NC}"
echo -e "${YELLOW}===============================================${NC}"
./linuxBuild.sh

# Summary
echo -e "${GREEN}✅ All builds completed!${NC}"
echo -e "${BLUE}📦 Build outputs:${NC}"
echo -e "   - x64 (Intel/AMD): ${PWD}/linux-dist-x64"
echo -e "   - ARM64: ${PWD}/linux-dist-arm64"
echo -e "${YELLOW}To install on the target system:${NC}"
echo -e "   - For Debian-based systems: sudo dpkg -i <package.deb>"
echo -e "${GREEN}Done!${NC}"
