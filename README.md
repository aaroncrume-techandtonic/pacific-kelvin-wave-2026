<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/9ca3a418-e07d-4e50-a1a3-58385c1ca01c

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## NOAA ENSO Data Snapshot

The page's observed ENSO summary is a manually maintained snapshot from the [NOAA Climate Prediction Center's October 2026 ENSO Diagnostic Discussion](https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml). The reported monthly Niño-region SST anomalies are for September 2026. Update the values and bulletin month in `src/data/scientificData.ts` when NOAA publishes a newer discussion.

The North American coastal trajectory is an illustrative scenario, not an observed coastal wave track or official forecast. Its section also embeds NOAA CPC's [equatorial upper-ocean heat-content anomaly plot](https://www.cpc.ncep.noaa.gov/products/intraseasonal/heat_tlon.shtml), refreshed in the browser every 15 minutes. The chart reports 0–300 m pentad anomalies along the equator and is the current observation context; it does not identify a unique wave crest or confirm a North American coastal arrival. The ENSO summary values in `src/data/scientificData.ts` remain a manually maintained snapshot.
