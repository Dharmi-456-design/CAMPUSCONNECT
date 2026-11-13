import { io } from 'socket.io-client';
import { getStorageItem } from '../utils/secureStorage';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://192.168.1.70:5000';

let socket = null;

export const initSocket = async () => {
  const token = await getStorageItem('userToken');

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: false
    });
  }

  if (token && !socket.connected) {
    socket.connect();
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
