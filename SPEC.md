# STARDUST — Dream · Drift · Awaken

## The Pitch
**"The lucid dream trainer that also happens to be the best sound app to fall asleep to."**

Stardust is a golden, calm lucid-dream training app. It combines a premium sleep sound engine with actual lucid dreaming techniques (MILD, WILD, WBTB), a dream journal, and a visual identity rooted in sacred geometry and Buddhist warmth. The competition in lucid dreaming apps is weak — dream entries randomly disappear, alarms don't fire, guides are generic. Nobody combines a high-quality sound mixer with real induction techniques. That's the gap.

---

## Product Vision

### What Makes Stardust Different

| Category | Stardust's Position |
|----------|-----------------|
| **Sleep Sounds** | Premium multi-track mixer with procedural audio, seamless loops, bulletproof background playback |
| **Lucid Dreaming** | Real techniques (MILD, WILD, WBTB) as guided rituals that flow into your sleep sounds |
| **Dream Journal** | Quick nightly logging with AI interpretation, symbolism analysis, and dream scene generation |
| **Visual Identity** | Deep indigo void + sacred gold — feels spiritual and premium, not clinical |
| **Business Model** | Free tier genuinely useful for sleep. Premium unlocks lucid features, AI, more sounds |

### Target Audience
- Lucid dreaming enthusiasts (r/LucidDreaming, 500K+ members)
- People who already use a white noise app but want more
- Meditation/mindfulness community crossover
- Anyone curious about dream training
- Parents and tinnitus sufferers (sound engine alone is worth it)

---

## App Architecture

### Tech Stack
- **Framework:** Expo + React Native + TypeScript (Expo SDK 53+)
- **Navigation:** Expo Router (file-based)
- **Audio:** expo-av for playback engine
- **State:** React Context + AsyncStorage for persistence
- **Payments:** Superwall (paywall) + RevenueCat (subscriptions)
- **AI:** OpenAI API for dream interpretation (premium)
- **Backend:** Minimal — bundled sounds + optional cloud sync

### Project Structure
```
stardust/
├── app/
│   ├── _layout.tsx              # Root layout + providers
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigator
│   │   ├── index.tsx            # Dream (home) — one-tap play
│   │   ├── sounds.tsx           # Sound library
│   │   ├── rituals.tsx          # Stardust rituals
│   │   ├── journal.tsx          # Dream journal
│   │   └── settings.tsx         # Settings
│   ├── mixer/
│   │   └── index.tsx            # Full sound mixer
│   ├── ritual/
│   │   └── [id].tsx             # Individual ritual player
│   └── journal/
│       ├── new.tsx              # New dream entry
│       └── [id].tsx             # View/edit entry
├── components/
│   ├── ui/                      # Base elements
│   ├── player/                  # BigPlayButton, MiniPlayer, etc.
│   ├── sounds/                  # SoundCard, CategoryRow
│   ├── rituals/                 # RitualCard, BreathingCircle
│   └── journal/                 # DreamEntry, DreamPrompt
├── lib/
│   ├── audio/                   # engine, mixer, crossfade, background
│   ├── hooks/                   # useAudioEngine, useMixer, useFadeTimer, etc.
│   ├── storage.ts               # AsyncStorage wrapper
│   ├── constants.ts             # Design tokens + sound/ritual data
│   └── utils/
├── types/
│   ├── audio.ts
│   ├── ritual.ts
│   ├── journal.ts
│   └── app.ts
└── assets/sounds/
```

### Design Tokens (from lib/constants.ts)
```typescript
COLORS = {
  background: '#0C0A14',      // Deep indigo-black (dream void)
  surface: '#16132A',          // Card surface
  surfaceElevated: '#1C1835',  // Modals, mixer
  primary: '#C9A84C',          // Sacred gold
  primaryBright: '#E0C56E',    // Highlighted gold
  primaryMuted: '#C9A84C15',   // Gold glow (12%)
  primaryDim: '#C9A84C0A',     // Subtle gold (6%)
  primaryText: '#D4B65E',      // Gold text
  saffron: '#D4864A',          // Warm saffron accent
  purple: '#6B5B95',           // Dream purple
  textPrimary: '#E8E0D0',      // Warm parchment
  textSecondary: '#7B7590',    // Muted lavender
  textTertiary: '#463F5E',     // Very subtle
}
```

---

## Feature Specifications

### 1. Dream Screen (Home) — One-Tap Play
- "STARDUST" wordmark (serif, letter-spaced, gold)
- Tagline: "dream · drift · awaken"
- Giant 140px circular play button with mandala/lotus styling
- Playing state: golden glow + ripple rings radiating outward
- Current mix name + emoji
- Saved mix pills (swipeable)
- Fade timer pills (15/30/45/60/∞)
- Subtle mandala geometry rotating in background
- Background "breathes" between two near-black tones

