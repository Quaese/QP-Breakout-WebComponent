# `<qp-breakout>` — Breakout Game

A classic breakout/brick-breaker game as a Web Component. A ball bounces off a
paddle controlled by the player, destroying bricks on contact. The game ends
when all lives are lost or all bricks are destroyed.

## Usage

```html
<qp-breakout></qp-breakout>

<!-- Custom size and language -->
<qp-breakout width="600" height="400" cols="10" rows="5" lang="en"></qp-breakout>
```

```html
<script type="module" src="/js/components-web/qp-breakout/qp-breakout.wc.js"></script>
```

## Attributes

**`width`** (number, default: `480`)

- Canvas width in pixels.

**`height`** (number, default: `320`)

- Canvas height in pixels.

**`cols`** (number, default: `8`)

- Number of brick columns.

**`rows`** (number, default: `4`)

- Number of brick rows.

**`lives`** (number, default: `3`)

- Number of lives the player starts with.

**`lang`** (string, default: `"de"`)

- Language code for translations (`"de"` or `"en"`).

## Constants

**`COLS`** — `8`

- Default number of brick columns.

**`ROWS`** — `4`

- Default number of brick rows.

**`LIVES`** — `3`

- Default number of lives.

**`INTERVAL_SPEED`** — `16`

- Game loop interval in ms (~60fps).

**`BALL_SPEED`** — `3`

- Initial ball speed in pixels per tick.

**`PADDLE_SPEED`** — `6`

- Paddle movement speed in pixels per tick.

## Events

All events are `CustomEvent` with `bubbles: true` and `composed: true` (cross Shadow DOM).

**`qp-breakout.game-started`**

- Fired when a new game starts.
- `detail: {}`

**`qp-breakout.game-stopped`**

- Fired when the game is stopped by the player.
- `detail: {}`

**`qp-breakout.game-paused`**

- Fired when the game is paused.
- `detail: {}`

**`qp-breakout.game-resumed`**

- Fired when the game is resumed after pause.
- `detail: {}`

**`qp-breakout.game-lost`**

- Fired when all lives are lost.
- `detail: { score, level }`
  - `score` — final score
  - `level` — current level at time of loss

**`qp-breakout.game-won`**

- Fired when all bricks are destroyed.
- `detail: { score, level }`
  - `score` — final score
  - `level` — current level at time of win

**`qp-breakout.game-level-up`**

- Fired when the level increases.
- `detail: { level, speed }`
  - `level` — new level
  - `speed` — new ball speed

**`qp-breakout.game-life-lost`**

- Fired when the ball is missed by the paddle.
- `detail: { lives }`
  - `lives` — remaining lives

```js
document.querySelector('qp-breakout').addEventListener('qp-breakout.game-lost', (e) => {
  console.log(`Lost at level ${e.detail.level} with score ${e.detail.score}`);
});
```

## Game Flow

1. The player starts the game via the **Start** button or the **Space** key.
2. The ball moves each tick, bouncing off walls, paddle, and bricks.
3. Destroying a brick increases the score.
4. Missing the ball with the paddle costs one life.
5. **Space** pauses/resumes, **Escape** stops, **Arrow keys** move the paddle.
6. The game is lost when all lives are spent, and won when all bricks are
   destroyed.

## UI Sections

- **Scoreboard** — state indicator, brick layout (cols x rows), score, speed/level
- **Canvas** — HTML5 Canvas for rendering ball, paddle, and bricks
- **Button bar** — Start, Pause, Stop
  - **Start** — starts a new game
  - **Pause** — pauses/resumes the running game
  - **Stop** — stops the current game

## Lifecycle

**`connectedCallback`**

- Renders the component (canvas, scoreboard, buttons).

**`disconnectedCallback`**

- Clears timers and removes all event listeners.

**`attributeChangedCallback`**

- Re-renders when `width`, `height`, `cols`, `rows`, `lives`, or `lang` change.

## Translations

All visible text is resolved via `_dict()` (Dictionary module) with a built-in
`_defaultDict()` fallback (de/en).

## File Structure

```text
qp-breakout/
  qp-breakout.wc.js            — Web Component (main)
  qp-breakout.styles.js         — Scoped styles (loaded via getStyles())
  qp-breakout.dictionary.js     — i18n translations
```
