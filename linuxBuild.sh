#!/bin/bash
set -e

IMAGE_NAME=tauri-linux-arm64-build
CONTAINER_NAME=tauri-linux-arm64-build-container
PROJECT_DIR=$(pwd)
BUNDLE_DIR=src-tauri/target/aarch64-unknown-linux-gnu/release/bundle
OUTPUT_DIR=linux-dist-arm64

echo "🔄 Building Tauri Linux application for ARM64 (aarch64) via Docker..."

# Build Docker image if not exists
if ! docker image inspect $IMAGE_NAME >/dev/null 2>&1; then
  echo "🔨 Building Docker image for ARM64 cross-compilation..."
  docker build -f Dockerfile.linux -t $IMAGE_NAME .
else
  echo "✅ Using existing Docker image"
fi

# Remove any previous container
docker rm -f $CONTAINER_NAME >/dev/null 2>&1 || true

echo "🚀 Starting ARM64 build in Docker container..."

# Run build in Docker with improved environment variables
docker run --name $CONTAINER_NAME -v "$PROJECT_DIR":/app -w /app $IMAGE_NAME bash -c "
  set -e
  
  # Set up environment variables for cross-compilation
  export PKG_CONFIG_ALLOW_CROSS=1
  export PKG_CONFIG_PATH=/usr/lib/aarch64-linux-gnu/pkgconfig
  export PKG_CONFIG_PATH_aarch64_unknown_linux_gnu=/usr/lib/aarch64-linux-gnu/pkgconfig
  export PKG_CONFIG_SYSROOT_DIR=/
  export CARGO_TARGET_AARCH64_UNKNOWN_LINUX_GNU_LINKER=aarch64-linux-gnu-gcc
  export CC_aarch64_unknown_linux_gnu=aarch64-linux-gnu-gcc
  export CXX_aarch64_unknown_linux_gnu=aarch64-linux-gnu-g++
  
  # Debug: Print environment info
  echo '📋 Build Environment:'
  echo \"Target: aarch64-unknown-linux-gnu\"
  echo \"Rust version: \$(rustc --version)\"
  echo \"Cargo version: \$(cargo --version)\"
  echo \"Node version: \$(node --version)\"
  echo \"PKG_CONFIG_PATH=\$PKG_CONFIG_PATH\"
  
  # Debug: Check for required .pc files
  echo '📋 Checking for required .pc files:'
  find /usr/lib/aarch64-linux-gnu/pkgconfig -name '*.pc' | sort
  
  echo '📦 Installing dependencies...'
  yarn install
  
  echo '🔨 Building Tauri application for ARM64...'
  yarn tauri build --target aarch64-unknown-linux-gnu --bundles deb,appimage
"

# Check build result
if [ $? -eq 0 ]; then
  echo "✅ ARM64 build completed successfully"

  # Copy output bundles to ./linux-dist-arm64
  mkdir -p $OUTPUT_DIR
  if [ -d "$BUNDLE_DIR" ]; then
    echo "📦 Copying ARM64 bundles to ./$OUTPUT_DIR"
    cp -r $BUNDLE_DIR/* $OUTPUT_DIR/ || echo "⚠️ No bundles produced. Check for errors above."

    # Remove any non-Linux formats that might have been created
    echo "🧹 Removing non-Linux formats..."
    rm -rf $OUTPUT_DIR/dmg $OUTPUT_DIR/macos $OUTPUT_DIR/msi $OUTPUT_DIR/nsis || true

    echo "✅ Linux ARM64 bundles are available in ./$OUTPUT_DIR"

    # List the generated files
    echo "📋 Generated files:"
    find $OUTPUT_DIR -type f | sort
  else
    echo "❌ Build directory not found: $BUNDLE_DIR"
    echo "Check the build output for errors."
  fi
else
  echo "❌ ARM64 build failed"
  docker logs $CONTAINER_NAME
  exit 1
fi
