# Year in Review Enhancement Plan
*Inspired by Spotify Wrapped, YouTube Rewind, Reddit Recap*

## Overview
Transform the Year in Review page from a static dashboard into an engaging, story-driven experience that celebrates the user's year with animations, insights, and shareable moments.

## Current State Analysis

### What Works Well
- ✅ Comprehensive data collection (11 sources: media, parks, exercises, mood, journals, habits, tasks, goals, GitHub, Steam)
- ✅ Clean card-based layout with Recharts visualizations
- ✅ Share functionality with PNG generation
- ✅ Year selector and Steam sync
- ✅ All necessary libraries available (framer-motion, canvas-confetti, recharts)

### What's Missing (vs. Spotify Wrapped)
- ❌ No progressive reveal animations or storytelling
- ❌ No celebration moments (confetti, milestone callouts)
- ❌ No personalized insights ("You completed X% more tasks than last year")
- ❌ No achievements/badges for milestones
- ❌ No number count-up animations
- ❌ No full-screen carousel/slides experience
- ❌ No year-over-year comparisons
- ❌ No fun facts or surprises
- ❌ Static dashboard feel instead of journey narrative

---

## Enhancement Strategy

### 🎯 Goal
Create a Spotify Wrapped-style experience that:
1. **Tells a story** through the user's data
2. **Celebrates achievements** with animations and confetti
3. **Reveals insights** progressively
4. **Encourages sharing** with individual stat cards
5. **Feels premium** with smooth animations and polish

---

## Implementation Priority

### 🔥 High Priority (MVP - Wrapped v1)
1. Story Mode with slides
2. Number count-up animations
3. Confetti celebrations
4. Fun facts generator
5. Achievement badges
6. Staggered card animations
7. Enhanced shareable cards

### 🎯 Medium Priority (Wrapped v2)
8. Year-over-year comparisons
9. Background gradients
10. Deep dive modals
11. Activity heatmap
12. Mood journey timeline

### 💡 Nice to Have (Future)
13. Custom illustrations
14. Share templates
15. Compare with friends
16. Media timeline

---

## Technical Architecture

### New Files to Create

```
/components/widgets/yearly/
├── story-mode.tsx              # Full-screen slide experience
├── story-slide.tsx             # Individual slide component
├── achievement-badge.tsx       # Badge display component
├── shareable-variants.tsx      # Multiple share card formats
├── deep-dive-modal.tsx         # Expandable detail views
├── activity-heatmap.tsx        # Calendar heatmap
├── mood-timeline.tsx           # Emotional journey visualization
└── media-timeline.tsx          # Consumption timeline

/components/ui/animations/
├── animated-number.tsx         # Count-up number animation
├── stagger-container.tsx       # Staggered children wrapper
└── scroll-reveal.tsx           # Scroll-triggered animations

/lib/data/
├── yearly-insights.ts          # Generate fun facts and insights
├── yearly-achievements.ts      # Define and check achievements
└── yearly-comparisons.ts       # Year-over-year delta calculations

/lib/
├── confetti.ts                 # Confetti effect helpers
└── animation-variants.ts       # Reusable framer-motion variants
```

---

See full plan details in this file for complete implementation specifications.
