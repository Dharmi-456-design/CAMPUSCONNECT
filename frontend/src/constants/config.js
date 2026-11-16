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
  // Configured public APK URL generated from EAS Build
  APK_DOWNLOAD_URL:
    process.env.EXPO_PUBLIC_APK_DOWNLOAD_URL ||
    'https://expo.dev/artifacts/eas/r2Hcjw5ckhu12eKGlE0ylEUxKQue7ikMllCt_Hef-zQ.apk',
};

export default APP_CONFIG;
