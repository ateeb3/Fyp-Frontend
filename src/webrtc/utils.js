// src/webrtc/utils.js
export const genSessionId = (len = 6) =>
  Math.random().toString(36).substring(2, 2 + len).toUpperCase();
