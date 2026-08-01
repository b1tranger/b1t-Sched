// ============================================
// VERCEL SERVERLESS FUNCTION: /api/notices
// Vercel Blob Integration for Notice Caching
// ============================================

import { put, head } from '@vercel/blob';

// Configuration
const BLOB_FILENAME = 'notices.json';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours cache validity
const DEFAULT_SEED_ID = 760;
const PROBE_RANGE = 20;

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const forceRefresh = req.query.refresh === 'true';

  try {
    // Step 1: Check Vercel Blob cache first (if not forcing refresh)
    if (!forceRefresh) {
      try {
        // Retrieve blob metadata to get current public blob URL
        const blobDetails = await head(BLOB_FILENAME).catch(() => null);

        if (blobDetails && blobDetails.url) {
          const blobRes = await fetch(blobDetails.url);
          if (blobRes.ok) {
            const cachedData = await blobRes.json();
            const lastUpdated = new Date(cachedData.updatedAt || blobDetails.uploadedAt).getTime();
            const ageMs = Date.now() - lastUpdated;

            // If Blob cache is fresh (< 6 hours), return blob content immediately
            if (ageMs < CACHE_TTL_MS && Array.isArray(cachedData.notices) && cachedData.notices.length > 0) {
              console.log(`[Vercel Blob] Serving cached notices (${Math.floor(ageMs / 60000)}m old)`);
              return res.status(200).json({
                ...cachedData,
                source: 'vercel_blob',
                cached: true,
                ageMinutes: Math.floor(ageMs / (1000 * 60))
              });
            }
          }
        }
      } catch (blobErr) {
        console.warn('[Vercel Blob] Read attempt failed, falling back to scraper:', blobErr);
      }
    }

    // Step 2: Fetch fresh notices from UCAM Portal Scraper (probing from seed ID 760, range 20)
    const freshNotices = await scrapeUCAMNotices(DEFAULT_SEED_ID, PROBE_RANGE);

    // Step 2.5: Merge fresh notices with existing stored notices in Blob to keep old loaded notices
    let combinedNotices = Array.isArray(freshNotices) ? [...freshNotices] : [];
    try {
      const blobDetails = await head(BLOB_FILENAME).catch(() => null);
      if (blobDetails && blobDetails.url) {
        const blobRes = await fetch(blobDetails.url);
        if (blobRes.ok) {
          const storedData = await blobRes.json();
          if (Array.isArray(storedData.notices)) {
            const noticeMap = new Map();
            // Store existing notices first
            storedData.notices.forEach(n => {
              if (n && n.id !== undefined && n.id !== null) {
                noticeMap.set(String(n.id), n);
              }
            });
            // Merge fresh notices (overwriting or appending)
            freshNotices.forEach(n => {
              if (n && n.id !== undefined && n.id !== null) {
                noticeMap.set(String(n.id), n);
              }
            });
            combinedNotices = Array.from(noticeMap.values());
            combinedNotices.sort((a, b) => (parseInt(b.id, 10) || 0) - (parseInt(a.id, 10) || 0));
          }
        }
      }
    } catch (mergeErr) {
      console.warn('[Vercel Blob] Could not merge with existing notices, using fresh notices:', mergeErr);
    }

    if (!combinedNotices || combinedNotices.length === 0) {
      throw new Error('No notices could be scraped or loaded.');
    }

    const payload = {
      updatedAt: new Date().toISOString(),
      seedId: DEFAULT_SEED_ID,
      notices: combinedNotices,
      total: combinedNotices.length
    };

    // Step 3: Save merged payload to Vercel Blob
    try {
      const blobResult = await put(BLOB_FILENAME, JSON.stringify(payload), {
        access: 'public',
        addRandomSuffix: false, // Keeps static filename URL notices.json
        allowExisting: true,   // Allows overwriting existing notices.json
        contentType: 'application/json'
      });
      payload.blobUrl = blobResult.url;
      console.log('[Vercel Blob] Successfully saved notices.json to Vercel Blob:', blobResult.url);
    } catch (putErr) {
      console.error('[Vercel Blob] Write failed:', putErr);
    }

    return res.status(200).json({
      ...payload,
      source: forceRefresh ? 'force_refresh' : 'fresh_fetch',
      cached: false
    });

  } catch (error) {
    console.error('[Notices API Error]:', error);

    // Emergency Fallback: Attempt reading stale blob if scraper fails
    try {
      const blobDetails = await head(BLOB_FILENAME).catch(() => null);
      if (blobDetails && blobDetails.url) {
        const blobRes = await fetch(blobDetails.url);
        if (blobRes.ok) {
          const staleData = await blobRes.json();
          return res.status(200).json({
            ...staleData,
            source: 'vercel_blob_stale_fallback',
            warning: 'Upstream scraper unavailable; serving stale cached notices.'
          });
        }
      }
    } catch (_) { }

    return res.status(500).json({
      error: error.message || 'Internal Server Error'
    });
  }
}

// Scraper placeholder — replace with your UCAM login / scraping logic
async function scrapeUCAMNotices(startSeedId = DEFAULT_SEED_ID, range = PROBE_RANGE) {
  // Scraper returns array of notices starting from base seed ID probing up to range IDs ahead
  // Example: [{ id, title, date, url, pdfUrl }, ...]
  return [];
}
