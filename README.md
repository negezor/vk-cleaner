# VK-Cleaner
Clears your personal page using GDPR data.

## Features
- Delete comments in wall, posts, photos, videos and markets
- Delete likes in wall, posts, photos, videos and markets
- Visual feedback to actions

## Requirement
> **[Node.js](https://nodejs.org/) 14.0.0 or newer is required**

> **[VK Archive](https://vk.com/data_protection?section=rules&scroll_to_archive=1) with comments and likes**

## Simple usage

### Windows

- Unpack VK Archive to Archive folder
- Download the [script](https://raw.githubusercontent.com/negezor/vk-cleaner/master/dist/cleaner.js) and put it next to the Archive folder
- Open a terminal in this folder (TIP: Hold <kbd>Shift</kbd> and right-click in the folder, then select `Open command windows here`)
- Typing `node cleaner.js` in terminal and <kbd>Enter</kbd>
- Follow the script instructions
- Congratulations!

### Linux

- Unpack VK Archive to Archive folder
- Open a terminal in this folder
- Typing `curl -s https://raw.githubusercontent.com/negezor/vk-cleaner/master/dist/cleaner.js > cleaner.js && node cleaner.js` in terminal and <kbd>Enter</kbd>
- Follow the script instructions
- Congratulations!

## Manual build

```sh
git clone https://github.com/negezor/vk-cleaner.git
cd vk-cleaner
npm run install
npm run build
node dist/cleaner.js
```
