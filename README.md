# NextLevel 🎮

**Family game finder** — filter 90+ curated games by age, console, co-op, and budget.

## Deploy to Vercel (3 steps)

### 1. Install dependencies
```bash
npm install
```

### 2. Run locally
```bash
npm run dev
```
Open http://localhost:5173

### 3. Deploy
```bash
npm install -g vercel
vercel --prod
```

That's it. No environment variables needed.

---

## Stack
- **React 18** + **Vite**
- **RAWG API** for game thumbnails (free key included)
- **localStorage** for child profiles and wishlist persistence

## Project structure
```
nextlevel/
├── index.html          # Entry point + meta/OG tags
├── public/
│   ├── og-image.png    # 1200×630 OG image for social sharing
│   └── favicon.svg     # NL logo favicon
├── src/
│   ├── main.jsx        # React root
│   └── App.jsx         # Full app (single component file)
├── vite.config.js
└── package.json
```

## Features
- 90+ games: Switch, Switch 2, PS5, Xbox, PC, Mobile
- Child profiles with age-appropriate auto-filtering
- Platform-aware recommendations
- Gift bundle builder with budget slider
- Wishlist + side-by-side compare
- Metacritic + IGN scores
- Live game thumbnails via RAWG
