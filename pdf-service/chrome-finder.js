// This file helps find Chrome/Chromium executable paths on different platforms

import fs from 'fs';
import path from 'path';

/**
 * Returns a list of possible Chrome executable paths on different platforms
 */
export function getChromePaths() {
  const chromeExecutables = [
    // Linux
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/snap/bin/chromium',
    // Render.com specific paths
    '/opt/render/project/chrome-linux/chrome',
    '/usr/bin/google-chrome-stable',
    // Add more paths as needed
  ];

  return chromeExecutables.filter(path => {
    try {
      fs.accessSync(path);
      return true;
    } catch (error) {
      return false;
    }
  });
}

/**
 * Finds the first available Chrome executable
 */
export function findChrome() {
  const chromePaths = getChromePaths();
  return chromePaths.length > 0 ? chromePaths[0] : null;
}
