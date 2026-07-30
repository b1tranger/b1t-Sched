// ============================================
// VERCEL SERVERLESS FUNCTION: /api/notices
// Vercel Blob Integration for Notice Caching
// ============================================

import { put, head } from '@vercel/blob';

// Configuration
const BLOB_FILENAME = 'notices.json';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours cache validity

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

    // Step 2: Fetch fresh notices from UCAM Portal Scraper
    const freshNotices = await scrapeUCAMNotices();

    if (!freshNotices || freshNotices.length === 0) {
      throw new Error('No notices could be scraped from UCAM portal.');
    }

    const payload = {
      updatedAt: new Date().toISOString(),
      notices: freshNotices,
      total: freshNotices.length
    };

    // Step 3: Save / Overwrite fresh payload to Vercel Blob
    try {
      const blobResult = await put(BLOB_FILENAME, JSON.stringify(payload), {
        access: 'public',
        addRandomSuffix: false, // Keeps static filename URL notices.json
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
    } catch (_) {}

    return res.status(500).json({
      error: error.message || 'Internal Server Error'
    });
  }
}

// Scraper placeholder — replace with your UCAM login / scraping logic
async function scrapeUCAMNotices() {
  // Scraper returns array of notices: [{ id, title, date, url, pdfUrl }, ...]
  return [];
}
