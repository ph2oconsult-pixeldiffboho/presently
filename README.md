# ✦ Presently — Daily Quotes for a Calmer Mind

AI-powered quote generator drawing from ancient Eastern philosophy, indigenous wisdom, Sufi poetry, Stoic philosophy, and modern inspirational leaders including Rumi, Oprah, Michelle Obama, Mel Robbins, Brené Brown, and many more.

## Architecture

- **Frontend**: Vite + React (single-page app)
- **Backend**: Vercel Serverless Function (`/api/quotes`) proxying Anthropic Claude API
- **AI**: Claude Sonnet generates fresh, non-repeating quotes on demand
- **Fallback**: 65+ curated seed quotes if API is unavailable

## Deploy to Vercel

### 1. Push to GitHub

```bash
cd presently
git init
git add .
git commit -m "Initial commit — Presently wisdom quotes app"
git remote add origin git@github.com:YOUR_USERNAME/presently.git
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel auto-detects Vite — no config changes needed

### 3. Set Environment Variable

In your Vercel project dashboard:

1. Go to **Settings → Environment Variables**
2. Add: `ANTHROPIC_API_KEY` = your Anthropic API key
3. Apply to **Production**, **Preview**, and **Development**
4. Redeploy

### 4. Done!

Your app will be live at `https://presently-xxxxx.vercel.app`

## Local Development

```bash
npm install
cp .env.example .env.local    # Add your API key
npm run dev                    # http://localhost:5173
```

The Vite dev server handles the frontend. For the API route locally, install the Vercel CLI:

```bash
npm i -g vercel
vercel dev    # runs both frontend + serverless functions locally
```

## Project Structure

```
presently/
├── api/
│   └── quotes.js          # Serverless function (Anthropic proxy)
├── src/
│   ├── App.jsx             # Main React component
│   └── main.jsx            # Entry point
├── index.html              # HTML template
├── package.json
├── vite.config.js
├── vercel.json             # Vercel routing config
└── .env.example            # Environment variable template
```

## Features

- 🔄 **Unlimited AI-generated quotes** — never runs out
- 🏷️ **7 categories**: Gratitude, Growth, Mindset, Manifestation, Purpose, Learning, Spiritual
- 🌍 **5 traditions**: Eastern, Western, Indigenous, Modern, African
- ♥ **Favorites** — save quotes you love
- ⏪⏩ **History navigation** — browse back through quotes you've seen
- 🎨 **Dark luxe UI** — Cormorant Garamond + Outfit typography
- 📱 **Fully responsive** — works on mobile and desktop
- ⚡ **Smart prefetching** — quotes load instantly via background buffering
