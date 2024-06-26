# VK-Cleaner
Clears your personal page using GDPR data.

## Features
- Delete comments in wall, posts, photos, videos and markets
- Delete likes in wall, posts, photos, videos and markets
- Visual feedback to actions

## Requirement
> **[Node.js](https://nodejs.org/) 20.0.0 or newer is required**

> **[VK Archive](https://vk.com/data_protection?section=rules&scroll_to_archive=1) with comments and likes**

## Simple usage

### Windows 10 build 17063 or higher

- Unpack VK Archive to `Archive` folder
- Open a terminal in near `Archive` folder (TIP: Hold <kbd>Shift</kbd> and right-click in the folder, then select `Open command windows here` or just right-click in the folder, then select `Open in Terminal`)
- Typing `curl -s https://raw.githubusercontent.com/negezor/vk-cleaner/master/dist/cleaner.mjs > cleaner.mjs` in terminal and <kbd>Enter</kbd>
- Typing `node cleaner.mjs` in terminal and <kbd>Enter</kbd>
- Follow the script instructions
- Congratulations!

### Windows

- Unpack VK Archive to `Archive` folder
- Download the [script](https://raw.githubusercontent.com/negezor/vk-cleaner/master/dist/cleaner.mjs) and put it next to the `Archive` folder
- Open a terminal in near `Archive` folder (TIP: Hold <kbd>Shift</kbd> and right-click in the folder, then select `Open command windows here` or just right-click in the folder, then select `Open in Terminal`)
- Typing `node cleaner.mjs` in terminal and <kbd>Enter</kbd>
- Follow the script instructions
- Congratulations!

### Linux

- Unpack VK Archive to `Archive` folder
- Open a terminal in near `Archive` folder
- Typing `curl -s https://raw.githubusercontent.com/negezor/vk-cleaner/master/dist/cleaner.mjs > cleaner.mjs && node cleaner.mjs` in terminal and <kbd>Enter</kbd>
- Follow the script instructions
- Congratulations!

## Manual build

```sh
git clone https://github.com/negezor/vk-cleaner.git
cd vk-cleaner
npm run install
npm run build
node dist/cleaner.mjs
```
