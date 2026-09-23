# Zypher website

Live at **https://prabhu-omkar.github.io/Zypher-website/**

The download site for Zypher. It is one page with an interactive 3D globe of cryptographic algorithms behind the hero, real screenshots of the app, a tabbed tour of the six detection tiers, a working Mosca worksheet, and a link to the v1.0.0 Windows installer.

## Run it

```powershell
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check, then build into dist/
npm run preview    # serve dist/ on http://localhost:4173
```

## Stack

- React 19, Vite, TypeScript
- Tailwind CSS v4. Every colour comes from a CSS variable, with light and dark values in `src/index.css`.
- Motion (`motion/react`) for entrances, scroll-linked effects and springs
- three.js through `@react-three/fiber` for the hero globe. It is lazy-loaded, so three.js stays out of the main bundle.
- Phosphor icons, self-hosted Inter and JetBrains Mono

## Where things live

| Path | What it is |
|---|---|
| `src/lib/site.ts` | Release facts: download URL, version, size, SHA-256. **Update this for each release.** |
| `src/lib/risk.ts` | A copy of the X/Y/Z arithmetic from `backend/analysis/risk_inputs.py`, used by the worksheet |
| `src/components/CryptoGlobe.tsx` | The hero globe: a rotating mix of algorithms, where a click-to-scan highlights the weak ones |
| `src/components/Tiers.tsx` | The six detection tiers, one demo each |
| `src/components/RiskModel.tsx` | The Mosca worksheet |
| `src/components/Pipeline.tsx` | One real finding (RSA-1024) followed through the six pipeline stages |
| `src/components/Outputs.tsx` | CBOM, HTML report and CSV previews, from a real scan |
| `src/components/Principles.tsx` | The offline section, with the network switch |
| `public/shots/` | App and report screenshots, taken from a scan of Zypher's own `backend/` |
| `src/lib/csv-sample.json` | Rows from that scan's CSV export, used by the CSV preview |
| `public/zypher-film.mp4` | The 24-second launch film (`brag-output/brag.mp4`) |

## Shipping a new release

1. Upload `Zypher_Setup.exe` to a GitHub release.
2. Put the new tag, size and SHA-256 in `src/lib/site.ts`. The download button, the verify panel and the release-notes link all read from there.
3. Run `npm run build` and deploy `dist/`.

## Deploying

Every push to `main` builds the site and publishes it to GitHub Pages through `.github/workflows/deploy.yml`. The workflow sets `BASE_PATH` to `/<repo-name>/`, which is where Pages serves a project site.

To host it somewhere that serves from the root instead (a custom domain, Vercel, Netlify), build with the default base:

```powershell
npm run build      # BASE_PATH defaults to /
```

Files in `public/` are referenced through `src/lib/asset.ts`, so they resolve correctly under either base.

## Accessibility and motion

- The page follows the system theme until the visitor picks one with the toggle. The choice is saved in `localStorage`.
- `prefers-reduced-motion` turns off the globe's spin and sweep, the tier autoplay and the scroll-linked effects.
- Clicking or tapping the hero background sends a scan ring across the globe. The weak algorithms it crosses are picked out softly for a few seconds. Nothing on the globe changes on its own.
- On touch screens the globe does not capture drags, so the page still scrolls.
