# `<qp-breakout>` — Breakout Game

A classic breakout/brick-breaker game as a Web Component, rendered on layered
HTML5 Canvases. A ball bounces off a player-controlled paddle, destroying bricks
on contact. The game features multiple levels with predefined and randomly
generated layouts, multi-hit bricks (silver 2 hits, gold 3 hits), an extra-life
bonus, and a parallax star/logo background. Game elements (ball, paddle, bricks)
can be rendered as sprite images or drawn programmatically.

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
  using the `scale` factor.

**`scale`** (number, default: `0.75`)

- Scale factor (0–1) relative to the container width.

**`lang`** (string, default: `"de"`)

- Language code for translations (`"de"` or `"en"`).

**`use-images`** (string, default: `true`)

- Render game elements as sprite images. Set to `"false"` to use programmatic
  canvas drawing.

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

1. Player starts the game via the **Start** button or the **Space** key.
   The ball rests on the centered paddle ("waiting" state).
2. The player can move the paddle with **Arrow keys** — the ball follows.
   Pressing **Space** launches the ball upward ("running" state).
3. Bricks are destroyed on collision, awarding points based on type. Multi-hit
   bricks (silver, gold) require multiple hits and show reduced opacity as
   visual feedback.
4. Losing the ball costs a life. The paddle re-centers and the ball is placed
   on top again ("waiting"), ready for the next launch. Losing all lives
   triggers game-over.
5. Clearing all bricks advances to the next level. Between levels the game
   pauses until the player presses Space or the Pause button.
6. An extra life is awarded every `EXTRA_LIVE` (1,000) points.

## UI Sections

- **Scoreboard** — state indicator, remaining bricks, score, level, lives
- **Canvas** — 4 stacked HTML5 Canvases (background stars, logo watermark, bricks, game)
- **Button bar** — Start, Pause, Stop
  - **Start** — starts a new game
  - **Pause** — pauses/resumes the running game; advances to next level between levels
  - **Stop** — stops the current game

## Lifecycle

**`connectedCallback`**

- Loads images (logo + game sprites when `use-images` is enabled), then renders the component.

**`disconnectedCallback`**

- Stops the game loop, removes event listeners, and destroys all canvases.

**`attributeChangedCallback`**

- Re-renders when `width`, `scale`, `lang`, or `use-images` changes.

## Translations

All visible text is resolved via `_dict()` (Dictionary module) with a built-in
`_defaultDict()` fallback (de/en).

## File Structure

```text
qp-breakout/
  qp-breakout.wc.js            — Web Component (main)
  qp-breakout.styles.js        — Scoped styles (loaded via getStyles())
  qp-breakout.dictionary.js    — i18n translations
  qp-breakout.canvas.js        — Canvas wrapper (DPR scaling, resize observer)
  qp-breakout.paddle.js        — Paddle entity
  qp-breakout.ball.js          — Ball entity
  qp-bereakout.brick.js        — Brick entity
  qp-breakout.levels.js        — Level definitions and brick type config
  qp-breakout.stars.js         — Parallax star field generator
  images/
    qp-logo-horns-flash.svg    — Logo watermark
    breakout/
      ball.png                 — Ball sprite
      paddle.png               — Paddle sprite
      brick-*.png              — Brick sprites (10 color variants)
```
