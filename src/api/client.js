// src/api/client.js
// Axios instance with base URL and default headers.
// All API calls go through this — never use fetch directly.

import axios from 'axios';
import { Config } from '../constants/config';

const client = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 10000, // 10 second timeout — don't wait forever on bad connections
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — log outgoing requests in dev
client.interceptors.request.use(
  (config) => {
    if (__DEV__) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — log errors in dev
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__) {
      console.log('[API Error]', error.message);
    }
    return Promise.reject(error);
  }
);

export default client;