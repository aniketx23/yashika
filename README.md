# Handoff: The Lion's Portal — Yashika's 23rd Birthday Invitation

## Overview

A single-page, mobile-first, animated birthday invitation microsite. It is a **surprise gift** for Yashika Mahajan, born 8 August 2003 (a Leo), turning 23 on **Saturday 8 August 2026**. Guests open it from a WhatsApp link on a phone.

The concept is the **Lion's Gate Portal** — a real (spiritual, not scientific) observance running 28 July → 12 August, peaking on **8 August (8/8)**, when the Sun sits in Leo and Sirius, the brightest star in the sky, returns to the dawn horizon. Numerologically 8 is infinity/abundance, doubled on 8/8. Everything in the design serves that: the guest does not "view an invite", they **unlock a portal**.

Primary job: get a confirmed **RSVP** (name, yes/no, +guests, veg/non-veg, note) delivered to the host over WhatsApp.

## About the Design Files

The files in `design/` are **design references created in HTML** — a working prototype that demonstrates the intended look, motion, and interaction. **They are not production code to copy directly.**

The task is to **recreate this design in the target codebase's own environment** (React/Next.js, Vue, SvelteKit, native, etc.) using its established patterns, component library, and animation approach. If no codebase exists yet, pick the most appropriate stack — for this artifact a single-route **React + Vite** page (or Next.js app-router page) with `motion` (formerly Framer Motion, import from `motion/react`) plus one `<canvas>` for the sky is the natural fit.

`design/Lions Portal Invite.dc.html` uses a bespoke streaming-template runtime (`support.js`) that exists only in the design tool:
- Markup uses `{{ value }}` holes, `<sc-for list>`, `<sc-if value>` — read these as **JSX `.map()` / conditional rendering**.
- A `class Component extends DCLogic` block holds the logic — read as a **React class/function component**; `renderVals()` returns what the template renders (props, handlers, computed styles).
- `ref="{{ x }}"` are ordinary React refs.
- **All styling is inline** by constraint of that runtime. In the real codebase, move it to whatever the project uses (CSS modules, Tailwind, styled-components).

The cleanest way to read the prototype: open the HTML file in a browser to feel the interactions, then read the logic class for exact numbers.

## Fidelity

**High-fidelity.** Colors, type, spacing, motion curves, and copy are final. Recreate pixel-faithfully at 390px width first, then scale up. All copy in this document is the exact shipped copy.

---

## Screens / Views

The page is one continuous scroll, gated by a lock screen. Section order is fixed.

### 00 · The Gate (lock screen — `position: fixed`, `z-index: 90`)

**Purpose:** the interaction that unlocks the invite. Body scroll is locked (`document.body.style.overflow = 'hidden'`) until it completes.

**Layout:** two full-height door panels, each `width: 50.2%`, left and right, each with a 1px `rgba(240,180,41,.28)` inner edge. Left panel `linear-gradient(115deg,#0B0A1F 22%,#171339 100%)`, right panel `linear-gradient(245deg, …)` (mirrored). Above them, a centered flex column (`gap: clamp(10px,2.4vh,26px)`, padding `24px 18px 64px`) holding, in order:

1. `08 · 08 · 26` — Space Mono 11px, letter-spacing `.5em`, `#9C97C4`, `white-space: nowrap`.
2. Heading **"Draw the infinity"** — Bodoni Moda 600, `clamp(1.45rem, 6.4vw, 2.4rem)`, line-height 1.12, `max-width: 16ch`, `#EDEAFF`.
3. The **lemniscate SVG** — `viewBox="0 0 300 190"`, `width: min(90vw, 460px)`, `max-height: 42vh`. Four stacked paths on the same figure-8 geometry:
   - `d="M150,95 C112,50 56,52 56,95 C56,138 112,140 150,95 C188,50 244,52 244,95 C244,138 188,140 150,95"`
   - guide track: stroke `rgba(237,234,255,.13)`, width **16**, round caps
   - dashed hint: stroke `rgba(240,180,41,.16)`, width 1, `stroke-dasharray: 3 6`
   - **progress path**: stroke `#F0B429`, width **9**, round caps, `filter: drop-shadow(0 0 12px rgba(240,180,41,.9))`, driven by `stroke-dasharray = totalLength`, `stroke-dashoffset = totalLength * (1 - progress)`
   - **head dot**: `r=9`, `#FFE9B0`, `drop-shadow(0 0 16px rgba(255,233,176,1))`, animates `headPulse` (r 8→12) 1.6s infinite; repositioned to the current point on the path
   - behind everything: decorative ellipse `cx=150 cy=95 rx=128 ry=66`, stroke `rgba(240,180,41,.08)`, `stroke-dasharray: 2 7`
