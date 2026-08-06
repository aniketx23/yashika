# Design Brief — "Lion's Portal" Birthday Invitation

**Deliverable:** One single-page, scroll-driven, animated birthday invitation microsite.
**Primary job:** Get a confirmed RSVP + drink preference from every guest. Everything else serves that.
**Date of event:** Saturday, 8 August 2026, evening — Hyderabad, India.
**Audience:** ~40 friends, 20s–30s, Indian, opening this on a phone from a WhatsApp link.

---

## 0. Read this first — the concept

The event is on **08.08** and is called **"Lion's Portal."** That is not a coincidence.

The **Lion's Gate Portal** is a real (modern, spiritual — not scientific) observance that peaks annually on **August 8 (8/8)**, when the Sun is in **Leo** and the star **Sirius** — the brightest star in the night sky — rises in alignment with Earth and Orion's Belt. In numerology, **8 is the number of infinity and abundance**; on 8/8 it doubles. The symbolic vocabulary is: *lions, solar fire, Sirius, thresholds and gateways, alignment, infinity, manifestation.*

**Build the entire invitation on this.** This is the difference between a generic birthday page and something people screenshot. The guest is not "viewing an invite" — they are **passing through a portal that opens as they scroll.**

> ⚠️ **Assumption to verify with the client:** I inferred the Lion's Gate theme from the event title + the 08.08 date. It is *possible* "Lion's Portal" is simply a venue name with no thematic intent. If so, keep the celestial palette and motion system and drop the astrological copy. Ask before finalising.

---

## 1. Non-negotiable requirements

| # | Requirement | Why |
|---|---|---|
| 1 | **Mobile-first.** Design at 390px, then scale up. | 95%+ of guests open this from a WhatsApp link on a phone. Desktop is the secondary case, not the primary. |
| 2 | **RSVP form is the point.** It must be reachable in under 2 seconds via a persistent CTA. | The host needs a head-count to order food and alcohol. A beautiful invite with a buried RSVP has failed. |
| 3 | **All critical info visible without scrolling to the end.** Date, time, venue, RSVP. | Some people will never scroll. Sticky mini-bar handles this. |
| 4 | **`prefers-reduced-motion` fully respected.** | Non-negotiable accessibility floor. |
| 5 | **Loads fast on Indian mobile data (4G).** No heavy video, no WebGL, no 3D. | A 15MB hero video means half the guest list bounces. |
| 6 | **Every animation runs on `transform` and `opacity` only.** | Animating `width`/`height`/`top` triggers layout and drops frames on mid-range Android. |

---

## 2. Design tokens

### Colour — "Night sky, solar fire"

Deliberately **not** the AI-default palettes (cream + serif + terracotta; near-black + acid green; broadsheet greyscale). This is a deep indigo cosmos lit by solar gold, with a hot magenta for party energy.

```css
--void:      #0B0A1F;  /* deep cosmic indigo — page base. NOT black. */
--deep:      #171339;  /* raised surfaces, cards */
--sirius:    #EDEAFF;  /* starlight — primary text on dark */
--sirius-dim:#9C97C4;  /* secondary text, captions */
--gold:      #F0B429;  /* molten solar gold — the portal light, primary accent */
--gold-deep: #B87914;  /* gold gradient shadow end */
--flare:     #FF3D71;  /* hot magenta — party energy, CTA, Leo fire */
```

**Rules:**
- `--gold` is the light *coming through the portal*. Use it for the aperture glow, rules, and the number 8. Never for large fills.
- `--flare` is reserved almost entirely for the **RSVP button** and hover states. Scarcity makes it read as "press me."
- Gradients only between `--gold` → `--gold-deep`, or `--void` → `--deep`. No rainbow gradients.

### Typography

| Role | Face | Usage |
|---|---|---|
| **Display** | `Bodoni Moda` (Google Fonts) | Names, section titles. High-contrast didone — ceremonial, dramatic, star-like thin/thick strokes. Set large: `clamp(2.5rem, 12vw, 8rem)`. Tight tracking `-0.02em`. |
| **Body** | `Manrope` (Google Fonts) | All prose, form labels. Geometric, warm, highly legible at small sizes. Weights 400/600. |
| **Utility** | `Space Mono` (Google Fonts) | Countdown digits, `08.08.26`, coordinates, RSVP status, the eyebrow labels. Uppercase, tracking `0.18em`. |

The mono/didone tension is the type personality: **astronomical instrument readout meets ceremonial engraving.** Do not substitute a generic sans for the display face.

### Motion physics

