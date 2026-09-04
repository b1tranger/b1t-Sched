import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load variables from .env file if missing from process.env
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      value = value.trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

// The path to the config file
const configPath = path.resolve(__dirname, 'js/core/firebase-config.js');

try {
  // Read the file
  let content = fs.readFileSync(configPath, 'utf8');

  // Replace placeholders or existing values with actual environment variables
  if (process.env.FIREBASE_API_KEY) {
    content = content.replace(/(apiKey:\s*["']).*?(["'])/, `$1${process.env.FIREBASE_API_KEY}$2`);
  }
  if (process.env.FIREBASE_AUTH_DOMAIN) {
    content = content.replace(/(authDomain:\s*["']).*?(["'])/, `$1${process.env.FIREBASE_AUTH_DOMAIN}$2`);
  }
  if (process.env.FIREBASE_PROJECT_ID) {
    content = content.replace(/(projectId:\s*["']).*?(["'])/, `$1${process.env.FIREBASE_PROJECT_ID}$2`);
  }
  if (process.env.FIREBASE_STORAGE_BUCKET) {
    content = content.replace(/(storageBucket:\s*["']).*?(["'])/, `$1${process.env.FIREBASE_STORAGE_BUCKET}$2`);
  }
  if (process.env.FIREBASE_MESSAGING_SENDER_ID) {
    content = content.replace(/(messagingSenderId:\s*["']).*?(["'])/, `$1${process.env.FIREBASE_MESSAGING_SENDER_ID}$2`);
  }
  if (process.env.FIREBASE_APP_ID) {
    content = content.replace(/(appId:\s*["']).*?(["'])/, `$1${process.env.FIREBASE_APP_ID}$2`);
  }
  if (process.env.FIREBASE_MEASUREMENT_ID) {
    content = content.replace(/(measurementId:\s*["']).*?(["'])/, `$1${process.env.FIREBASE_MEASUREMENT_ID}$2`);
  }

  // Write changes back
  fs.writeFileSync(configPath, content);
  
  console.log('✅ Environment variables successfully injected into firebase-config.js');
} catch (error) {
  console.error('❌ Failed to inject environment variables:', error);
  process.exit(1);
}