4. Live hint line — Space Mono 10.5px `.28em`, `#F0B429`: `START AT THE LIGHT · ONE STROKE` → `KEEP GOING · NN%` → `✦ INFINITY CLOSED`.
5. Sub-line — 12.5px `#9C97C4` at 80% opacity: *"eight on its side is infinity — trace it and the portal knows you"*.
6. Escape hatch button, appears after **9 s** (or immediately with reduced motion), bottom-centered, pill, 1px `rgba(240,180,41,.35)`: **`TRACE IT FOR ME ✦`** — animates the trace to completion over 1.4s.

**The trace interaction (core mechanic):**
- On mount, sample the SVG path into **121 points** via `getTotalLength()` / `getPointAtLength()`.
- `pointerdown` within **46 units** of the current point (index 0 at start) begins the stroke.
- On `pointermove`, look ahead up to **5 samples**; if the pointer is within **26 units** of sample `idx+k`, advance to it. This tolerates fast, sloppy swipes but cannot be completed by a stray tap.
- Progress = `idx / 120`. At 120 → `open()`.
- Recompute samples on resize. `touch-action: none` on the container; `wheel`/`touchmove` are `preventDefault`ed while the gate is up.

**Unlock sequence (`open()`):** fire the **bloom + star warp** (below) at viewport center for 2200ms, a second smaller bloom at 700ms, doors slide out (`translateX: ∓103%`, `1.6s cubic-bezier(0.87,0,0.13,1)`), gate UI fades to 0 over .7s. After **1750ms** unmount the gate, release body scroll, reset scroll to 0.

### 01 · The Opening (hero)

`min-height: 100svh` (svh matters — iOS URL bar), centered flex column, `padding: 88px 22px`, `overflow: hidden`.

- Behind it: the word **MAHAYA** — Bodoni Moda 500, `clamp(5rem, 27vw, 21rem)`, `color: #EDEAFF`, `opacity: .05`, `white-space: nowrap`, centered via `translate(-50%,-50%)`, animating `floatSlow` 14s, and parallaxed on scroll (`marginTop = scrollTop * 0.18`). *This is an easter egg: MAHAYA = Mahajan + Yashika. Keep it.*
- Eyebrow: `✦ THE LION'S GATE PORTAL · PEAK 08/08 ✦` — Space Mono `clamp(8px,2.4vw,10px)`, `.24em`, `#F0B429`, nowrap, `breathe` 5s.
- H1: **Yashika<br>Mahajan** — Bodoni Moda 600, `clamp(3.2rem, 14.5vw, 8.5rem)`, line-height .98, letter-spacing -0.02em, `#EDEAFF`.
- Divider row: 44px gold gradient rule — `IS TURNING` (Space Mono, `.42em`, `#9C97C4`) — mirrored rule. Rules `breathe` at 4s, offset .6s.
- **23** — Bodoni Moda 600, `clamp(5rem, 22vw, 11rem)`, `#F0B429`, animating `glowText` 6s (text-shadow 34px→62px gold bloom).
- Footer line: `SATURDAY · 08 AUGUST 2026 · 8:08 PM` — Space Mono `clamp(.62rem,2.8vw,.8rem)`, `.3em`, `#9C97C4`.
- Bottom-center `↓` in gold, `chev` 2.2s.
- Entrance: each block `opacity 0→1`, `translateY 28→0`, `cubic-bezier(0.16,1,0.3,1)`, staggered delays **.5s / .7s / 1.05s / 1.2s / 1.4s / 1.85s**, triggered when the gate unmounts.

### 02 · The Alignment

`padding: 74px 22px 76px`, inner `max-width: 560px`, `overflow: hidden`.