### 2. Sound Library
- Categories: Sacred, Color Noise, Nature, Ambient
- Sacred sounds: Singing Bowl, Om Drone, Wind Bells (free)
- Circular icons with category-color glow
- Gold ring on active sounds, lock badge on premium
- Active mix strip at top
- Toast feedback on add

### 3. Sound Mixer
- Track rows: emoji icon → name → volume slider → percentage → remove
- Gold-filled slider tracks
- Layer count: "3 of 3" (free) / "X of 8" (premium)
- Add Sound + Save Mix buttons

### 4. Stardust Rituals (Premium)
Real lucid dreaming techniques, not generic meditations:

- **Dream Induction (MILD)** — 8 min: Reality check anchoring, mnemonic induction
- **Dream Breathing (WILD)** — 4 min: 4-7-8 pattern targeting hypnagogia
- **Body Dissolve (WILD)** — 6 min: Progressive relaxation toward sleep paralysis
- **Dream Intention (MILD)** — 3 min: Set tonight's lucid dream goal
- **Wake Back to Bed (WBTB)** — Timer: Smart alarm for peak REM window

Each ritual flows into the user's default sleep mix on completion.
Free users see blurred cards with frosted overlay + "Unlock Stardust Pro" button.

### 5. Dream Journal
- **Quick Log**: Morning prompt "What did you dream?" with text entry
- **Entry List**: Chronological, each entry shows date + preview + dream signs
- **AI Features** (Premium):
  - "Summarize" — condense rambling notes into clear narrative
  - "Interpret" — symbolism analysis with Jungian/dream dictionary context
  - "Visualize" — generate a dream scene image/poster
- **Dream Signs**: Track recurring symbols to improve lucid awareness

### 6. Settings
- **Account**: Subscription status, Upgrade to Stardust Pro, Restore Purchases
- **Sound**: Default fade timer, haptic feedback toggle, audio quality
- **Dream Training**: Reality check reminders (frequency + style), WBTB alarm timing, lucid mode toggles
- **About**: Version, privacy, terms, feedback

### 7. Smart Fade Timer
Same as before — non-linear curve, no visible countdown, pauses on screen unlock.

### 8. Bulletproof Background Audio
Same requirements — survives screen lock, Bluetooth drops, low memory.

---

## Freemium Model

| Feature | Free | Stardust Pro ($29.99/yr or $4.99/mo) |
|---------|------|-----------------------------------|
| Sounds | 12 free (sacred + basics) | 50+ full library |
| Mixer layers | 3 max | 8 max |
| Saved mixes | 3 max | Unlimited |
| Fade timer | Basic | Smart non-linear |
| Rituals | Locked | All 5 unlocked |
| Journal | 3 entries | Unlimited + AI features |
| AI dream interpretation | Locked | Unlimited |
| AI dream visualization | Locked | Unlimited |
| WBTB smart alarm | Locked | Full config |
| Reality check reminders | Basic | Full customization |

---

## Tabs

| Tab | Icon | Label |
|-----|------|-------|
| Home | moon | Dream |
| Sounds | musical-notes | Sounds |
| Rituals | sparkles | Rituals |
| Journal | book | Journal |
| Settings | cog | Settings |

Note: 5 tabs. Journal is the new addition for the lucid dreaming angle.

---

## Build Phases

### PHASE 1: Foundation + Audio Engine + Stardust Identity
App boots with Stardust branding, 5-tab navigation, play button, basic audio.

### PHASE 2: Sound Library + Multi-Track Mixer
Sacred sound category, full sound browser, working mixer.

### PHASE 3: Smart Fade Timer + Home Screen Polish
Mandala background, ripple animations, mix carousel, breathing button.

### PHASE 4: Stardust Rituals
MILD, WILD, WBTB guided flows that transition into sleep sounds.

### PHASE 5: Dream Journal
Quick logging, entry list, AI hooks (stubbed for now).

### PHASE 6: Superwall + Premium Gating
Paywall triggers, subscription management, proper free/premium UX.

### PHASE 7: Polish, AI Features & Launch Prep
Micro-interactions, dream AI integration, app icon, TestFlight.

---

## Product Narrative

Stardust is a golden, calm lucid-dream trainer that also happens to be the best sound app to fall asleep to. It combines procedurally-generated sleep sounds with real lucid dreaming techniques — MILD induction, WILD body dissolve, WBTB smart alarms — all flowing seamlessly into your custom soundscape. The dream journal with AI interpretation gives dreamers a reason to come back every morning. No ads, no dark patterns, no feature bloat. Just the tools you need to sleep deeply and dream consciously.

---

*Built by Luke. Dream · Drift · Awaken. 🪷*
