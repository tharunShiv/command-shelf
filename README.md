# Command Helper

A Command Cheat Sheet application. .

---

# 📖 User Guide

## 🚀 Installation (via Homebrew)

To install Command Helper, run the following commands in your terminal:

```bash
# 1. Add the custom tap
brew tap tharunShiv/homebrew-ch

# 2. Install the app
brew install --cask command-helper
```

### ⚠️ "App is Damaged" / "Cannot be opened" Error

Since this app is not notarized by Apple yet, macOS may block it. To fix this, run:

```bash
xattr -cr "/Applications/Command Helper.app"
```

## 🎮 How to Use

1.  **Open/Close:** Use the hotkey `Command+Shift+D` to toggle the app.
2.  **Search:** Type to search for commands.
3.  **Copy:** Press `Enter` or click on a command to copy it to your clipboard.
    *   *Note:* The copied command will be prefixed with a comment (e.g., `# `) to prevent accidental execution when pasting into a terminal.

## 🔄 How to Update

If a new version is released, update your local copy by running:

```bash
# 1. Update Homebrew's database
brew update

# 2. Upgrade the app
brew upgrade command-helper
```

## �️ Uninstallation

```bash
brew uninstall --cask command-helper
```

---

# 👨‍💻 Developer Guide

## Running the Code Locally

1.  **Install dependencies:**
    ```bash
    npm i
    ```

2.  **Start Development Server:**
    ```bash
    npm run dev
    ```
    This starts Vite and Electron together. The main window launches fullscreen. A small popup can be toggled from the tray icon or with the shortcut `Command+Shift+D`.

## Build macOS App

To package a macOS DMG using electron-builder:

```bash
npm run dist
```

## Clean Build Artifacts

```bash
rm -rf node_modules dist electron/*.js && npm cache clean --force
```

## Releasing a New Version

*This section is for the maintainer.*

### Step 1: Create a Release
1.  Build the new `.dmg` file.
2.  Create a new Release on the [GitHub Repository](https://github.com/tharunShiv/command-helper).
3.  Upload the `.dmg` as an asset.
4.  Copy the download link of the new `.dmg`.

### Step 2: Get the SHA256 Checksum
Run this command (replace URL with your new link):
```bash
curl -L <NEW_DMG_URL> | shasum -a 256
```

### Step 3: Update the Cask
1.  Open `Casks/command-helper.rb` in the homebrew tap repository.
2.  Update the `version` number.
3.  Update the `sha256` string.
4.  **Important:** Ensure the `url` logic matches the new filename.

### Step 4: Push Changes
```bash
git add .
git commit -m "Upgrade command-helper to vX.X.X"
git push
```