- **Star map (decorative, `aria-hidden`)**: inline SVG `viewBox="0 0 400 300"`, absolutely positioned `right:-16%; top:2%`, `width: min(122vw, 620px)`, `opacity: .78`. Contains the **Leo** constellation (data below), plus the word `LEO` in Bodoni Moda 64px at `rgba(237,234,255,.13)`. Lines use `pathLength="1"` + `stroke-dasharray: 1` and transition `stroke-dashoffset 1 → 0` over 1.6s, staggered `.25 + i*.11`s; stars fade in `.9s` staggered `i*.09`s. **The constellation name must be visible to the naked eye — not a hidden watermark.**
- Kicker `✦ THE ALIGNMENT`, then body copy (exact):
  > On 8/8 the Sun stands in Leo while **Sirius** — the brightest star in the sky — returns to the dawn horizon after seventy nights away. Astrologers call it the year's most potent portal. We call it **Yashika season**.
- Four data rows, each `display: flex; align-items: baseline; gap: 14px; padding: 20px 0`, bottom border `1px solid rgba(240,180,41,.18)`. Label: Space Mono 10px, `.2em`, `#9C97C4`, `min-width: 70px`, `flex-shrink: 0`. Value: Bodoni Moda `clamp(1.05rem,4.6vw,1.6rem)`, `#EDEAFF`, `flex: 1; min-width: 0`.

  | Label | Value |
  |---|---|
  | DATE | Saturday, 08 August 2026 |
  | TIME | 8:08 PM onwards |
  | PLACE | *(prop `venueText`, currently* `Unlocks soon · watch WhatsApp`*)* |
  | SKY | Sun in Leo · Sirius rising |

- Rows stagger in at `.12 / .24 / .36 / .48`s.
- Easter egg footer, 9px, `#9C97C4` at `opacity .2`: `OBS.LOG CAL.REF 20·10 — FILED BY TOKCHI`. **Keep verbatim** (`20·10` and `tokchi` are personal references).

### 03 · The Countdown (scratch-to-reveal)

`padding: 56px 22px 88px`, centered, inner `max-width: 560px`.

