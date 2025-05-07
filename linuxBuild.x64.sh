#!/bin/bash
set -e

IMAGE_NAME=tauri-linux-x64-build
CONTAINER_NAME=tauri-linux-x64-build-container
PROJECT_DIR=$(pwd)
BUNDLE_DIR=src-tauri/target/release/bundle
OUTPUT_DIR=linux-dist-x64

echo "🔄 Building Tauri Linux application for x64 via Docker..."

# Build Docker image if not exists
if ! docker image inspect $IMAGE_NAME >/dev/null 2>&1; then
  echo "🔨 Building Docker image for x64..."
  docker build -f Dockerfile.linux-native.x64 -t $IMAGE_NAME .
else
  echo "✅ Using existing Docker image"
fi

# Remove any previous container
docker rm -f $CONTAINER_NAME >/dev/null 2>&1 || true

echo "🚀 Starting x64 build in Docker container..."

# Run build in Docker
docker run --name $CONTAINER_NAME -v "$PROJECT_DIR":/app -w /app $IMAGE_NAME bash -c "
  set -e
  
  # Debug: Print environment info
  echo '📋 Build Environment:'
  echo \"Target: x86_64-unknown-linux-gnu (native)\"
  echo \"Rust version: \$(rustc --version)\"
  echo \"Cargo version: \$(cargo --version)\"
  echo \"Node version: \$(node --version)\"
  
  echo '📦 Installing dependencies...'
  yarn install
  
  echo '🔨 Building Tauri application for x64...'
  yarn tauri build --bundles deb,appimage --target x86_64-unknown-linux-gnu
"

# Check build result
if [ $? -eq 0 ]; then
  echo "✅ x64 build completed successfully"

  # Copy output bundles to ./linux-dist-x64
  mkdir -p $OUTPUT_DIR
  if [ -d "$BUNDLE_DIR" ]; then
    echo "📦 Copying x64 bundles to ./$OUTPUT_DIR"
    cp -r $BUNDLE_DIR/* $OUTPUT_DIR/ || echo "⚠️ No bundles produced. Check for errors above."

    # Remove any non-Linux formats that might have been created
    echo "🧹 Removing non-Linux formats..."
    rm -rf $OUTPUT_DIR/dmg $OUTPUT_DIR/macos $OUTPUT_DIR/msi $OUTPUT_DIR/nsis || true

    echo "✅ Linux x64 bundles are available in ./$OUTPUT_DIR"

    # List the generated files
    echo "📋 Generated files:"
    find $OUTPUT_DIR -type f | sort
  else
    echo "❌ Build directory not found: $BUNDLE_DIR"
    echo "Check the build output for errors."
  fi
else
  echo "❌ x64 build failed"
  docker logs $CONTAINER_NAME
  exit 1
fi
