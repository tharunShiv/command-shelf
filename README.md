# Linux Command Cheat Sheet

This is a code bundle for Linux Command Cheat Sheet. The original project is available at https://www.figma.com/design/mMVzmGBBLsSOUQeMbN6rHk/Linux-Command-Cheat-Sheet.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start Vite and Electron together. The main window launches fullscreen. A small popup can be toggled from the tray icon or with the shortcut `CommandOrControl+Shift+Space`.

## Build macOS app

Run `npm run dist` to package a macOS DMG using electron-builder.

## Clean

`rm -rf node_modules dist electron/*.js && npm cache clean --force`


# Homebrew Tap for Command Helper

This is the official Homebrew tap for **Command Helper**.

## 🚀 Installation

To install Command Helper, run the following commands in your terminal:

```bash
# 1. Add the custom tap
brew tap tharunShiv/homebrew-ch

# 2. Install the app
brew install --cask command-helper
```

## ⚠️ "App is Damaged" / "Cannot be opened" Error

Since this app is not notarized by Apple yet, macOS may block it with a message saying *"Command Helper is damaged and can't be opened"* or *"Developer cannot be verified."*

**This is a standard macOS security check for apps downloaded from the internet.** To fix this, run the following command in your terminal:

```bash
xattr -cr "/Applications/Command Helper.app"
```

*This command removes the "Quarantine" attribute that triggers the error.*

## 🔄 How to Update (For Users)

If a new version of Command Helper is released, you can update your local copy by running:

```bash
# 1. Update Homebrew's database
brew update

# 2. Upgrade the app
brew upgrade command-helper
```

## 🗑️ Uninstallation

To remove Command Helper from your system:

```bash
brew uninstall --cask command-helper
```

-----

## 👩‍💻 Developer Guide: Releasing a New Version

*This section is for the maintainer.*

### Step 1: Create a Release

1.  Build the new `.dmg` file.
2.  Create a new Release on the main [Command Helper Repository](https://www.google.com/search?q=https://github.com/tharunShiv/command-helper).
3.  Upload the `.dmg` as an asset.
4.  Copy the download link of the new `.dmg`.

### Step 2: Get the SHA256 Checksum

Run this command in the terminal (replace URL with your new link):

```bash
curl -L <NEW_DMG_URL> | shasum -a 256
```

### Step 3: Update the Cask

1.  Open `Casks/command-helper.rb` in this repository.
2.  Update the `version` number.
3.  Update the `sha256` string.
4.  **Important:** Ensure the `url` logic matches the new filename (e.g., if the version changed from `1.0.0` to `1.1.0`).

### Step 4: Push Changes

```bash
git add .
git commit -m "Upgrade command-helper to vX.X.X"
git push
```

```

### Tips for this README:
1.  **Repo Name:** I assumed your tap repo is named `homebrew-ch` based on your previous terminal output (`tharunshiv/ch/command-helper`). If it is named `homebrew-tools`, change `brew tap tharunShiv/ch` to `brew tap tharunShiv/tools`.
2.  **Links:** Make sure to hyperlink the text "Command Helper Repository" to your actual source code repo URL.
```