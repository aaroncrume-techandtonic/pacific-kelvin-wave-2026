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

The page does not fetch live NOAA data. Wave, timeline, station-profile, and coastal-impact graphics are illustrative simulations and should not be presented as observations or official forecasts.
