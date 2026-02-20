# 🍽 HQ Meal Planning

Smart family dinner planning with AI-powered grocery lists, store routing, and real-time sync across all family devices.

**Family setup:** 5 people · Wife: vegetarian 🌱 · Dad & oldest daughter: celiac 🌾 · 3 kid-friendly kids

---

## 🚀 Deploy in ~15 Minutes

You already have GitHub, Firebase, and Vercel accounts — here's exactly what to do.

---

### Step 1 — Firebase Setup (~8 min)

#### 1a. Create Firestore database
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Select your project (or create a new one named `hq-meal-planning`)
3. Left sidebar → **Build → Firestore Database** → **Create database**
4. Choose **Production mode** → select your region → **Done**

#### 1b. Get your config keys
1. Click the ⚙️ gear icon → **Project settings**
2. Scroll to **Your apps** → click **`</>`** (Web icon) → register app (name it anything)
3. Copy the `firebaseConfig` object — you need all 6 values

#### 1c. Deploy Firestore security rules
```bash
npm install -g firebase-tools
firebase login
firebase use --add   # select your project
firebase deploy --only firestore:rules
```

---

### Step 2 — Push to GitHub (~2 min)

```bash
cd hq-meal-planning
git init
git add .
git commit -m "🍽 Initial commit — HQ Meal Planning"
```

1. Go to [github.com/new](https://github.com/new) → create a **private** repo named `hq-meal-planning`
2. Follow the "push existing repo" instructions:
```bash
git remote add origin https://github.com/YOUR_USERNAME/hq-meal-planning.git
git branch -M main
git push -u origin main
```

---

### Step 3 — Deploy to Vercel (~5 min)

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → **Import** your `hq-meal-planning` repo
2. Framework: **Vite** (auto-detected)
3. Open **Environment Variables** and add all of these **before** clicking Deploy:

| Variable | Where to find it |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Project Settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Project Settings |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project Settings |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Project Settings |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Project Settings |
| `VITE_FIREBASE_APP_ID` | Firebase Project Settings |
| `VITE_ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `VITE_FAMILY_PIN` | Pick any 4-digit PIN (e.g. `5847`) |

4. Click **Deploy** ✅

Your app will be live at something like `https://hq-meal-planning.vercel.app`

**Share that URL + the PIN with your family.** That's it — no accounts, no sign-up.

---

### Step 4 — Future Updates

```bash
git add .
git commit -m "your change"
git push
```
Vercel auto-deploys every push to `main`. ✅

---

## 🔑 How the app works

- **PIN screen** — 4-digit code keeps the app private. Set via `VITE_FAMILY_PIN` env var. Change it anytime in Vercel → Settings → Environment Variables → redeploy.
- **Shared Firestore doc** — all family devices read/write the same single document in real-time. Pick meals on your phone, your wife sees the grocery list update instantly on hers.
- **Session persistence** — once you enter the PIN, you stay unlocked for the browser session (refreshing doesn't kick you out). Closing the tab requires the PIN again.
- **AI features** — powered by Claude via the Anthropic API. Week planning, grocery list generation with quantities, pantry suggestions, and store routing all call Claude directly from the browser.

---

## 📁 Project Structure

```
hq-meal-planning/
├── src/
│   ├── api/claude.js           # Anthropic API helper
│   ├── components/
│   │   ├── GroceryList.jsx     # Grocery list + aisle routing
│   │   ├── MealCard.jsx        # Shared meal card UI
│   │   ├── MealIdeasTab.jsx    # Browse/filter meals
│   │   ├── PantryTab.jsx       # Pantry matcher + AI suggestions
│   │   ├── PinScreen.jsx       # Family PIN lock screen
│   │   └── WeekPlanner.jsx     # Week planning grid
│   ├── hooks/useFamilyData.js  # Real-time Firestore sync
│   ├── App.jsx                 # Root — PIN gate + tab navigation
│   ├── constants.js            # Meals, categories, helpers
│   ├── firebase.js             # Firebase init
│   ├── index.css
│   └── main.jsx
├── .env.example                # Copy → .env.local, fill in keys
├── .gitignore
├── firebase.json
├── firestore.rules             # Locks DB to only this app's collection
├── index.html
├── package.json
├── vercel.json                 # SPA routing for Vercel
└── vite.config.js
```

---

## ⚠️ Notes

- **Never commit `.env.local`** — it contains your API keys. It's in `.gitignore` but always double-check.
- The Anthropic key is client-side (VITE_ prefix). Fine for personal/family use; for a public app, move AI calls server-side.
- Firestore rules allow open read/write to the `hq-meal-planning` collection but block all other collections. The PIN is the access control layer.
- To change the PIN: update `VITE_FAMILY_PIN` in Vercel → Environment Variables → Redeploy.
