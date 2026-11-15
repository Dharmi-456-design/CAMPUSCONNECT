/**
 * config.js — Central Application Configuration
 * Contains configurable URLs for APK distribution and GitHub repository.
 */

export const APP_CONFIG = {
  APP_NAME: 'CampusOne',
  APP_SUBTITLE: 'CampusOne – Android Application',
  APP_VERSION: '1.0.0',
  RELEASE_BUILD: '2026.1',
  DEVELOPER_NAME: 'Dharmi Patel',
  DEVELOPER_INFO: 'Dharmi Patel • CampusOne Project',
  INSTITUTION: 'Shree Swaminarayan Institute of Technology (SSIT), Swaminarayan University',
  GITHUB_REPO_URL: 'https://github.com/Dharmi-456-design/CAMPUSCONNECT',
  // Configured public Google Drive APK URL (fallback to public Google Drive file URL if env is set)
  APK_DOWNLOAD_URL:
    process.env.EXPO_PUBLIC_APK_DOWNLOAD_URL ||
    'https://drive.google.com/uc?id=1V8e7qXjN9kM3rY0pZaW5uLt6sQ4dF2gH&export=download',
};

export default APP_CONFIG;