- Star map behind: **Canis Major** (Sirius' own constellation), `left:-18%; top:0`, `width: min(118vw,560px)`, `opacity: .72`, name `CANIS MAJOR` in Bodoni Moda 42px at `rgba(237,234,255,.11)`.
- Kicker `✦ THE COUNTDOWN`; H2 **"The portal peaks in…"** Bodoni Moda `clamp(1.7rem,7vw,2.6rem)`; sub *"it's buried in stardust — scratch it away"*.
- **Panel**: `max-width: 430px`, `background: rgba(23,19,57,.9)`, `border-radius: 22px`, `padding: 26px 14px 24px`, border `1px solid rgba(240,180,41,.2)` → **`rgba(240,180,41,.55)` + `box-shadow: 0 0 60px rgba(240,180,41,.18)`** once revealed (1s ease).
  - Countdown: **`display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 5px`** (must not overflow 390px). Each cell: `rgba(11,10,31,.72)`, `border-radius: 14px`, `padding: 13px 2px`, `min-width: 0`. Digits Space Mono 700 `clamp(1.45rem,7vw,2.2rem)`; labels 8px `.18em` `#9C97C4`: DAYS / HRS / MIN / SEC. Seconds cell is gold (`#F0B429`) with a brighter border (`.35`).
  - On each digit change: `translateY(.45em) opacity .2` → `translateY(0) opacity 1`, 380ms, expo-out. Only re-render changed digits.
  - Below a dashed gold rule: `08.08.26 — 8:08 PM IST` (Space Mono 11px `.3em` gold), venue in Bodoni Moda 1.2rem, and an `OPEN IN MAPS ↗` link when a maps URL is supplied.
  - **Scratch overlay**: `<canvas>` absolutely covering the panel, `border-radius: 22px`, `touch-action: none`, `cursor: crosshair`. Painted with a diagonal gradient `#191540 → #100e2c → #1c1746`, **700** random 0.4–2.4px specks (30% gold `rgba(240,180,41,…)`, rest starlight), and two centered lines: `✦  S C R A T C H   T H E   S T A R D U S T  ✦` (Space Mono 700 12px, gold .88) and *"rub away the night to reveal your coordinates"* (Manrope 11px, `rgba(156,151,196,.7)`).
  - Erase with `globalCompositeOperation = 'destination-out'`: 58px round-cap line from the last point plus a `r=29` dot. Track coverage on a **16 × 12** grid (mark the 3×3 neighbourhood of each touched cell); at **≥ 50%** coverage auto-complete: fire the bloom at the panel's center, fade the canvas out over 800ms, then unmount it.
  - Sub-button for anyone who can't scratch: `CAN'T SCRATCH? TAP TO REVEAL ✦`.
- Footer: `THE PORTAL PEAKS 08/08 — SUN IN LEO · SIRIUS RISING`.

**Countdown target:** `Date.UTC(2026, 7, 8, 14, 38, 0)` = 8 Aug 2026, **20:08 IST**. Tick every 500ms. Clamp at 0 and show `IT'S TONIGHT ✦` in the sticky bar.

### 04 · What Awaits (optional — prop `showAwaits`, currently **on**)

`padding: 56px 22px 84px`, `max-width: 760px`. Kicker `✦ WHAT AWAITS`, H2 **"On the other side"**, then a `repeat(auto-fit, minmax(230px, 1fr))` grid, `gap: 14px`. Cards: `rgba(23,19,57,.8)`, 1px `rgba(240,180,41,.18)` → `.6` on hover, `border-radius: 18px`, `padding: 24px`. Each has a Space Mono 9px `.3em` gold eyebrow, a Bodoni Moda 1.45rem title, and one Manrope 13px line. Stagger `.1 / .2 / .3 / .4`s.

| Eyebrow | Title | Line |
|---|---|---|
| 01 · FEAST | The feast | Biryani, burgers, and things on sticks. |
| 02 · POTIONS | The potions | Mocktails, spirits, and a toast at 8:08 sharp. |
| 03 · GAMES | The games | Antakshari, charades, and at least one bad decision. |
| 04 · PROOF | The proof | A photo wall, a memory jar, and evidence you were here. |

### 05 · The Summons (RSVP — the actual goal)

`padding: 56px 22px 112px`, inner `max-width: 560px`. Star map behind: **Corona Borealis** (the crown), `right:-20%`, `width: min(116vw,540px)`, `opacity: .7`, name in Bodoni Moda 34px at `rgba(237,234,255,.1)`.

Kicker `✦ THE SUMMONS`, H2 **"Say you'll step through"**, sub *"one tap — your RSVP lands on WhatsApp"*.

Form card: `rgba(23,19,57,.93)`, 1px `rgba(237,234,255,.1)`, `border-radius: 22px`, `padding: 24px 18px`.

| Field | Control | Notes |
|---|---|---|
| YOUR NAME | text input, placeholder *"who's stepping through?"* | required; **`font-size: 16px`** to stop iOS zoom |
| ARE YOU IN? | 2 option buttons: `I'M IN ✦` / `CAN'T MAKE IT` | required |
| BRINGING ANYONE? | 3 buttons: `JUST ME` / `+1` / `+2` | only when "I'm in" |
| YOUR PLATE | 2 buttons: `VEG` / `NON-VEG` | only when "I'm in"; required |
| ANYTHING WE SHOULD KNOW? (OPTIONAL) | textarea, 2 rows, placeholder *"allergies, song requests, dramatic entrances…"* | optional |

Option buttons (not native radios): `flex: 1 1 auto; min-width: 88px; min-height: 50px; padding: 13px 8px; border-radius: 14px`, Space Mono 700 11px `.18em`, transition `.3s cubic-bezier(0.16,1,0.3,1)`.
- unselected: border `rgba(237,234,255,.16)`, text `#9C97C4`, bg `rgba(11,10,31,.5)`
- selected: border + text `#F0B429`, bg `rgba(240,180,41,.09)`, `box-shadow: 0 0 0 1px #F0B429 inset, 0 0 26px rgba(240,180,41,.12)`
- `CAN'T MAKE IT` selects in `#FF3D71` with `rgba(255,61,113,.09)` fill

Submit: full-width pill, `linear-gradient(135deg,#FF3D71,#e02458)`, `padding: 18px`, Space Mono 700 13px `.3em`, label **`ENTER THE PORTAL`**, `box-shadow: 0 8px 34px rgba(255,61,113,.35)`; hover lifts `translateY(-2px)`. Below it, 11.5px `#9C97C4`: *"opens WhatsApp with your reply pre-written — just press send"*.

Inline validation (`aria-live="polite"`, `#FF3D71`, 12.5px) — exact strings:
- `Add your name so we know who's stepping through.`
- `Tell us — are you in?`
- `Veg or non-veg — the biryani needs a count.`

**Submit behaviour (no backend by design):** build the message, `window.open('https://wa.me/' + digitsOnly(number) + '?text=' + encodeURIComponent(body), '_blank')`, fire the bloom, and swap the card for the success panel. Host number: **919837266622**. Message body:

```
✦ RSVP · YASHIKA'S 23RD · THE LION'S PORTAL ✦
Name: <name>
Status: I'M IN ✦            | CAN'T MAKE IT
Bringing: just me | +1 | +2   (only when in)
Plate: VEG | NON-VEG          (only when in)
Note: <note>                  (only if filled)
```

Success panel: gold-ringed card (`rgba(240,180,41,.45)` border, `0 0 60px rgba(240,180,41,.14)`), an SVG ring + checkmark that **draw themselves** (`pathLength="1"`, `stroke-dasharray: 1`, `ringDraw` 1s then .6s at .7s delay), then **"You're on the list."** (Bodoni Moda 1.7rem), `SEE YOU ON THE OTHER SIDE ✦` (Space Mono 10px `.28em` gold, breathing), a fallback WhatsApp link, and an `EDIT RESPONSE` text button.

### 06 · The Seal

`padding: 70px 22px 150px`, centered. `M A H A Y A` in Bodoni Moda 13px `.5em` at `opacity .16` (breathing 7s); a 2px × 120px vertical gold gradient seam that **animates from `scaleY(1)` to `scaleY(.04)`** over `2.4s cubic-bezier(0.87,0,0.13,1)` ~2.4s after the section enters view (the portal shutting); `08 · 08 · 26`; **"See you on the other side."**; contact line *"questions, coordinates, conspiracies —"* + `WhatsApp +91 98372 66622`; and the final easter egg at `opacity .18`: `EST. 20·10  ·  ✦ TOKCHI WAS HERE`.

### Persistent chrome

- **Sky canvas** — `position: fixed; inset: 0; z-index: 0; pointer-events: none`. Full detail below.
- **Scroll rail** — 2px column on the left edge, track `rgba(237,234,255,.06)`, fill `linear-gradient(180deg,#F0B429,#B87914)`, `transform: scaleY(progress)`, `transform-origin: top`.
- **Sound toggle** — fixed `top: 14px; right: 14px`, `z-index: 95`, pill, `rgba(23,19,57,.72)` + `backdrop-filter: blur(10px)`, border `rgba(240,180,41,.28)`, gold Space Mono 9px `.24em`, `min-height: 44px`, **`white-space: nowrap`** (it wraps and breaks the pill without it). Label `✧ SOUND OFF` / `✧ SOUND ON`. **Muted by default.**
- **Sticky bar** — fixed `left/right: 12px; bottom: 12px`, `max-width: 560px`, pill, `rgba(23,19,57,.82)` + `blur(14px)`, border `rgba(240,180,41,.25)`. Left: live countdown, Space Mono 10.5px, nowrap + ellipsis. Right: `RSVP` pill in the flare gradient, `min-height: 46px`, `flex-shrink: 0`, smooth-scrolls to the form. Slides in (`translateY 130% → 0`, `.6s` expo-out) once past the Alignment section, and hides while the RSVP form is on screen or after submitting.

---

## The living sky (single `<canvas>`, the signature system)

One fixed full-viewport canvas, `devicePixelRatio` capped at **2**, resized on `resize`. Everything below is drawn per frame in one `requestAnimationFrame` loop. A **64×64 radial-gradient sprite** is pre-rendered once and `drawImage`d for every star — do not create a gradient per star per frame.

Sprite stops: `rgba(255,255,255,1)` → `.14 rgba(255,250,235,.85)` → `.4 rgba(255,225,170,.22)` → `1 rgba(255,220,160,0)`.

Per frame, in order:
1. **Ground**: `linear-gradient(0,0 → w*.6,h)`: `#0B0A1F → #120e33 → #0B0A1F`.
2. **Nebula wash**: three radial gradients drifting on slow sines — `rgba(201,113,57,.11)` at (.22,.26), `rgba(255,61,113,.07)` at (.8,.74), `rgba(240,180,41,.06)` at (.62,.12); radius `max(w,h)*.55`; each offset by `sin(t*.06+i)*w*.05` and parallaxed `-scrollY*.02`.
3. **Star field** — **120 stars under 560px wide, 210 above**. Each: `x,y` normalized, `r` 0.4–2.1, depth `z` 0.25–1.0, twinkle `sin(t*sp+ph)` with `sp` 0.4–2.1. Scroll parallax: `y - scrollY*.12*z`, wrapped over `h+80`. Draw size `r*7*(1+twinkle*.3)` at `globalAlpha = twinkle*z + .08`.
4. **Leo, lit and named** — line color `rgba(240,180,41,.28)` (`.2` on mobile). Star draw size `magnitude * 9` (`* 15` for Regulus, which also pulses `1 + .08*sin(t*1.4)` and is drawn at alpha .95 while others breathe .55–.85). Labels in Space Mono 9px (8px mobile): **REGULUS** bold gold `.85`, plus DENEBOLA and ALGIEBA at `.5` on desktop only. Watermark `LEO` in Bodoni Moda at `min(w,h)*.17` (`.13` mobile) at `rgba(237,234,255,.06)`, with `C O N S T E L L A T I O N   ·   S U N   I N   L E O` under it in gold `.34`.
   - Placement: desktop `x = w*.06`, `y = h*.1`, width `min(w,h)*.5`; mobile `x = w*.04`, `y = h*.16`, width `w*.92`. Height = width × .74. Parallax `-scrollY*.05`.
5. **Sirius** — 44px sprite at alpha `.78 + .22*sin(t*1.9)`, four crossing rays (`26 + 8*flare` long) at `rgba(237,234,255,.4*flare)`, labels `SIRIUS` (bold 9px, `rgba(237,234,255,.6)`) and `α CMa · RISING` (8px, `rgba(156,151,196,.45)`). Position: desktop `(w*.86, h*.16)`, **mobile `(w*.68, h*.155)`** — it must stay clear of the fixed sound pill in the top-right.
6. **Meteor shower** — spawn every `(0.5 + rand*0.9) / meteorRate` seconds (`meteorRate` prop, currently **2**), max 9 alive. 20% are "big": slower (`sp` 330 vs 520–860), longer (190 vs 80–170), longer-lived (1.7s vs 0.8–1.3s), thicker (2.4 vs 1.1–1.8). Head travels `cos/sin(a) * ease * sp * life` with `ease = 1-(1-p)^1.7`, angle `a = .5 + rand*.45` rad. Trail is a gradient from `rgba(255,253,245,fade)` → `.3 rgba(255,230,185,fade*.45)` → transparent, where `fade = sin(p*π)`; plus a sprite head.
7. **Bloom + star warp (the one reveal effect)** — `bloom(x, y, duration)` at normalized coords. For `p = elapsed/duration`: `warp = p < .5 ? p*2 : (1-p)*2`. While warping, every star is pushed radially (`k = 1 + warp*1.6*z`) and drawn as a **streak** of length `warp*90*z` toward the center, stroke `rgba(240,225,200,twinkle*.85)`. Simultaneously three expanding rings at offsets 0/.16/.34 (`rgba(240,180,41,.45*(1-rp))`, radius `rp*hypot(w,h)*.8`) and a radial flood `rgba(255,238,190,.8*gl) → rgba(240,180,41,.32*gl) → transparent` with `gl = 1 - p*1.25`.
   Fired on: gate unlock (2200ms + a 1500ms follow-up), scratch reveal (1900ms at the panel), RSVP submit (1800ms). **There is no confetti anywhere — deliberately rejected.**

## Ambient sound (opt-in, muted by default)

Web Audio only, no files. Four sine oscillators at **98 / 146.83 / 196 / 293.66 Hz** with gains `.22 / .16 / .12 / .06` into a master gain through a **720 Hz lowpass**, plus a **0.06 Hz LFO** (gain .025) modulating the master for slow swell. Every 4.2s a random "spark" sine from `[1046.5, 1318.5, 1568, 2093]` Hz rises to .02 and decays exponentially over 1.5s. Toggling on ramps master to **.07** over 1.8s; off ramps to .0001 over .5s. Create the context only on first user gesture.

---

## Interactions & Behavior

- **Scroll reveals**: a single scroll handler (`rAF`-throttled, `capture: true` on `document` so it works whether `body` or a container scrolls) flips a per-section `revealed` flag when `getBoundingClientRect().top < innerHeight * .88`. One-way — sections never re-hide. Reveal = `opacity 0→1` + `translateY 28→0`, `.9s cubic-bezier(0.16,1,0.3,1)`, children staggered .1–.12s.
- **Do not use `IntersectionObserver` alone here** — in an embedded/scroll-container context it silently never fires. The rect check is the reliable path.
- The countdown tick also calls the scroll check, which guarantees reveals resolve even if no scroll event lands.
- Everything animates **`transform` and `opacity` only**.
- Motion curves: standard **`cubic-bezier(0.16,1,0.3,1)`** (expo-out, luxurious settle); portal/mechanical **`cubic-bezier(0.87,0,0.13,1)`**. Reveal durations .8–1.2s.
- `prefers-reduced-motion: reduce` → all `@keyframes` are disabled, the gate opens instantly via the escape-hatch path, blooms are skipped, smooth-scroll becomes `auto`. **All content stays reachable.**
- `try/catch` every `setPointerCapture` — it throws `NotFoundError` for stale/synthetic pointer ids and would abort the handler.

## State Management

Local component state only; no server, no persistence.

| State | Purpose |
|---|---|
| `phase` | `locked` → `opening` → `open` |
| `showGate` | mounts the lock screen; also gates body scroll |
| `showFallback` | reveals `TRACE IT FOR ME` after 9s |
| trace `idx` | 0–120 progress along the lemniscate (ref, not state — 60fps) |
| `rvAlign / rvCount / rvAwaits / rvRsvp / rvSeal` | one-way section reveals |
| `sealClosed` | fires the closing seam 2.4s after the seal appears |
| `scratchGone`, `panelHot` | scratch overlay removed / panel lit |
| `att`, `guests`, `food`, `errMsg`, `submitted` | RSVP |
| `past`, `rsvpVis` | sticky-bar visibility |
| `soundOn` | ambient audio |

Configurable props (currently surfaced as design-tool tweaks): `venueText` (`"Unlocks soon · watch WhatsApp"` — **venue is not decided yet; keep it visibly provisional**), `venueMapUrl` (`""`), `whatsappNumber` (`"919837266622"`), `showAwaits` (`true`), `meteorRate` (`2`).

## Design Tokens

```css
--void:       #0B0A1F;  /* page base — deep cosmic indigo, NOT black */
--deep:       #171339;  /* raised surfaces (mostly used at .8–.93 alpha) */
--sirius:     #EDEAFF;  /* primary text on dark */
--sirius-dim: #9C97C4;  /* secondary text, labels */
--gold:       #F0B429;  /* portal light — accent, rules, the 8, Regulus */
--gold-deep:  #B87914;  /* gradient shadow end */
--flare:      #FF3D71;  /* RSVP only — scarcity makes it read as "press me" */
--flare-deep: #e02458;
```

Rules: `--gold` is *light coming through the portal* — never a large fill. `--flare` is reserved for the RSVP button and the "can't make it" state. Gradients only gold→gold-deep or void→deep.

**Type** (Google Fonts): **Bodoni Moda** 400–900 (display — names, headings, values), **Manrope** 400/600/700 (prose, form), **Space Mono** 400/700 (all labels, data, countdown, uppercase, letter-spacing .18–.5em). The didone + mono tension is the personality: *astronomical instrument readout meets ceremonial engraving.* Do not substitute a generic sans for the display face.

**Radii**: 999px pills · 22px panels · 18px cards · 14px option buttons & countdown cells · 16px sound pill.

**Spacing**: page gutter **22px**, inner column **560px** (760px for the card grid), section padding 56–74px top / 76–150px bottom, form gaps 24px, button gaps 10px.

**Shadows / glows**: `0 0 60px rgba(240,180,41,.18)` (lit panel) · `0 8px 34px rgba(255,61,113,.35)` → `0 12px 44px rgba(255,61,113,.5)` (RSVP hover) · `0 6px 22px rgba(255,61,113,.4)` (sticky RSVP) · `drop-shadow(0 0 12px rgba(240,180,41,.9))` (traced gold) · `text-shadow: 0 0 34px→62px rgba(240,180,41,…)` (the breathing 23).

**Constellation data** — normalized 0–1 coordinates, `m` = relative magnitude (draw weight), edges are index pairs:

```js
const LEO = [
  {x:.13,y:.60,m:2.1,n:'DENEBOLA'}, {x:.30,y:.70,m:1.4,n:'CHERTAN'},
  {x:.27,y:.46,m:1.7,n:'ZOSMA'},    {x:.56,y:.40,m:1.9,n:'ALGIEBA'},
  {x:.62,y:.78,m:2.8,n:'REGULUS'},  {x:.60,y:.58,m:1.3,n:'ETA LEONIS'},
  {x:.49,y:.28,m:1.4,n:'ZETA'},     {x:.40,y:.19,m:1.5,n:'RASALAS'},
  {x:.30,y:.25,m:1.6,n:'ALGENUBI'}
];
const LEO_EDGES = [[8,7],[7,6],[6,3],[3,5],[5,4],[3,2],[2,0],[0,1],[1,4],[2,1]];

const CMA = [  // Canis Major — Sirius' constellation
  {x:.34,y:.22,m:3.2,n:'SIRIUS'}, {x:.20,y:.32,m:1.6,n:'MIRZAM'},
  {x:.42,y:.40,m:1.2,n:''},       {x:.54,y:.66,m:1.8,n:'WEZEN'},
  {x:.36,y:.76,m:1.7,n:'ADHARA'}, {x:.70,y:.70,m:1.4,n:'ALUDRA'},
  {x:.24,y:.90,m:1.3,n:'FURUD'}
];
const CMA_EDGES = [[0,1],[0,2],[2,3],[3,4],[3,5],[4,6],[2,4]];

const CB = [   // Corona Borealis — the crown
  {x:.12,y:.58,m:1.2,n:''}, {x:.23,y:.40,m:1.4,n:''},
  {x:.36,y:.30,m:1.5,n:''}, {x:.50,y:.27,m:2.4,n:'ALPHECCA'},
  {x:.64,y:.32,m:1.5,n:''}, {x:.76,y:.43,m:1.3,n:''},
  {x:.86,y:.60,m:1.2,n:''}
];
const CB_EDGES = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]];
```

In the SVG maps, star radius = `1.6 + m*1.1`, halo circle = `r*3.2` at ~12% accent, label sits at `y - r - 9`, and stars with `m > 2` get `#FFE9B0` fill + `drop-shadow(0 0 12px rgba(240,180,41,.95))` while the rest get `#EDEAFF` + a 6px glow.

## Assets

**None.** No images, no video, no icon font, no 3D — deliberately, for Indian mobile data budgets. Every visual is CSS, inline SVG, or canvas. The only external requests are the three Google Fonts. Add an Open Graph image if you want the WhatsApp link preview to look intentional (the OG title/description are already set).

## Non-negotiables (from the brief and the client)

1. **Mobile-first, 390px design width.** ~95% of guests open this from a WhatsApp link on a phone. Verify at 390×844 before anything else; no horizontal overflow at 360px.
2. **The RSVP must actually deliver.** WhatsApp deep link was chosen precisely because it has no backend to fail silently. Test one real submission end-to-end before the link goes out.
3. **Tap targets ≥ 44px**; all inputs `font-size: 16px` (iOS zoom).
4. `prefers-reduced-motion` fully honoured.
5. **Keep the easter eggs verbatim**: `MAHAYA` (hero + seal), `20·10`, `tokchi`. They are personal and are the reason this feels made-for-her.
6. **No confetti / party poppers, no autoplaying music, no balloon emoji, no script fonts, no WebGL.** The bloom + star warp is the only celebration effect.
7. Venue is **undecided** — it must render as a visibly provisional line, never as invented placeholder text that could ship by accident.

## Files

| File | What it is |
|---|---|
| `design/Lions Portal Invite.dc.html` | **The design.** Open in a browser to experience it; read the logic class for exact numbers. |
| `design/support.js` | The design tool's streaming-template runtime. Reference only — **do not port it**. |
| `design/Portal Options Board.dc.html` | The exploration board: three rejected opening rituals (constellation trace, 8·8·8 dial lock, three-ring alignment), three background treatments, three reveal effects, two page-motion directions — all live and playable. Useful context for *why* the chosen four won, and a source of ready-made alternates if a decision is revisited. |
| `brief/Lions-Portal-Invite-Design-Brief.md` | The original brief. Note: it specifies React + Tailwind + `motion` + Lenis and a scroll-driven 7-scene structure; the delivered design keeps the concept, palette, type, and motion physics, but replaces the scroll-portal opening with the traced-lemniscate gate, drops the drinks question, and uses one canvas sky instead of DOM star fields. **Where the two disagree, this README is current.** |
