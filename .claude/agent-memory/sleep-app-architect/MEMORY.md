# Stardust Dream App -- Architect Memory

## Tech Stack
- **Framework:** Expo SDK 54 + React Native 0.81 + TypeScript
- **Navigation:** Expo Router (file-based, Stack + Tabs)
- **Icons:** @expo/vector-icons (Ionicons)
- **Animations:** React Native Animated API only (no Reanimated)
- **Styling:** StyleSheet.create() exclusively, no third-party UI libs

## Rebrand: Drift -> Stardust (Feb 2026)
- App name: **Stardust** -- "Dream . Drift . Awaken"
- Stardust dreaming + sleep sound app
- Sacred gold + deep indigo void palette
- 5 tabs now (added Journal)

## Color Palette (Stardust, Feb 2026)
- background: `#0C0A14` (deep indigo-black)
- surface: `#16132A` | surfaceElevated: `#1C1835`
- primary: `#C9A84C` (sacred gold) | primaryBright/primaryText/primaryMuted/primaryDim
- saffron: `#D4864A` | purple: `#6B5B95` | purpleDim/purpleGlow
- Category colors: categorySacred, categoryNoise, categoryNature, categoryUrban, categoryAmbient
- OLD removed: categoryWhite, categoryColor

## File Structure (as built)
```
app/
  _layout.tsx, (tabs)/_layout.tsx (5 tabs with labels)
  (tabs)/index.tsx (Dream), sounds.tsx, rituals.tsx, journal.tsx (NEW), settings.tsx
  mixer/_layout.tsx, mixer/index.tsx
components/
  ui/ScreenContainer, Button, Card
  player/BigPlayButton (ripple rings), FadeSelector, MixCarousel, VolumeKnob, MiniPlayer (pulse dot)
  sounds/SoundCard (52px, emoji-based), CategoryRow
  rituals/RitualCard (tag badge MILD/WILD/WBTB), BreathingCircle (gold border)
lib/constants.ts -- COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SOUND_CATEGORIES, STARDUST_RITUALS, DEFAULT_MIXES
```

## Key Patterns
- Sound/ritual/mix data from lib/constants.ts -- never duplicated in screens
- SoundItem: { id, name, emoji, premium, categoryColor }
- RitualItem: { id, name, icon (emoji), duration (string), desc, tag }
- BigPlayButton: 3 ripple rings staggered 1.3s, golden glow, breathing pulse
- Free: 3 layers, 3 journal entries. Premium: 8 layers, unlimited
- Dream Training section in Settings: Reality Checks toggle, WBTB Alarm

## What Still Needs Building
- Audio engine (expo-av), state management (Context+AsyncStorage)
- Superwall/RevenueCat, background playback, sound assets
- Journal screens (new.tsx, [id].tsx), ritual player ([id].tsx)
- AI dream features (OpenAI)
