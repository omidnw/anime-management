# GitHub Workflows

This directory contains GitHub Actions workflows for automating various tasks.

## Release Workflow

The `release.yml` file defines a workflow that automatically builds the Anime Management application for multiple platforms when a new tag is pushed.

### Supported Platforms

The workflow builds the application for:

- **Windows** (x64)
- **macOS** (Universal Binary: Intel + Apple Silicon)
- **Linux** (x64)
- **Android** (APK)
- **iOS** (IPA)

### How to Trigger a Release Build

To trigger the release workflow:

1. Create and push a new tag locally

```bash
# Create a new tag locally
git tag v1.0.0

# Push the tag to GitHub
git push origin v1.0.0
```

2. The workflow will automatically start when the tag is pushed
3. When the build completes, it will create a draft release with all the built artifacts
4. You can find the draft release in the "Releases" section of your GitHub repository
5. Review the release, add release notes, and publish it when ready

### Requirements

For iOS builds to work properly, you will need to:

- Configure code signing by adding the following secrets to your GitHub repository:
  - `APPLE_CERTIFICATE` - Base64 encoded Apple signing certificate
  - `APPLE_CERTIFICATE_PASSWORD` - Password for the certificate
  - `APPLE_TEAM_ID` - Your Apple Team ID
  - `APPLE_PROVISIONING_PROFILE` - Base64 encoded provisioning profile

For Android builds, make sure to:

- Configure signing keys by adding the following secrets:
  - `ANDROID_KEYSTORE` - Base64 encoded keystore file
  - `ANDROID_KEYSTORE_PASSWORD` - Keystore password
  - `ANDROID_KEY_ALIAS` - Key alias
  - `ANDROID_KEY_PASSWORD` - Key password

### Workflow Configuration

The workflow is configured to:

- Create draft releases (not automatically published)
- Include both debug and release builds for mobile platforms
- Use universal build targets where possible
- Archive artifacts with platform-specific extensions (.exe, .dmg, .AppImage, .apk, .ipa)
