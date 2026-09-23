# Zypher Website

[![Live Deployment](https://img.shields.io/badge/Live_Site-GitHub_Pages-2ea44f?style=flat-square)](https://prabhu-omkar.github.io/Zypher-website/)
[![Release](https://img.shields.io/badge/Release-v1.0.0-blue?style=flat-square)](https://github.com/prabhu-omkar/Zypher/releases/tag/v1.0.0)
[![React](https://img.shields.io/badge/React-19.2-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-0.186-black?style=flat-square&logo=three.js)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](LICENSE)

> Official web platform & distribution portal for **Zypher** — the offline cryptographic discovery, inventory audit, and post-quantum migration engine.

---

## Table of Contents
- [Overview](#overview) • [Live Demo](#live-demo) • [Key Features](#key-features)
- [Architecture & Tech Stack](#architecture--tech-stack) • [Directory Structure](#project-directory-structure)
- [Getting Started](#getting-started) • [Engineering Deep-Dive](#core-engineering-deep-dive)
- [Accessibility](#accessibility--motion-design) • [CI/CD](#cicd--deployment) • [Verification](#release-process--verification)

---

## Overview

Modern software ecosystems rely heavily on cryptographic algorithms that will become vulnerable to Cryptanalytically Relevant Quantum Computers (CRQCs). Migrating away from RSA, ECC, and classical Diffie-Hellman requires complete visibility into legacy codebases, binary dependencies, and configuration files.

**Zypher** is an offline-first desktop tool designed to automatically discover, classify, and generate Cryptographic Bills of Materials (CBOM) for post-quantum cryptographic migration.

This repository hosts the **Zypher Web Platform** — a high-performance single-page application built with React 19, Vite, Tailwind CSS v4, Motion, and Three.js. It acts as both an interactive technical showcase of Zypher's internal discovery algorithms and the primary distribution channel for the Windows release installer.

---

## Live Demo

- **Production Site**: [https://prabhu-omkar.github.io/Zypher-website/](https://prabhu-omkar.github.io/Zypher-website/)
- **Desktop Engine Repository**: [https://github.com/prabhu-omkar/Zypher](https://github.com/prabhu-omkar/Zypher)

---

## Key Features

### 1. Interactive 3D Cryptographic Globe
- Rendered via **Three.js** and **`@react-three/fiber`**, asynchronously lazy-loaded to keep initial bundles lightweight.
- Visualizes classic, symmetric, asymmetric, and post-quantum algorithms orbiting in 3D space.
- **Click-to-Scan Beam**: Emits a scanning pulse across the sphere, identifying quantum-vulnerable primitives (RSA, ECDSA, DH) while highlighting post-quantum standards (ML-KEM, ML-DSA, SLH-DSA).

### 2. Mosca's Theorem Quantum Risk Calculator
- Real-time client-side implementation of **Dr. Michele Mosca’s Theorem**: $\text{If } X + Y > Z \implies \text{State of Migration Collapse}$.
  - **$X$ (Shelf-Life)**: Confidentiality retention requirement (configurable from Session to National Security).
  - **$Y$ (Migration Time)**: Time needed to inventory, refactor, and migrate infrastructure.
  - **$Z$ (CRQC Horizon)**: Estimated years until quantum machines break classical public-key cryptography.
- Integrates published data from the **Global Risk Institute (GRI) Quantum Threat Timeline Report 2025**.
- Interactive sliders calculate exact migration deadlines, exposure windows, and risk bands (`Overdue`, `High`, `Medium`, `Low`).

### 3. Six-Tier Cryptographic Detection Tour
Interactive tabbed tour covering Zypher's multi-layered detection engine:
- **Tier 1 — Regex & Baseline**: Fast scanning for legacy APIs (`MD5`, `DES_set_key_checked`, `RC4`).
- **Tier 2 — Tree-sitter AST**: Syntax-aware structural analysis across Python, C/C++, Java, Go, and Rust.
- **Tier 3 — Manifest Scanner**: Package & dependency extraction across 8 ecosystems (npm, PyPI, Maven, Gradle, Cargo, Go Modules, Composer, RubyGems).
- **Tier 4 — YARA Binary Heuristics**: Memory & binary pattern inspection (AES S-boxes, OID sequences, OpenSSL symbols).
- **Tier 5 — Intraprocedural Taint Tracking**: Tracing variable assignments and parameter dataflow into crypto call sites.
- **Tier 6 — Policy & Rule Engine**: Verification against CNSA 2.0, NIST FIPS 203/204/205, BSI, and ANSSI migration baselines.

### 4. End-to-End Analysis Pipeline Tracer
Walks developers through a real cryptographic finding (`RSA-1024` with literal key parameters) through every stage of processing:
$$\text{Source Ingestion} \longrightarrow \text{AST Parsing} \longrightarrow \text{Taint Flow} \longrightarrow \text{Risk Scoring} \longrightarrow \text{Migration Advisory} \longrightarrow \text{CBOM Emission}$$

### 5. CBOM & Audit Artifact Previews
- **CycloneDX 1.6 CBOM**: Formatted cryptographic bill of materials JSON export.
- **RFC 4180 CSV**: Tabular breakdown of asset locations, key lengths, and severity ratings.
- **Executive HTML Report**: Previews of audit dashboards, compliance breakdowns, and migration roadmaps.

### 6. Offline Verification & Windows Release
- Windows v1.0.0 installer metadata with instant download links.
- Interactive checksum verification utility with copy-to-clipboard PowerShell command for SHA-256 integrity checks.

---

## Architecture & Tech Stack

| Layer | Technologies | Purpose |
|---|---|---|
| **Framework** | [React 19](https://react.dev/), [Vite](https://vite.dev/) | Component architecture, modern hooks, and fast development bundling |
| **Language** | [TypeScript 5.x](https://www.typescriptlang.org/) | Strict static typing across components, models, and data structures |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern utility styling with OKLCH CSS variables and zero runtime overhead |
| **3D Graphics** | [Three.js](https://threejs.org/), [@react-three/fiber](https://r3f.docs.pmnd.rs/) | GPU-accelerated interactive algorithm threat globe |
| **Animations** | [Motion](https://motion.dev/) (`motion/react`) | Spring transitions, scroll-progress bar, and staggered reveal animations |
| **Iconography** | [@phosphor-icons/react](https://phosphoricons.com/) | Accessible, consistent vector iconography |
| **Typography** | Inter Variable, JetBrains Mono | Clean interface typography and legible code previews |
| **Linter** | [oxlint](https://oxc-project.github.io/) | High-speed Rust-based code quality checking |

---

## Project Directory Structure

```text
Zypher-website/
├── .github/workflows/deploy.yml # GitHub Actions workflow for Pages deployment
├── public/
│   ├── favicon.svg, og.jpg     # Brand vector icon and OpenGraph preview banner
│   ├── zypher-film.mp4         # 24-second launch product film
│   └── shots/                  # UI screenshots (dashboard, inventory, scan, report)
├── src/
│   ├── components/             # Reusable UI sections and widgets
│   │   ├── CryptoGlobe.tsx     # 3D interactive Three.js globe with click scan
│   │   ├── Deadline.tsx        # RSA-2048 countdown and HNDL threat alert
│   │   ├── Download.tsx        # Release installer download card & hash verifier
│   │   ├── Hero.tsx, Nav.tsx   # Header, navigation, and brand presentation
│   │   ├── Outputs.tsx         # Interactive CBOM, CSV, and HTML report previewer
│   │   ├── Pipeline.tsx        # Six-stage lifecycle walkthrough of an RSA finding
│   │   ├── Principles.tsx      # Privacy tenets, offline-only switch demo
│   │   ├── RiskModel.tsx       # Interactive Mosca worksheet and risk band model
│   │   ├── Showcase.tsx        # Video modal player and application screenshot tabs
│   │   ├── Tiers.tsx           # Deep-dive tabs for the 6 detection tiers
│   │   └── ui.tsx, Footer.tsx  # Design system primitives, logos, and footer
│   ├── lib/                    # Core utilities and business logic
│   │   ├── asset.ts            # Dynamic base-path asset resolution helper
│   │   ├── csv-sample.json     # Sanitized export dataset from internal scan
│   │   ├── risk.ts             # Mosca math, GRI curves, and risk classification
│   │   ├── site.ts             # Central release metadata (version, sha256, urls)
│   │   └── theme.ts            # System-aware theme hook with localStorage memory
│   ├── App.tsx, index.css      # Root application layout, scroll progress & tokens
│   └── main.tsx                # React DOM entry point
├── package.json, vite.config.ts# Dependencies, build tooling, and path config
└── tsconfig.json, index.html   # TypeScript settings and HTML5 metadata
```

---

## Getting Started

### Prerequisites
- **Node.js**: Version `20.x` or higher
- **npm**: Version `10.x` or higher (or `pnpm` / `yarn`)

### Installation & Local Development
```powershell
# 1. Clone the repository and enter project directory
git clone https://github.com/prabhu-omkar/Zypher-website.git
cd Zypher-website

# 2. Install dependencies
npm install

# 3. Start local development server (http://localhost:5173)
npm run dev

# 4. Build production bundle into dist/ & preview
npm run build
npm run preview

# 5. Run static linter
npm run lint
```

---

## Core Engineering Deep-Dive

### Mosca Risk Math & GRI Threat Curve (`src/lib/risk.ts`)

The risk calculator replicates the exact mathematical model implemented in Zypher's desktop engine (`backend/analysis/risk_inputs.py`):

```typescript
export function assess(profile: Profile, migrationYears: number, targetCrqcYear: number): Assessment {
  const currentYear = new Date().getFullYear()
  const z = targetCrqcYear - currentYear
  const slack = z - (profile.years + migrationYears)
  
  // Slack < 0 -> Overdue | Slack <= 3 -> High | Slack <= 7 -> Medium | Slack > 7 -> Low
  const band: Band = slack < 0 ? 'Overdue' : slack <= 3 ? 'High' : slack <= 7 ? 'Medium' : 'Low'
  const exposureYears = slack < 0 ? Math.abs(slack) : 0
  const probability = crqcWithin(z)
  return { slack, startDate, crqcDate, band, exposureYears, probability }
}
```

The probability curve uses consensus findings from the **Global Risk Institute Quantum Threat Timeline Report 2025** (surveying 26 leading quantum physicists and cryptographers), with piecewise linear interpolation for intermediate horizons.

### Centralized Release Truth (`src/lib/site.ts`)

All release-related information is centralized in a single module. Components rendering download links, file sizes, installer names, or cryptographic hashes import from this file to ensure zero divergence:

```typescript
export const RELEASE = {
  version: 'v1.0.0',
  file: 'Zypher_Setup.exe',
  size: '122.1 MB',
  sha256: 'A7339E8FE99BF4FF98F81FA01D60247165C2A619AAB91B2F69E759FEAE47E6F5',
  installPath: String.raw`%LOCALAPPDATA%\Programs\Zypher`,
}
```

### Dynamic Asset Resolution (`src/lib/asset.ts`)

Because the site deploys both to GitHub Pages (subpath `/Zypher-website/`) and custom domains or local environments (root `/`), assets in `public/` are resolved dynamically via Vite's `import.meta.env.BASE_URL`:

```typescript
export function asset(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${import.meta.env.BASE_URL}${cleanPath}`
}
```

### Modern Design System (`src/index.css`)

Tailwind CSS v4 custom variables defined using `oklab` / `oklch` color spaces provide clean transitions between Dark and Light modes:
- `--ink`, `--ink-soft`, `--ink-muted`: Semantic typography contrast tokens.
- `--surface`, `--sunken`, `--solid`: Layered background elevations.
- `--accent`, `--accent-soft`, `--accent-line`: Brand accent colors.
- `--critical`, `--high`, `--medium`, `--low`: Standardized security severity tiers.

---

## Accessibility & Motion Design

1. **Theme Persistence**: Follows system preference (`prefers-color-scheme`) by default; manual toggle is saved in `localStorage`.
2. **Reduced Motion**: Full support for `prefers-reduced-motion: reduce`. Disables globe spin, pauses tier autoplay, and simplifies spring transitions.
3. **Non-Intrusive Touch Scrolling**: Pointer event handlers on the Three.js canvas prevent orbital controls from hijacking mobile swipe gestures.
4. **Skip Link**: An accessible jump-to-content anchor (`#main`) allows keyboard and screen-reader users to skip navigation immediately.

---

## CI/CD & Deployment

Every push to `main` automatically triggers deployment to **GitHub Pages** via `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          BASE_PATH: '/Zypher-website/'
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - uses: actions/deploy-pages@v4
        id: deployment
```

For hosting on a custom domain or root URL:
```powershell
npm run build      # BASE_PATH defaults to '/'
```

---

## Release Process & Verification

### Shipping an Update
1. Upload the signed `Zypher_Setup.exe` binary to the GitHub release.
2. Update `src/lib/site.ts` with the new version tag, file size, and calculated SHA-256 hash.
3. Push changes to `main` to trigger the automatic Pages rebuild.

### Integrity Verification
Users can independently verify downloaded installer binaries prior to execution:

**PowerShell (Windows):**
```powershell
Get-FileHash .\Zypher_Setup.exe -Algorithm SHA256
```

**Bash (Linux / macOS):**
```bash
sha256sum Zypher_Setup.exe
```

Expected SHA-256 Hash (`v1.0.0`): `A7339E8FE99BF4FF98F81FA01D60247165C2A619AAB91B2F69E759FEAE47E6F5`

---

## Contributing & License

Contributions, bug reports, and enhancements are welcome:
1. Fork the repository & create a feature branch (`git checkout -b feature/improvement`).
2. Commit changes with semantic messages (`git commit -m "feat: add interactive tier filter"`).
3. Push to your branch and submit a Pull Request.

This project is licensed under the [MIT License](LICENSE).

---
<p align="center">
  <b>Zypher</b> — Post-Quantum Cryptographic Discovery & Migration Readiness Engine<br>
  Developed by <a href="https://github.com/prabhu-omkar">Omkar Prabhu</a>
</p>