```
Ease (standard):   cubic-bezier(0.16, 1, 0.3, 1)   /* expo-out — luxurious settle */
Ease (portal):     cubic-bezier(0.87, 0, 0.13, 1)  /* in-out — mechanical gate */
Reveal duration:   0.8s–1.2s
Stagger:           0.06s–0.1s between siblings
Spring (Motion):   { stiffness: 100, damping: 30, mass: 0.5 }
```

**Slow and heavy, not bouncy.** A portal opening should feel like weight moving, not a notification popping.

---

## 3. Tech stack (use exactly these — names verified against current docs)

- **React + Tailwind CSS**
- **Motion** for animation — ⚠️ the library formerly called **Framer Motion was renamed to Motion** in 2025 and spun out as an independent project. The npm package is now **`motion`**, the import path is **`motion/react`**, and current major version is **v12** (as of early 2026). The old `framer-motion` package still installs but is no longer actively developed. **Import from `motion/react`.** The component and hook APIs are identical to Framer Motion, so existing knowledge transfers.
- **Lenis** for smooth scroll — package `lenis`; the React wrapper `ReactLenis` ships inside the same package at the `lenis/react` subpath (no separate install). It wraps native scroll rather than transforming a container, so `position: sticky`, anchor links, and accessibility keep working.

### Verified APIs you will need

```jsx
import { motion, AnimatePresence, useScroll, useTransform,
         useSpring, useMotionValueEvent, useReducedMotion } from "motion/react"
import { ReactLenis } from "lenis/react"
```

- `useScroll({ target: ref, offset: ["start end", "center center"] })` → returns `scrollYProgress`
- `useTransform(scrollYProgress, [0, 1], [from, to])` → maps scroll to any animatable value, including strings like `clipPath` insets and `filter: blur()`
- `useSpring(scrollYProgress)` → smooths a scroll value (use for the progress bar)
- `whileInView={{ ... }}` + `viewport={{ once: true, amount: 0.4 }}` → one-shot entrance reveals
- `useReducedMotion()` → returns `true` when the OS "Reduce motion" setting is on
- `AnimatePresence` → exit animations (the loading gate, form success state)

