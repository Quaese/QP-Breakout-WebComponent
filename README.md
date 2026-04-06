# `<qp-breakout>` — Breakout Game

A classic breakout/brick-breaker game as a Web Component, rendered on layered
HTML5 Canvases. A ball bounces off a player-controlled paddle, destroying bricks
on contact. The game features multiple levels with predefined and randomly
generated layouts, multi-hit bricks (silver 2 hits, gold 3 hits), an extra-life
bonus, and a parallax star/logo background. Game elements (ball, paddle, bricks)
can be rendered as sprite images or drawn programmatically.

**[Live Demo](https://quaese.github.io/QP-Breakout-WebComponent/)**

## Table of Contents

- [Usage](#usage)
- [Attributes](#attributes)
- [Game States](#game-states)
- [Screens](#screens)
- [Events](#events)
- [Game Flow](#game-flow)
- [Level System](#level-system)
- [UI Sections](#ui-sections)
- [Lifecycle](#lifecycle)
- [Translations](#translations)
- [File Structure](#file-structure)

## Usage

```html
<!-- Default: sprite images, German UI -->
<qp-breakout></qp-breakout>

<!-- Fixed width, English UI, programmatic drawing -->
<qp-breakout width="600" lang="en" use-images="false"></qp-breakout>
```

```html
<script type="module" src="/js/components-web/qp-breakout/qp-breakout.wc.js"></script>
```

## Attributes

**`width`** (number, optional)

- Canvas width in pixels. When omitted the component scales to its container
  using the `scale` factor. Canvas height is limited to 90% of the viewport height.

**`scale`** (number, default: `0.75`)

- Scale factor (0–1) relative to the container width.

**`lang`** (string, default: `"de"`)

- Language code for translations (`"de"` or `"en"`).

**`use-images`** (string, default: `true`)

- Render game elements as sprite images. Set to `"false"` to use programmatic
  canvas drawing.

## Game States

| State | Description |
| --- | --- |
| `init` | Initial state after component load, shows title screen |
| `waiting` | Ball rests on paddle, player can position before launch |
| `running` | Ball is in play, game loop active |
| `paused` | Game loop stopped, resumable via Space |
| `complete` | All bricks destroyed, shows level-complete screen |
| `stopped` | Game over, shows game-over screen with final score |

## Screens

Overlay layers toggled automatically by `_setState()`:

- **Init screen** — title "QP Breakout" with semi-transparent logo background
- **Start screen** — instructions before ball launch (Arrow keys, Space)
- **Pause screen** — shown during pause
- **Complete screen** — level complete with score, level, and remaining lives
- **Game-over screen** — final score and level reached

## Events

All events are `CustomEvent` with `bubbles: true` and `composed: true` (cross Shadow DOM).
Every event carries `detail: { lives, score, level }` unless noted otherwise.

**`qp-breakout.game-started`**

- Fired when a new game starts.
- `detail: { lives, score, level }`

**`qp-breakout.game-paused`**

- Fired when the game is paused.
- `detail: { lives, score, level }`

**`qp-breakout.game-resumed`**

- Fired when the game is resumed after pause.
- `detail: { lives, score, level }`

**`qp-breakout.game-level-up`**

- Fired when the player advances to the next level.
- `detail: { lives, score, level }`

**`qp-breakout.level-complete`**

- Fired when all bricks on the current level are destroyed.
- `detail: { lives, score, level }`

**`qp-breakout.game-extra-life`**

- Fired when an extra life is awarded (every 1,000 points).
- `detail: { lives, score, level }`

**`qp-breakout.game-life-lost`**

- Fired when the ball falls below the paddle.
- `detail: { lives }`
  - `lives` — remaining lives

**`qp-breakout.game-over`**

- Fired when all lives are lost or the player stops the game.
- `detail: { lives, score, level }`

```js
document.querySelector('qp-breakout').addEventListener('qp-breakout.game-over', (e) => {
  console.log(`Game over at level ${e.detail.level} with score ${e.detail.score}`);
});
```

## Game Flow

1. Component loads in **init** state showing the title screen.
   Player presses **Start** or **Space** to begin.
2. The ball rests on the centered paddle (**waiting**). The player can move
   the paddle with **Arrow keys** — the ball follows. Pressing **Space**
   launches the ball upward (**running**).
3. Bricks are destroyed on collision, awarding points based on type. Multi-hit
   bricks (silver, gold) require multiple hits and show reduced opacity as
   visual feedback.
4. Losing the ball costs a life. The paddle re-centers and the ball is placed
   on top again (**waiting**), ready for the next launch. Losing all lives
   triggers game-over (**stopped**).
5. Clearing all bricks shows the level-complete screen (**complete**).
   Pressing **Space** advances to the next level.
6. An extra life is awarded every `EXTRA_LIVE` (1,000) points.

## Level System

Levels are defined in `qp-breakout.levels.js` using two data structures:

### Brick Types (`BRICK_TYPES`)

Maps numeric IDs to brick properties. Used in layout grids.

| ID | Color | Score | Hits | Description |
| --- | --- | --- | --- | --- |
| 0 | — | — | — | Empty cell |
| 1 | Yellow | 10 | 1 | Easiest |
| 2 | Orange | 15 | 1 | |
| 3 | Red | 20 | 1 | |
| 4 | Green | 25 | 1 | |
| 5 | Blue | 30 | 1 | |
| 6 | Purple | 50 | 1 | Hardest single-hit |
| 7 | Silver | 40 | 2 | Multi-hit |
| 8 | Gold | 75 | 3 | Multi-hit |

### Level Definitions (`LEVELS`)

Each level has a `name` and either a `layout` or `random` config:

**Predefined layout** — 2D array where each number references a `BRICK_TYPE`:

```javascript
{
  name: "Diamond",
  score: 200,
  layout: [
    [0, 0, 0, 6, 6, 0, 0, 0],
    [0, 0, 5, 5, 5, 5, 0, 0],
    [0, 4, 4, 4, 4, 4, 4, 0],
    [3, 3, 3, 3, 3, 3, 3, 3],
  ],
}
```

**Random layout** — procedurally generated based on parameters:

```javascript
{
  name: "Random",
  score: 500,
  random: { rows: 5, cols: 8, fillRatio: 0.6, maxType: 6 },
}
```

### Level Progression

1. Predefined levels (1–N) are played in order.
2. Beyond the last predefined level, infinite random levels are generated
   with increasing difficulty (more rows, higher fill ratio, multi-hit bricks).

## UI Sections

- **Scoreboard** — state indicator, remaining bricks, score, level, lives
- **Canvas** — 4 stacked HTML5 Canvases (background stars, logo watermark, bricks, game).
  All canvases share a single static `ResizeObserver` (Canvas class), enforce
  a minimum width of 480px, and limit their height to 90% of the viewport height.
- **Screens** — overlay layers for init, waiting, paused, complete, and game-over states
- **Button bar** — Start, Pause, Stop
  - **Start** — starts a new game
  - **Pause** — pauses/resumes the running game; advances to next level on complete
  - **Stop** — stops the current game

## Lifecycle

**`connectedCallback`**

- Loads images (logo + game sprites when `use-images` is enabled), then renders the component.

**`disconnectedCallback`**

- Stops the game loop, removes event listeners, and destroys all canvases.

**`attributeChangedCallback`**

- Re-renders when `width`, `scale`, `lang`, or `use-images` changes.

## Translations

All visible text (screens, scoreboard, buttons) is resolved via `_dict()`
(Dictionary module) with a built-in `_defaultDict()` fallback (de/en).

## File Structure

```text
qp-breakout/
  qp-breakout.wc.js            — Web Component (main)
  qp-breakout.styles.js        — Scoped styles (loaded via getStyles())
  qp-breakout.dictionary.js    — i18n translations
  qp-breakout.canvas.js        — Canvas wrapper (DPR scaling, shared static ResizeObserver)
  qp-breakout.paddle.js        — Paddle entity
  qp-breakout.ball.js          — Ball entity (attachTo/launch for waiting state)
  qp-bereakout.brick.js        — Brick entity
  qp-breakout.levels.js        — Level definitions and brick type config
  qp-breakout.screen.js        — Screen + ScreenController for overlay management
  qp-breakout.stars.js         — Parallax star field generator
  images/
    qp-logo-horns-flash.svg    — Logo watermark (also used on init screen)
    breakout/
      ball.png                 — Ball sprite
      paddle.png               — Paddle sprite
      brick-*.png              — Brick sprites (10 color variants)
```
