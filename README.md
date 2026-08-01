# Asmin Tumur — Interactive Photography Portfolio

![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-3.12-88CE02?style=flat&logo=greensock&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-0.170-000000?style=flat&logo=three.js&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat&logo=vercel&logoColor=white)

An award-grade, high-performance, interactive photography portfolio application.

🌐 **Live Demo:** [asmintumur.vercel.app](https://asmintumur.vercel.app/)

---

## 🌟 Key Features

- **Interactive 3D & GSAP Gallery Scene:** Built with `GSAP` and `SplitText` featuring a fluid 360° cylindrical gallery experience with keyboard navigation (`ArrowLeft`, `ArrowRight`, `Escape`, `+`, `-`) and smooth zoom controls.
- **Zero-Loss Responsive Image Pipeline:** Automated image processing script powered by `sharp` converting raw photography into multi-resolution variants (`Desktop 1920w`, `Tablet 1080w`, `Mobile 640w`) across next-gen `AVIF` and `WebP` formats. Achieves 91.3% bandwidth savings with virtually zero visual degradation.
- **3D WebGL Canvas Experience:** Dynamic shattered glass particle system on the 404 page powered by `Three.js`, `@react-three/fiber`, and `@react-three/drei`.
- **Comprehensive SEO & Performance:** Configured with `react-helmet-async` for dynamic metadata, Open Graph cards, semantic HTML5 structure, and zero Cumulative Layout Shift (CLS).
- **Type-Safe Architecture:** Modular React architecture written in strict-mode TypeScript.

---

## 🛠️ Tech Stack

### Core Framework & Build
- **[Vite](https://vitejs.dev/)** — Lightning-fast HMR and optimized Rollup bundler.
- **[React 18](https://react.dev/)** — Declarative UI library.
- **[TypeScript](https://www.typescriptlang.org/)** — Static type checking and safe code design.

### Animation & 3D Rendering
- **[GSAP (GreenSock Animation Platform)](https://greensock.com/gsap/)** — High-performance timeline animations and SplitText plugin.
- **[Three.js](https://threejs.org/) & [React Three Fiber](https://r3f.docs.pmnd.rs/)** — WebGL 3D rendering engine and React reconciler for Three.js.

### Image Processing & Styling
- **[Sharp](https://sharp.pixelplumbing.com/)** — Ultra-fast Node.js image processing engine for AVIF and WebP encoding.
- **Vanilla CSS** — Modern CSS Variables, fluid typography using `clamp()`, and GPU-accelerated transforms.

---

## 📁 Project Architecture

```
asmin-tumur-portfolio/
├── public/
│   ├── medias/           # Optimized responsive (.avif, .webp) assets & 3D models
│   └── favicon/          # Platform-specific icons & manifest files
├── scripts/
│   └── optimize-images.js# Multi-resolution zero-loss image processing pipeline
├── src/
│   ├── components/       # Hero, Navigation, Contact, and layout components
│   ├── pages/            # Home, Gallery, and 404 views
│   ├── styles/           # Modular component CSS stylesheets
│   ├── collection.ts     # Gallery data schemas & media mappings
│   ├── App.tsx           # Application routing (React Router v7)
│   └── main.tsx          # Entry point & React DOM Root
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🖼️ Image Optimization Pipeline

Process high-resolution photography with the automated pipeline:

```bash
node scripts/optimize-images.js
```

The script reads raw photography from `public/medias/` and generates 6 optimized outputs per image:
- `Desktop (1920px max)` — WebP (q:92) & AVIF (q:90)
- `Tablet (1080px max)` — WebP (q:90) & AVIF (q:88)
- `Mobile (640px max)` — WebP (q:90) & AVIF (q:88)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `>=18.0.0`
- **pnpm**: `>=9.0.0` (Recommended) or **npm**

### 1. Clone Repository
```bash
git clone https://github.com/woffluon/asmin-tumur-portfolio.git
cd asmin-tumur-portfolio
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Run Development Server
```bash
pnpm dev
```
Open `http://localhost:5173` in your browser.

### 4. Build for Production
```bash
pnpm build
```

### 5. Preview Production Build
```bash
pnpm preview
```

---

## ☁️ Deployment

Deployed on [Vercel](https://vercel.com). CI/CD automatically builds and deploys updates pushed to the `main` branch.

---

## ✒️ Credits & Contact

- **Design & Engineering:** Efe Arabacı ([efearabacı.com](https://xn--efearabac-3pb.com/))
- **Featured Artist:** Asmin Tumur
