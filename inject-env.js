import fs from 'fs';
import path from 'path';

// The path to the config file
const configPath = path.resolve('js/firebase-config.js');

try {
  // Read the file
  let content = fs.readFileSync(configPath, 'utf8');

  // Replace placeholders with actual Netlify environment variables
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
