if I add the zoom normalization by screen resolution, the timeline view for the activity breakdown/bar chart breaks. the screen gets misaligned or something and the user cannot click the bars directly anymore.

```
/* ============================================
   ZOOM NORMALIZATION BY SCREEN RESOLUTION
   Prevents UI overflow on devices that render
   at non-standard zoom levels.
   Note: CSS zoom is supported in Chromium-based
   browsers (Chrome, Edge, Opera, Samsung Internet).
   ============================================ */
/* @media (max-width: 360px) {
  html {
    zoom: 85%;
  }
}

@media (min-width: 361px) and (max-width: 480px) {
  html {
    zoom: 90%;
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  html {
    zoom: 95%;
  }
}

@media (min-width: 769px) and (max-width: 1366px) {
  html {
    zoom: 90%;
    /* Fixed override for 1366 screens per request
  }
} 

@media (min-width: 1367px) and (max-width: 1920px) {
  html {
    zoom: 100%;
  }
}

@media (min-width: 1921px) {
  html {
    zoom: 110%;
  }
} */
```