**Sticky-scroll pattern for the portal** (this is the core technique — verified from Motion's docs): a tall outer container (e.g. `height: 300vh`) wraps a `position: sticky; top: 0; height: 100vh` inner element. Track the tall container with `useScroll`, then drive the sticky child's transforms from `scrollYProgress`. The taller the outer container, the slower and more cinematic the sequence feels.

> ⚠️ If you are on a different version or the build environment pins an older package, **verify these imports against the current docs before shipping** rather than trusting this brief. Do not invent hook names.

---

## 4. Page structure — 7 scenes

Total scroll length ≈ 700–900vh. Each scene is one idea.

```
┌─────────────────────────────┐
│  00  THE GATE (pre-scroll)  │  Aperture closed, sliver of gold. "Scroll to enter"
├─────────────────────────────┤
│  01  THE OPENING            │  Sticky 300vh — portal widens, name revealed
├─────────────────────────────┤
│  02  THE ALIGNMENT          │  Date / time / place, as star coordinates
├─────────────────────────────┤
│  03  THE COUNTDOWN          │  Live ticking countdown to 8 Aug, 8:08 PM
├─────────────────────────────┤
│  04  WHAT AWAITS            │  Horizontal scroll — the games, food, night
├─────────────────────────────┤
│  05  THE SUMMONS  ★         │  RSVP form — the actual goal
├─────────────────────────────┤
│  06  THE SEAL               │  Map, contact, "see you on the other side"
└─────────────────────────────┘
   + PERSISTENT: sticky bottom bar (mobile) with countdown + RSVP button
   + PERSISTENT: 2px gold scroll-progress rail down the left edge
```

---

### Scene 00 — The Gate

Full viewport. `--void` background. Dead centre: a **thin vertical seam of `--gold` light**, 2px wide, ~40vh tall, with a soft bloom. Above it in `Space Mono`, small and dim: `08 · 08 · 26`. Below: `SCROLL TO ENTER` with a slowly pulsing chevron.

Ambient: 60–80 tiny star points at randomised positions, each drifting with a 6–12s `y` loop at 0.2–0.6 opacity. **CSS/Motion only, no canvas.** One noticeably brighter star, top-right — that's Sirius. Give it a slow twinkle and a tooltip: `SIRIUS · α CMa`.

Entrance: the seam draws from centre outward over 1.4s on load, everything else fades up staggered behind it.

---

### Scene 01 — The Opening ★ SIGNATURE MOMENT

**This is the one thing the page is remembered by. Spend the boldness here.**

Sticky-scroll sequence, 300vh outer container. As `scrollYProgress` runs 0 → 1:

| Progress | What happens |
|---|---|
| 0 → 0.35 | The gold seam **widens into a vertical almond/lens aperture** (a *vesica* shape). Drive with `clipPath` via `useTransform` — e.g. `inset(0% 50% 0% 50%)` → `inset(0% 0% 0% 0%)`, or an ellipse whose x-radius grows. |
| 0.25 → 0.6 | Light spills out: a radial gold glow scales up from centre, `filter: blur()` easing 20px → 0px. |
| 0.4 → 0.75 | **The name appears through the opening**, letter by letter, rising with `y: 40 → 0` and `opacity: 0 → 1`, staggered 0.06s. Bodoni Moda, enormous. |
| 0.6 → 1 | Aperture keeps opening past the viewport edges. Background lifts `--void` → `--deep`. Star field drifts outward (parallax, scale 1 → 1.15). |
| 0.85 → 1 | Beneath the name: `IS TURNING [AGE]` in Space Mono, tracked out wide. |

The sensation must be: **something opened, and you went through it.**

---

### Scene 02 — The Alignment

Present the logistics as an **astronomical readout**, not a wedding card. Mono labels, didone values, hairline gold rules between rows.

```
DATE ——————————————— SATURDAY, 08 AUGUST 2026
TIME ——————————————— [START TIME] ONWARDS
COORDINATES ————————— LION'S PORTAL, HYDERABAD
DRESS ——————————————— [DRESS CODE]
```

Each row wipes in left→right on `whileInView`, staggered 0.1s. The hairline rules draw with `scaleX: 0 → 1`, `transformOrigin: left`.

**Aesthetic risk worth taking:** render a faint, large **Leo constellation** as inline SVG behind this block at ~8% opacity, its stars slowly connecting with drawn lines (`pathLength: 0 → 1`) as the section enters view. It earns its place — it's literally the reason the date matters.

---

### Scene 03 — The Countdown

Live countdown to **8 Aug 2026, 8:08 PM IST** — the 8:08 is a deliberate nod to the 8/8 numerology, and it's a detail guests will notice.

Huge Space Mono digits. Each digit sits in its own overflow-hidden box; on change, the old digit slides up and out while the new slides up and in (`AnimatePresence` with `mode="popLayout"`). Colons pulse once per second at 0.4 opacity.

Below, small and dim: `THE PORTAL PEAKS ON 08/08 — SUN IN LEO, SIRIUS RISING.`

---

### Scene 04 — What Awaits

**Horizontal scroll section.** Verified pattern: a wide flex container inside a `position: sticky` element, inside a tall outer container. Track the tall container with `useScroll`, then `useTransform(scrollYProgress, [0, 1], ["0%", "-75%"])` drives the flex container's `x`.

Four cards, each a promise, not a description:

1. **FEAST** — biryani, burgers, and things on sticks
2. **POTIONS** — mocktails, spirits, and a drink with your name on it
3. **GAMES** — bingo, antakshari, dumb charades, and at least one bad decision
4. **PROOF** — a photo wall, a memory jar, and evidence you were here

Cards: `--deep` fill, 1px `--gold` border at 20% opacity, generous padding, mono eyebrow + didone title + one line of Manrope. On hover, border goes to 60% and the card lifts `y: -8`.

Mobile fallback: if horizontal scroll feels cramped under 480px, stack vertically with staggered `whileInView` reveals instead. **Do not force horizontal scroll on small phones.**

---

### Scene 05 — The Summons ★ THE ACTUAL GOAL

The RSVP. Give it real visual weight — this is what the whole page is for.

**Form fields (these map directly to what the host needs to order):**

| Field | Type | Notes |
|---|---|---|
| Your name | text | required |
| Are you in? | radio | `I'M IN` / `CAN'T MAKE IT` |
| Bringing anyone? | number | 0–2 |
| What are you drinking? | radio | **`DRINK DRINK` / `DRINK` / `LIGHT DRINK` / `NO DRINK`** |
| Veg or non-veg? | radio | for the biryani/burger count |
| Anything we should know? | textarea | optional — allergies, song requests |

> **Critical:** those four drink options are not arbitrary — they mirror the exact categories the host already tracks on their planning list. Keep the labels verbatim so responses drop straight into the existing tally.

**Interaction design:**
- Radio options are **tappable cards**, not native radios. Minimum 48px tap target. Selected state: `--gold` border, subtle inner glow, and a small check that draws itself in.
- Submit button: solid `--flare`, full width on mobile, label `ENTER THE PORTAL`.
- **Success state:** the button morphs into a confirmation panel via `AnimatePresence` — a gold ring draws itself closed, then: `YOU'RE ON THE LIST. — SEE YOU ON THE OTHER SIDE.` No modal, no page change.
- Validate inline and gently. Errors say what to do, not what went wrong: *"Add your name so we know who's coming."*

**Wiring:** the form needs a real backend. Simplest reliable options are a Google Form/Sheets endpoint, Formspree, or Tally. ⚠️ *I have not verified current free-tier limits or setup steps for any of these — check their docs before committing.* A form that looks beautiful and silently discards responses is the single worst possible failure here, so **test one live submission end-to-end before sending the link to anyone.**

---

### Scene 06 — The Seal

Quiet close. Venue name, an embedded map link, and a host contact. Then, centred and small, the aperture seam from Scene 00 **reappears and slowly closes** as the user reaches the bottom — the portal shutting behind them. Final line in Space Mono: `08 · 08 · 26 — SEE YOU ON THE OTHER SIDE.`

---

## 5. Persistent elements

**Sticky bottom bar (mobile) / floating pill (desktop)** — appears after the user scrolls past Scene 01. Contains a compact countdown and an `RSVP` button in `--flare`. Slides in with `y: 100 → 0`. Use `useMotionValueEvent` on `scrollY` to detect direction: hide on scroll-up, show on scroll-down.

**Scroll progress rail** — 2px `--gold` line on the left edge, `scaleY` driven by `useSpring(scrollYProgress)`, `transformOrigin: top`.

---

## 6. Copy — fill the blanks, don't invent them

The host must supply these. **Do not fabricate placeholder values that could get shipped by accident** — render them as visibly bracketed until replaced.

```
[BIRTHDAY PERSON'S NAME]   ← likely "Yashika", but CONFIRM before building
[AGE]                      ← optional; omit the "IS TURNING X" line if not shared
[START TIME]               ← page currently assumes 8:08 PM for the countdown
[FULL VENUE ADDRESS]       ← plus a Google Maps link
[DRESS CODE]
[RSVP DEADLINE]
[HOST NAME + PHONE]
```

**Voice:** warm, a little mystical, never solemn. It's a birthday party wearing a cosmic costume — the tone should wink. Sentence case for prose, uppercase mono only for labels and data.

---

## 7. Quality floor

- ✅ Responsive 360px → 1920px. Test at 390px first.
- ✅ `useReducedMotion()` → when true, replace all scroll-linked transforms with simple opacity fades, disable the star drift, freeze the aperture open. **Content must remain 100% reachable.**
- ✅ Visible keyboard focus rings (`--gold`, 2px offset) on every interactive element.
- ✅ Form fully keyboard-navigable; labels properly associated.
- ✅ Colour contrast: `--sirius` on `--void` passes AA. Check `--sirius-dim` at small sizes — darken if it fails.
- ✅ Star field and constellation SVG are decorative → `aria-hidden="true"`.
- ✅ Open Graph image + title set, so the WhatsApp link preview looks intentional.
- ✅ Works with JavaScript slow to load: content readable, native scroll as fallback.

---

## 8. What NOT to do

- ❌ No cream background + high-contrast serif + terracotta accent. That combination is the current AI-design default and reads instantly as machine-made.
- ❌ No confetti burst on load. No balloon emojis as decoration. No `Great Vibes` script font.
- ❌ No autoplaying music. (An optional, clearly-labelled mute-by-default toggle is fine.)
- ❌ No WebGL, Three.js, or video backgrounds — the mobile-data budget cannot afford it.
- ❌ No animating `width`, `height`, `top`, or `left`. Transform and opacity only.
- ❌ Don't animate everything. The portal opening is the signature; everything around it stays disciplined and quiet. If a second element competes with it, cut the second element.

---

## 9. Build order

1. Static single-column layout, all 7 scenes, real copy, correct type and colour. **Make it good with zero animation first.**
2. Wire the RSVP form and test a live submission end-to-end.
3. Add `whileInView` entrance reveals + stagger.
4. Add Lenis smooth scroll.
5. Build the Scene 01 sticky portal sequence.
6. Add countdown, horizontal scroll, persistent bar.
7. Reduced-motion pass, accessibility pass, 390px pass.
8. Cut one thing. It'll be better.
