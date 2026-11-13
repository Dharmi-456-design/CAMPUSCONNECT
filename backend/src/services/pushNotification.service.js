const axios = require('axios');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Send a push notification to one or multiple Expo push tokens.
 * @param {string|string[]} pushTokens - Single token or array of tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body text
 * @param {object} data - Extra data payload for tap-to-navigate (e.g. { tab: 'notes' })
 */
const sendExpoPush = async (pushTokens, title, body, data = {}) => {
  const tokens = Array.isArray(pushTokens) ? pushTokens : [pushTokens];

  // Filter only valid Expo push tokens
  const validTokens = tokens.filter(
    (t) => typeof t === 'string' && t.startsWith('ExponentPushToken[')
  );

  if (validTokens.length === 0) return;

  await _sendInChunks(validTokens, title, body, data);
};

/**
 * Broadcast a push notification to ALL users who have installed the app.
 * Optionally filter by branch and/or semester.
 * @param {string} title
 * @param {string} body
 * @param {object} data - Tap-to-navigate payload e.g. { tab: 'notes' }
 * @param {object} filter - Optional MongoDB filter e.g. { branch: 'Computer Engg.', semester: 5 }
 */
const sendBroadcastPush = async (title, body, data = {}, filter = {}) => {
  try {
    const User = require('../models/User');

    // Find all users with a valid push token
    const query = { expoPushToken: { $ne: '', $exists: true }, ...filter };
    const users = await User.find(query).select('expoPushToken').lean();

    const tokens = users
      .map((u) => u.expoPushToken)
      .filter((t) => typeof t === 'string' && t.startsWith('ExponentPushToken['));

    if (tokens.length === 0) {
      console.log('[Push Broadcast] No registered devices found');
      return;
    }

    await _sendInChunks(tokens, title, body, data);
    console.log(`[Push Broadcast] Sent to ${tokens.length} device(s): "${title}"`);
  } catch (err) {
    console.error('[Push Broadcast] Failed:', err.message);
  }
};

/**
 * Internal: Send push messages in chunks of 100 (Expo API limit).
 */
async function _sendInChunks(tokens, title, body, data) {
  const messages = tokens.map((token) => ({
    to: token,
    sound: 'default',
    title,
    body,
    data,
    priority: 'high',
    channelId: 'campusconnect',
  }));

  const chunkSize = 100;
  for (let i = 0; i < messages.length; i += chunkSize) {
    const chunk = messages.slice(i, i + chunkSize);
    try {
      await axios.post(EXPO_PUSH_URL, chunk, {
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.error('[Push] Chunk send failed:', err.message);
    }
  }
}

module.exports = { sendExpoPush, sendBroadcastPush };

