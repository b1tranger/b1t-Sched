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
const configPath = path.resolve(__dirname, 'js/firebase-config.js');

try {
  // Read the file
  let content = fs.readFileSync(configPath, 'utf8');

  // Replace placeholders with actual Netlify/Environment variables
  content = content.replace('__FIREBASE_API_KEY__', process.env.FIREBASE_API_KEY || '');
  content = content.replace('__FIREBASE_AUTH_DOMAIN__', process.env.FIREBASE_AUTH_DOMAIN || '');
  content = content.replace('__FIREBASE_PROJECT_ID__', process.env.FIREBASE_PROJECT_ID || '');
  content = content.replace('__FIREBASE_STORAGE_BUCKET__', process.env.FIREBASE_STORAGE_BUCKET || '');
  content = content.replace('__FIREBASE_MESSAGING_SENDER_ID__', process.env.FIREBASE_MESSAGING_SENDER_ID || '');
  content = content.replace('__FIREBASE_APP_ID__', process.env.FIREBASE_APP_ID || '');
  content = content.replace('__FIREBASE_MEASUREMENT_ID__', process.env.FIREBASE_MEASUREMENT_ID || '');

  // Write changes back
  fs.writeFileSync(configPath, content);
  
  console.log('✅ Environment variables successfully injected into firebase-config.js');
} catch (error) {
  console.error('❌ Failed to inject environment variables:', error);
  process.exit(1);
}

