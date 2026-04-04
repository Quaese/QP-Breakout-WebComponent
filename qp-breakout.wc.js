/**
 * <qp-breakout> — Breakout Game Web Component
 *
 * A classic breakout/brick-breaker game rendered on layered HTML5 Canvases.
 * A ball bounces off a player-controlled paddle, destroying bricks on contact.
 * The game features multiple levels with predefined and randomly generated
 * layouts, multi-hit bricks (silver 2 hits, gold 3 hits), an extra-life
 * bonus, and a parallax star/logo background. Game elements (ball, paddle,
 * bricks) can be rendered as sprite images or drawn programmatically.
 *
 * @element qp-breakout
 *
 * @attr {number} width      - Canvas width in pixels. When omitted the component
 *                              scales to its container using the scale factor.
 * @attr {number} scale      - Scale factor (0–1) relative to the container width.
 *                              Default: 0.75
 * @attr {string} lang       - Language code for translations ("de" or "en").
 *                              Default: "de"
 * @attr {string} use-images - Render game elements as sprite images. Set to
 *                              "false" to use programmatic canvas drawing.
 *                              Default: true (images enabled)
 *
 * @example
 *   <!-- Default: sprite images, German UI -->
 *   <qp-breakout></qp-breakout>
 *
 *   <!-- Fixed width, English UI, programmatic drawing -->
 *   <qp-breakout width="600" lang="en" use-images="false"></qp-breakout>
 *
 * @description
 *   Lifecycle:
 *     connectedCallback  — Loads images (logo + game sprites when use-images
 *                          is enabled), then renders the component.
 *     disconnectedCallback — Stops the game loop, removes event listeners,
 *                            and destroys all canvases.
 *     attributeChangedCallback — Re-renders when width, scale, lang, or
 *                                use-images changes.
 *
 *   Game states:
 *     - "init"     — initial state after component load, shows title screen
 *     - "waiting"  — ball rests on paddle, player can position before launch
 *     - "running"  — ball is in play, game loop active
 *     - "paused"   — game loop stopped, resumable via Space
 *     - "complete" — all bricks destroyed, shows level-complete screen
 *     - "stopped"  — game over, shows game-over screen with final score
 *
 *   Game flow:
 *     1. Component loads in "init" state showing the title screen.
 *        Player presses Start or Space to begin.
 *     2. The ball rests on the centered paddle ("waiting"). The player
 *        can move the paddle with Arrow keys — the ball follows.
 *        Pressing Space launches the ball upward ("running").
 *     3. Bricks are destroyed on collision, awarding points based on type.
 *        Multi-hit bricks (silver, gold) require multiple hits and show
 *        reduced opacity as visual feedback.
 *     4. Losing the ball costs a life. The paddle re-centers and the ball
 *        is placed on top again ("waiting"), ready for the next launch.
 *        Losing all lives triggers game-over ("stopped").
 *     5. Clearing all bricks shows the level-complete screen ("complete").
 *        Pressing Space advances to the next level.
 *     6. An extra life is awarded every EXTRA_LIVE (1000) points.
 *
 *   Screens (overlay layers, toggled by _setState):
 *     - Init screen     — title "QP Breakout" with logo background
 *     - Start screen    — instructions before ball launch
 *     - Pause screen    — shown during pause
 *     - Complete screen — level complete with score and lives
 *     - Game-over screen — final score and level
 *
 *   Canvas architecture (4 stacked layers):
 *     - Background canvas — animated parallax star field
 *     - Logo canvas       — semi-transparent logo watermark with parallax
 *     - Bricks canvas     — static brick grid (redrawn only on collision)
 *     - Game canvas       — ball and paddle (redrawn every frame)
 *     All canvases share a single static ResizeObserver (Canvas class) and
 *     limit their height to 90% of the viewport height.
 *
 *   Controls:
 *     - Arrow Left / Right — move paddle (also in "waiting" state)
 *     - Space              — launch ball / pause / resume / next level
 *     - Escape             — stop game
 *
 *   Events (CustomEvent, bubbles, composed):
 *     All events carry detail: { lives, score, level } unless noted otherwise.
 *     - "qp-breakout.game-started"    — fired when a new game starts.
 *     - "qp-breakout.game-paused"     — fired when the game is paused.
 *     - "qp-breakout.game-resumed"    — fired when the game is resumed.
 *     - "qp-breakout.game-level-up"   — fired when the player advances a level.
 *     - "qp-breakout.level-complete"  — fired when all bricks are destroyed.
 *     - "qp-breakout.game-extra-life" — fired when an extra life is awarded.
 *     - "qp-breakout.game-life-lost"  — fired when the ball falls below the
 *                                        paddle. detail: { lives }
 *     - "qp-breakout.game-over"       — fired when all lives are lost or the
 *                                        player stops the game.
 *
 *   Styles:
 *     Loaded from the external module qp-breakout.styles.js via getStyles().
 *
 * @dependencies
 *   - ./qp-breakout.dictionary.js  — i18n translations
 *   - ./qp-breakout.styles.js      — scoped styles
 *   - ./qp-breakout.canvas.js      — Canvas wrapper (DPR scaling, resize observer)
 *   - ./qp-breakout.paddle.js      — Paddle entity
 *   - ./qp-breakout.ball.js        — Ball entity
 *   - ./qp-bereakout.brick.js      — Brick entity
 *   - ./qp-breakout.levels.js      — Level definitions and brick type config
 *   - ./qp-breakout.stars.js       — Parallax star field generator
 *   - ./images/breakout/            — Sprite images (ball, paddle, bricks)
 */

import Dictionary, { Languages } from "./qp-breakout.dictionary.js";
import getStyles from "./qp-breakout.styles.js";
import Canvas from "./qp-breakout.canvas.js";
import Paddle from "./qp-breakout.paddle.js";
import Ball from "./qp-breakout.ball.js";
import Brick from "./qp-bereakout.brick.js";
import { BRICK_TYPES, LEVELS } from "./qp-breakout.levels.js";
import Stars from "./qp-breakout.stars.js";

class QPBreakout extends HTMLElement {
  static COLS = 8;
  static ROWS = 4;
  static LIVES = 3;
  static EXTRA_LIVE = 1000;
  static PADDLE_SPEED = 6;
  static MARGIN = 4;
  static PREVENT_KEYCODES = {
    13: "Enter",
    27: "Escape",
    32: "Space",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
  };

  static get observedAttributes() {
    return ["width", "scale", "lang", "use-images"];
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    // attributes
    this._lang = "de";
    this._width = null;
    this._scale = 0.75;
    this._useImages = true;

    // canvas
    this._bgCanvas = null;
    this._logoCanvas = null;
    this._bricksCanvas = null;
    this._gameCanvas = null;

    // images
    this._images = null;

    // parallax
    this._stars = null;
    this._logoImage = null;
    this._parallaxFactor = 2;

    // nodes
    this._wrapper = null;
    this._counter = null;
    this._output = null;
    this._stateNode = null;
    this._btnStop = null;
    this._btnStart = null;
    this._btnPause = null;
    this._screens = [];

    // game state
    this._hLoopTimer = null;
    this._ball = { x: 0, y: 0, dx: 0, dy: 0 };
    this._ballSpeed = {
      // greater values => slower ball
      x: 140,
      y: 140,
    };
    this._paddle = null;
    this._bricks = [];
    this._cols = QPBreakout.COLS;
    this._levels = LEVELS;
    this._currentLevelDef = null;
    this._score = 0;
    this._lives = QPBreakout.LIVES;
    this._speed = 0;
    this._level = 1;
    this._remaining = 0;

    // set initial state
    this._setState("init");

    // bound methods
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleKeyUp = this._handleKeyUp.bind(this);
    this._checkPaddleCollision = this._checkPaddleCollision.bind(this);
    this._gameLoop = this._gameLoop.bind(this);
    this._handleStopClick = this._handleStopClick.bind(this);
    this._handleStartClick = this._handleStartClick.bind(this);
    this._handlePauseClick = this._handlePauseClick.bind(this);

    this._initializeDictionary();
  }

  /* START - Lifecycle */

  async connectedCallback() {
    await this._loadImages();
    this._render();
  }

  disconnectedCallback() {
    this._reset();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case "width":
        this._width = Number(newValue) || null;
        break;
      case "scale":
        this._scale = Math.min(Number(newValue) || 0.75, 1);
        break;
      case "lang":
        this._lang = newValue;
        this._initializeDictionary();
        break;

      case "use-images":
        this._useImages = newValue !== "false";

        // Reload images (or clear them) before re-rendering
        if (this.isConnected && this._gameCanvas && this._bricksCanvas) {
          this._loadImages().then(() => this._render());
        }

        return;
    }

    if (this.isConnected && this._gameCanvas && this._bricksCanvas) {
      this._render();
    }
  }

  _reset() {
    this._stopLoop();
    this._removeEvents();
    this._bgCanvas?.destroy();
    this._logoCanvas?.destroy();
    this._bricksCanvas?.destroy();
    this._gameCanvas?.destroy();
    this._bgCanvas = null;
    this._logoCanvas = null;
    this._bricksCanvas = null;
    this._gameCanvas = null;
    this._stars = null;
    this._setState("init");
  }
  /* END - Lifecycle */

  /* START - Dictionary */

  _initializeDictionary() {
    this._dict = (key, ...args) => {
      try {
        let tmp = args.splice(0, 1)[0];
        let lang = this._lang || "de";

        if (Languages.includes(tmp)) {
          lang = tmp;
        } else if (args.length > 0 || tmp !== undefined) {
          args = [tmp, ...args];
        }

        const dict = Dictionary(args);
        return dict[key]?.[lang] || key;
      } catch (e) {
        return this._defaultDict(key, this._lang || "de", args);
      }
    };
  }

  _defaultDict(key, lang = "de", args = []) {
    const fallback = {
      funBreakoutStart: { de: "Start", en: "Start" },
      funBreakoutStop: { de: "Stop", en: "Stop" },
      funBreakoutPause: { de: "Pause", en: "Pause" },
      funBreakoutGameOver: { de: "Game Over", en: "Game Over" },
      scoreboardSize: {
        de: `Spalten: ${args[0]}, Reihen: ${args[1]}`,
        en: `Cols: ${args[0]}, Rows: ${args[1]}`,
      },
      scoreboardScore: { de: `Punkte: ${args[0]}`, en: `Score: ${args[0]}` },
      scoreboardSpeed: { de: `Speed: ${args[0]}`, en: `Speed: ${args[0]}` },
      scoreboardLevel: { de: `Level: ${args[0]}`, en: `Level: ${args[0]}` },
      scoreboardLives: { de: `Leben: ${args[0]}`, en: `Lives: ${args[0]}` },
      scoreboardRemainingBricks: { de: `Bricks: ${args[0]}`, en: `Bricks: ${args[0]}` },
      screenInitTitle: { de: `QP Breakout`, en: `QP Breakout` },
      screenInitText: { de: `Start drücken oder Leertaste`, en: `Press start or space to play` },
      screenWaitingTitle: { de: `Breakout`, en: `Breakout` },
      screenWaitingText: {
        de: `Pfeiltasten links und rechts zum Bewegen`,
        en: `Use Arrow keys left and right to move`,
      },
      screenWaitingAction: { de: `Leertaste zum Starten`, en: `Press space to start` },
      screenPausedTitle: { de: `Pausiert`, en: `Paused` },
      screenPausedText: { de: `Leertaste zum Fortsetzen`, en: `Press space to resume` },
      screenLevel: { de: `Level: ${args[0]}`, en: `Level: ${args[0]}` },
      screenCompleteTitle: { de: `Level geschafft`, en: `Level Complete` },
      screenCompleteScore: { de: `Punkte: ${args[0]}`, en: `Score: ${args[0]}` },
      screenCompleteText: { de: `Leertaste zum Weiterspielen`, en: `Press space to continue` },
      screenGameoverTitle: { de: `Game Over`, en: `Game Over` },
      screenGameoverText: {
        de: `Start oder Leertaste drücken zum Neustarten`,
        en: `Press start or space to restart`,
      },
      screenRemainingLives: { de: `Leben: ${args[0]}`, en: `Lives: ${args[0]}` },
      scoreboardState_init: { de: `QP Breakout`, en: `QP Breakout` },
      scoreboardState_waiting: { de: `Bereit`, en: `Ready` },
      scoreboardState_complete: { de: `Level geschafft`, en: `Level Complete` },
      scoreboardState_paused: { de: `Pausiert`, en: `Paused` },
      scoreboardState_running: { de: `Running`, en: `Running` },
      scoreboardState_stopped: { de: `Stop`, en: `Stopped` },
    };

    return fallback[key]?.[lang] || key;
  }
  /* END - Dictionary */

  /* START - Event Controller */

  _attachEvents() {
    this._btnStart && this._btnStart.addEventListener("click", this._handleStartClick);
    this._btnPause && this._btnPause.addEventListener("click", this._handlePauseClick);
    this._btnStop && this._btnStop.addEventListener("click", this._handleStopClick);

    window.addEventListener("keydown", this._handleKeyDown);
    window.addEventListener("keyup", this._handleKeyUp);
  }

  _removeEvents() {
    this._btnStart && this._btnStart.removeEventListener("click", this._handleStartClick);
    this._btnPause && this._btnPause.removeEventListener("click", this._handlePauseClick);
    this._btnStop && this._btnStop.removeEventListener("click", this._handleStopClick);

    window.removeEventListener("keydown", this._handleKeyDown);
    window.removeEventListener("keyup", this._handleKeyUp);
  }

  _dispatchEvent(type, payload = {}) {
    this.dispatchEvent(
      new CustomEvent(type, {
        bubbles: true,
        composed: true,
        detail: payload,
      }),
    );
  }
  /* END - Event Controller */

  /* START - Event Handlers */
  _handleStartClick() {
    this._startGame();
  }
  _handleStopClick() {
    if (this._state === "running" || this._state === "paused") {
      this._gameOver();
    }
  }

  _handlePauseClick() {
    if (this._state === "init" || this._state === "stopped") {
      this._startGame();
    } else if (this._state === "complete") {
      this._nextLevel();
    } else if (this._state === "paused") {
      this._resumeGame();
    } else {
      this._pauseGame();
    }
  }

  _handleKeyDown(e) {
    Object.keys(QPBreakout.PREVENT_KEYCODES).map(Number).includes(e.keyCode) && e.preventDefault();

    switch (e.key) {
      case "ArrowRight":
        if (this._state === "running" || this._state === "waiting") this._paddle.setSpeed("right");
        break;
      case "ArrowLeft":
        if (this._state === "running" || this._state === "waiting") this._paddle.setSpeed("left");
        break;
      case " ":
        if (this._state === "waiting") {
          this._ball.launch();
          this._setState("running");
        } else {
          this._handlePauseClick();
        }
        break;
      case "Escape":
        this._handleStopClick();
        break;
      case "t":
        if (this._state === "running") {
          const allBricks = this._bricks.flat().filter((b) => b.visible);
          allBricks.slice(0, -1).forEach((b) => {
            b.visible = false;
            this._score += b.score;
          });
          this._remaining = 1;
          this._setCounter();
          this._bricksCanvas.clear();
          this._drawBricks();
          this._setOutput();
        }
        break;
    }
  }

  _handleKeyUp(e) {
    Object.keys(QPBreakout.PREVENT_KEYCODES).map(Number).includes(e.keyCode) && e.preventDefault();

    if (this._state !== "running" && this._state !== "waiting") return;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowLeft":
        this._paddle.setSpeed("right", 0);
        break;
    }
  }
  /* END - Event Handlers */

  /* START - Canvas Controller */
  _initCanvas() {
    const canvasOptions = { wrapper: this._wrapper, width: this._width, scale: this._scale };

    this._bgCanvas = new Canvas({
      ...canvasOptions,
      cssClass: "qp-breakout-bg-canvas",
      onResize: () => {
        this._resizeScreens();
        this._drawInitialBackground();
      },
    });
    this._bgCanvas.create();
    this._bgCanvas.observe();

    this._logoCanvas = new Canvas({ ...canvasOptions, cssClass: "qp-breakout-logo-canvas" });
    this._logoCanvas.create();
    this._logoCanvas.observe();

    this._bricksCanvas = new Canvas({ ...canvasOptions, cssClass: "qp-breakout-bricks-canvas" });
    this._bricksCanvas.create();
    this._bricksCanvas.observe();

    this._gameCanvas = new Canvas(canvasOptions);
    this._gameCanvas.create();
    this._gameCanvas.observe();

    this._initStars();
    this._drawInitialBackground();
  }

  _initScreens() {
    this._initScreen = document.createElement("div");
    this._initScreen.classList.add("qp-breakout-screen", "qp-breakout-screen-init");
    this._initScreen.style.setProperty("--bg-image", `url("${this._logoImage.src}")`);
    this._initScreen.innerHTML = `
      <div class="qp-breakout-screen-content">
        <h1>${this._dict("screenInitTitle", this._lang)}</h1>
        <p>${this._dict("screenInitText", this._lang)}</p>
      </div>
    `;

    this._startScreen = document.createElement("div");
    this._startScreen.classList.add("qp-breakout-screen");
    this._startScreen.innerHTML = `
      <div class="qp-breakout-screen-content">
        <h1>${this._dict("screenWaitingTitle", this._lang)}</h1>
        <p>${this._dict("screenWaitingText", this._lang)}</p>
        <p class="qp-breakout-screen-lives">${this._dict("screenRemainingLives", this._lang, this._lives)}</p>
        <p>${this._dict("screenWaitingAction", this._lang)}</p>
      </div>
    `;

    this._pauseScreen = document.createElement("div");
    this._pauseScreen.classList.add("qp-breakout-screen");
    this._pauseScreen.innerHTML = `
      <div class="qp-breakout-screen-content">
        <h1>${this._dict("screenPausedTitle", this._lang)}</h1>
        <p>${this._dict("screenPausedText", this._lang)}</p>
      </div>
    `;

    this._gameoverScreen = document.createElement("div");
    this._gameoverScreen.classList.add("qp-breakout-screen");
    this._gameoverScreen.innerHTML = `
      <div class="qp-breakout-screen-content">
        <h1>${this._dict("screenGameoverTitle", this._lang)}</h1>
        <p class="qp-breakout-screen-score">${this._dict("screenCompleteScore", this._lang, this._score)}</p>
        <p class="qp-breakout-screen-level">${this._dict("screenLevel", this._lang, this._level)}</p>
        <p>${this._dict("screenGameoverText", this._lang)}</p>
      </div>
    `;

    this._completeScreen = document.createElement("div");
    this._completeScreen.classList.add("qp-breakout-screen");
    this._completeScreen.innerHTML = `
      <div class="qp-breakout-screen-content">
        <h1>${this._dict("screenCompleteTitle", this._lang)}</h1>
        <p class="qp-breakout-screen-level">${this._dict("screenLevel", this._lang, this._level)}</p>
        <p class="qp-breakout-screen-lives">${this._dict("screenRemainingLives", this._lang, this._lives)}</p>
        <p class="qp-breakout-screen-score">${this._dict("screenCompleteScore", this._lang, this._score)}</p>
        <p>${this._dict("screenCompleteText", this._lang)}</p>
      </div>
    `;

    this._screens = [
      this._initScreen,
      this._startScreen,
      this._pauseScreen,
      this._completeScreen,
      this._gameoverScreen,
    ];

    this._wrapper.appendChild(this._initScreen);
    this._wrapper.appendChild(this._startScreen);
    this._wrapper.appendChild(this._pauseScreen);
    this._wrapper.appendChild(this._completeScreen);
    this._wrapper.appendChild(this._gameoverScreen);
  }

  _setScreen(screen) {
    // Hide all screens
    this._screens.forEach((screen) => {
      screen.classList.remove("qp-breakout-screen-visible");
    });

    if (screen === this._completeScreen || screen === this._gameoverScreen) {
      screen.querySelector(".qp-breakout-screen-score").textContent = this._dict(
        "screenCompleteScore",
        this._lang,
        this._score,
      );
    }

    if (screen === this._completeScreen || screen === this._gameoverScreen) {
      screen.querySelector(".qp-breakout-screen-level").textContent = this._dict(
        "screenLevel",
        this._lang,
        this._level,
      );
    }

    if (screen === this._startScreen || screen === this._completeScreen) {
      screen.querySelector(".qp-breakout-screen-lives").textContent = this._dict(
        "screenRemainingLives",
        this._lang,
        this._lives,
      );
    }

    screen && screen.classList.add("qp-breakout-screen-visible");
  }

  _resizeScreens() {
    if (!this._bgCanvas) return;

    const width = this._bgCanvas.width + "px";
    const height = this._bgCanvas.height + "px";

    this._screens.forEach((screen) => {
      if (!screen) return;

      screen.style.width = width;
      screen.style.height = height;
    });
  }

  _initStars() {
    this._stars = new Stars({
      count: 150,
      canvasWidth: this._bgCanvas.width,
      canvasHeight: this._bgCanvas.height,
      ctx: this._bgCanvas.ctx,
    });
    this._stars.generate();
  }

  _drawInitialBackground() {
    if (!this._stars || !this._logoImage || !this._logoCanvas) return;

    this._stars.draw();
    this._drawLogo(0, 0);
  }

  _drawLogo(offsetX = 0, offsetY = 0) {
    if (!this._logoImage) return;

    const canvasWidth = this._logoCanvas.width;
    const canvasHeight = this._logoCanvas.height;
    const logoSize = canvasWidth * 0.4;

    this._logoCanvas.ctx.save();
    this._logoCanvas.ctx.globalAlpha = 0.25;
    this._logoCanvas.ctx.translate(
      (canvasWidth - logoSize) / 2 + offsetX,
      // shift logo 10% below center to avoid brick area
      (canvasHeight - logoSize) / 2 + canvasHeight * 0.1 + offsetY,
    );
    this._logoCanvas.ctx.drawImage(this._logoImage, 0, 0, logoSize, logoSize);
    this._logoCanvas.ctx.restore();
  }

  async _loadImages() {
    // Always load the logo (used regardless of use-images mode)
    this._logoImage = await this._loadImage("./images/qp-logo-horns-flash.svg");

    // Only load game sprites when use-images is enabled
    if (!this._useImages) {
      this._images = null;
      return;
    }

    const basePath = "./images/breakout";

    // Collect unique brick image keys from BRICK_TYPES
    const brickImageKeys = Object.values(BRICK_TYPES)
      // filter out null values
      .filter((brickType) => brickType !== null && brickType.image)
      // extract image names without extension
      .map((brickType) => brickType.image);

    try {
      // Load ball, paddle, and all brick images in parallel
      const [ballImg, paddleImg, ...brickImgs] = await Promise.all([
        this._loadImage(`${basePath}/ball.png`),
        this._loadImage(`${basePath}/paddle.png`),
        ...brickImageKeys.map((key) => this._loadImage(`${basePath}/${key}.png`)),
      ]);

      // Build the images store
      const bricks = {};

      brickImageKeys.forEach((key, i) => {
        bricks[key] = brickImgs[i];
      });

      this._images = { ball: ballImg, paddle: paddleImg, bricks };
    } catch (err) {
      console.warn("QPBreakout: Failed to load sprite images, falling back to drawn mode.", err);
      this._images = null;
    }
  }

  _loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = new URL(src, import.meta.url).href;
    });
  }

  _drawParallax() {
    const offset = (this._paddle.x / this._gameCanvas.width - 0.5) * this._parallaxFactor;

    // Stars
    this._bgCanvas.clear();
    this._bgCanvas.ctx.save();
    this._bgCanvas.ctx.translate(offset * -4, offset * -3);
    this._stars.draw();
    this._bgCanvas.ctx.restore();

    // Logo
    this._logoCanvas.clear();
    this._drawLogo(offset * -10, offset * -6);
  }

  /* END - Canvas Controller */

  /* START - Game Controller */
  _startGame() {
    if (this._state === "running") return;

    this._lives = QPBreakout.LIVES;
    this._score = 0;
    this._level = 1;
    // load level definition (predefined or random with increasing difficulty)
    this._currentLevelDef = this._getLevelDef(this._level);
    this._setPaddle();
    this._initRound();
    this._dispatchEvent("qp-breakout.game-started", {
      lives: this._lives,
      score: this._score,
      level: this._level,
    });
  }

  _initRound() {
    this._gameCanvas.clear();
    this._bricksCanvas.clear();

    this._setBall();
    this._setBricks();
    this._remaining = this._bricks.flat().filter((brick) => brick.visible).length;
    this._drawBricks();

    // Place ball on paddle and wait for launch
    this._paddle.centerOn(this._gameCanvas.width);
    this._ball.attachTo(this._paddle);
    this._setState("waiting");
    this._setCounter();
    this._setOutput();
    this._gameLoop();
  }

  _pauseGame(state = "paused") {
    this._stopLoop();

    this._setState(state);
    this._dispatchEvent("qp-breakout.game-paused", {
      lives: this._lives,
      score: this._score,
      level: this._level,
    });
  }

  _resumeGame() {
    this._gameLoop();

    this._setState("running");
    this._dispatchEvent("qp-breakout.game-resumed", {
      lives: this._lives,
      score: this._score,
      level: this._level,
    });
  }

  _nextLevel() {
    this._level++;
    // advance to next level definition (predefined or random)
    this._currentLevelDef = this._getLevelDef(this._level);
    this._initRound();
    this._dispatchEvent("qp-breakout.game-level-up", {
      lives: this._lives,
      score: this._score,
      level: this._level,
    });
  }

  _gameOver() {
    this._stopLoop();
    this._gameCanvas.clear();
    this._setState("stopped");
    this._setOutput();
    this._dispatchEvent("qp-breakout.game-over", {
      lives: this._lives,
      score: this._score,
      level: this._level,
    });
  }

  _gameLoop() {
    this._gameCanvas.clear();
    this._drawParallax();

    this._paddle.move();

    // While waiting for launch, ball follows the paddle
    if (this._ball.attached) {
      this._ball.attachTo(this._paddle);
      this._ball.draw();
      this._paddle.draw();
      this._hLoopTimer = requestAnimationFrame(this._gameLoop);
      return;
    }

    this._ball.move();

    if (!this._checkPaddleCollision()) return;
    // ball hits a brick
    if (this._checkBrickCollision()) {
      this._remaining = this._bricks.flat().filter((b) => b.visible).length;
      this._bricksCanvas.clear();
      this._setOutput();

      if (this._remaining <= 0) {
        this._score += this._currentLevelDef.score;
        this._dispatchEvent("qp-breakout.level-complete", {
          lives: this._lives,
          score: this._score,
          level: this._level,
        });
        this._pauseGame("complete");
        return;
      }

      this._drawBricks();
    }

    this._ball.draw();
    this._paddle.draw();

    this._hLoopTimer = requestAnimationFrame(this._gameLoop);
  }

  _stopLoop() {
    if (this._hLoopTimer) {
      cancelAnimationFrame(this._hLoopTimer);
      this._hLoopTimer = null;
    }
  }

  _setPaddle() {
    this._paddle = new Paddle({
      paddleWidth: Math.round(this._gameCanvas.width / 6),
      paddleHeight: Math.round(this._gameCanvas.width / 6 / 7),
      speed: QPBreakout.PADDLE_SPEED,
      canvasWidth: this._gameCanvas.width,
      canvasHeight: this._gameCanvas.height,
      ctx: this._gameCanvas.ctx,
      image: this._images?.paddle || null,
    });
  }

  _setBall() {
    this._ball = new Ball({
      ballRadius: Math.round(this._gameCanvas.width / 80),
      speedX: Math.round(this._gameCanvas.width / this._ballSpeed.x),
      speedY: -Math.round(this._gameCanvas.width / this._ballSpeed.y),
      canvasWidth: this._gameCanvas.width,
      canvasHeight: this._gameCanvas.height,
      ctx: this._gameCanvas.ctx,
      image: this._images?.ball || null,
    });
  }

  _setBricks() {
    const levelDef = this._currentLevelDef;
    let layout;

    if (levelDef && levelDef.layout) {
      // predefined board: use the exact layout from the level definition
      layout = levelDef.layout;
    } else if (levelDef && levelDef.random) {
      // random board: generate layout based on difficulty parameters
      layout = this._generateRandomLayout(levelDef.random);
    } else {
      // fallback: full grid matching original behavior
      layout = this._generateFullGrid(QPBreakout.ROWS, this._cols);
    }

    // reset bricks array
    this._bricks = [];

    const rows = layout.length;
    const cols = Math.max(...layout.map((r) => r.length));

    const canvasWidth = this._bricksCanvas.width;
    const margin = canvasWidth < 480 ? QPBreakout.MARGIN - 1 : QPBreakout.MARGIN;
    // const margin = canvasWidth < 480 ? Math.round(canvasWidth / 100) : QPBreakout.MARGIN;
    const brickWidth = (canvasWidth - margin * (cols + 1)) / cols;
    const brickHeight = Math.round(brickWidth / 3);

    for (let i = 0; i < rows; i++) {
      this._bricks[i] = [];

      for (let j = 0; j < cols; j++) {
        const typeId = layout[i][j] || 0;
        const brickType = BRICK_TYPES[typeId];

        if (!brickType) {
          // empty cell — invisible placeholder to maintain grid structure
          const brick = new Brick({
            x: margin + j * (brickWidth + margin),
            y: margin + i * (brickHeight + margin),
            width: brickWidth,
            height: brickHeight,
            fill: "transparent",
            score: 0,
            hits: 0,
            ctx: this._bricksCanvas.ctx,
          });
          brick.visible = false;
          this._bricks[i].push(brick);
        } else {
          this._bricks[i].push(
            new Brick({
              x: margin + j * (brickWidth + margin),
              y: margin + i * (brickHeight + margin),
              width: brickWidth,
              height: brickHeight,
              fill: brickType.color,
              score: brickType.score,
              hits: brickType.hits,
              ctx: this._bricksCanvas.ctx,
              image: this._images?.bricks[brickType.image] || null,
            }),
          );
        }
      }
    }
  }

  _drawBricks() {
    for (let row = 0; row < this._bricks.length; row++) {
      for (let col = 0; col < this._bricks[row].length; col++) {
        this._bricks[row][col].visible && this._bricks[row][col].draw();
      }
    }
  }

  _checkPaddleCollision() {
    // ball is at paddle height and moving downward
    if (this._ball.dy > 0 && this._ball.y + this._ball.radius >= this._paddle.y) {
      // ball hits paddle
      if (
        this._ball.y + this._ball.radius < this._paddle.y + this._paddle.height &&
        this._ball.x + this._ball.radius > this._paddle.x &&
        this._ball.x - this._ball.radius < this._paddle.x + this._paddle.width
      ) {
        // offset: -1 (left edge) to +1 (right edge)
        const hitPoint =
          (this._ball.x - (this._paddle.x + this._paddle.width / 2)) / (this._paddle.width / 2);
        // angle: 150° (left) to 30° (right) — center = 90° (vertical)
        const angle = ((1 - hitPoint) * Math.PI) / 3 + Math.PI / 6;
        // preserve speed
        const speed = Math.sqrt(this._ball.dx ** 2 + this._ball.dy ** 2);

        this._ball.dx = speed * Math.cos(angle);
        this._ball.dy = -speed * Math.sin(angle);
      } else if (this._ball.y - this._ball.radius > this._gameCanvas.height) {
        // paddle missed — ball passed bottom
        this._lives--;
        this._setCounter();
        this._dispatchEvent("qp-breakout.game-life-lost", { lives: this._lives });

        if (this._lives <= 0) {
          this._gameOver();
          return false;
        }

        this._paddle.centerOn(this._gameCanvas.width);
        this._ball.attachTo(this._paddle);
        this._setState("waiting");
      }
    }

    return true;
  }

  _checkBrickCollision() {
    const radius = this._ball.radius;
    let _hasCollision = false;

    for (let i = 0; i < this._bricks.length; i++) {
      for (let j = 0; j < this._bricks[i].length; j++) {
        const brick = this._bricks[i][j];

        if (!brick.visible) continue;

        // ball edges vs brick bounds
        if (
          this._ball.x + radius > brick.x &&
          this._ball.x - radius < brick.x + brick.width &&
          this._ball.y + radius > brick.y &&
          this._ball.y - radius < brick.y + brick.height
        ) {
          // determine hit side based on direction
          if (this._ball.dy < 0 && this._ball.y - radius <= brick.y + brick.height) {
            // hit from below (ball moving up)
            this._ball.dy *= -1;
          } else if (this._ball.dy > 0 && this._ball.y + radius >= brick.y) {
            // hit from above (ball moving down)
            this._ball.dy *= -1;
          } else {
            // hit from left or right
            this._ball.dx *= -1;
          }

          // multi-hit: only score when brick is destroyed
          const destroyed = brick.hit();
          if (destroyed) {
            const oldThreshold = Math.floor(this._score / QPBreakout.EXTRA_LIVE);
            this._score += brick.score;
            const newThreshold = Math.floor(this._score / QPBreakout.EXTRA_LIVE);
            const extraLives = newThreshold - oldThreshold;
            this._lives += extraLives;
            extraLives > 0 &&
              this._dispatchEvent("qp-breakout.game-extra-life", {
                lives: this._lives,
                score: this._score,
                level: this._level,
              });
          }

          this._setCounter();
          _hasCollision = true;
        }
      }
    }

    return _hasCollision;
  }
  /* END - Game Controller */

  /* START - Game Logic (Helpers) */
  _getLevelDef(level) {
    const index = level - 1;

    // predefined level available
    if (index < this._levels.length) {
      return this._levels[index];
    }

    // beyond predefined levels: generate random with increasing difficulty
    const extraLevels = index - this._levels.length + 1;
    return {
      name: "Random",
      random: {
        rows: Math.min(7, 4 + Math.floor(extraLevels / 2)),
        cols: this._cols,
        fillRatio: Math.min(0.9, 0.5 + extraLevels * 0.05),
        maxType: Math.min(8, 6 + Math.floor(extraLevels / 3)),
      },
    };
  }

  _generateRandomLayout({ rows, cols, fillRatio = 0.7, maxType = 6 }) {
    rows = rows || QPBreakout.ROWS;
    cols = cols || QPBreakout.COLS;

    const totalCells = rows * cols;
    const targetBricks = Math.max(1, Math.round(totalCells * fillRatio));

    // empty grid
    const layout = Array.from({ length: rows }, () => Array(cols).fill(0));

    // collect all positions and shuffle (Fisher-Yates)
    const positions = [];

    // collect all positions in a flat array
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        positions.push([row, col]);
      }
    }
    // Fisher-Yates Shuffle: swap each position with a random position
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    // place bricks
    for (let i = 0; i < targetBricks; i++) {
      const [row, col] = positions[i];
      // type based on row: top rows = higher type/score
      const type = Math.min(maxType, Math.max(1, Math.ceil(((rows - row) / rows) * maxType)));

      layout[row][col] = type;
    }

    // playability guarantee: bottom row must not be completely empty
    const bottomRow = layout[rows - 1];

    // if all cells in bottom row are empty (layout=[0,0,0,0]), add a random brick
    if (bottomRow.every((cell) => cell === 0)) {
      bottomRow[Math.floor(Math.random() * cols)] = 1;
    }

    return layout;
  }

  _generateFullGrid(rows, cols) {
    const layout = [];

    for (let row = 0; row < rows; row++) {
      const type = Math.min(6, Math.max(1, rows - row));
      layout.push(Array(cols).fill(type));
    }

    return layout;
  }
  /* END - Game Logic (Helpers) */

  /* START - UI / Rendering */
  _setState(state) {
    if (state) this._state = state;

    if (!this._stateNode) return;

    const label =
      this._state === "stopped" && this._lives <= 0
        ? this._dict("funBreakoutGameOver", this._lang)
        : this._dict(`scoreboardState_${this._state}`, this._lang);

    this._stateNode.textContent = label;

    const screenMap = {
      init: this._initScreen,
      waiting: this._startScreen,
      paused: this._pauseScreen,
      complete: this._completeScreen,
      stopped: this._gameoverScreen,
    };

    this._setScreen(screenMap[this._state] || null);
  }
  _setCounter() {
    if (this._counter)
      this._counter.textContent = `${this._dict("scoreboardLevel", this._lang, this._level)}, ${this._dict("scoreboardScore", this._lang, this._score)}, ${this._dict("scoreboardLives", this._lang, this._lives)}`;
  }
  _setOutput() {
    // const remainingBricks = this._bricks.flat().filter((b) => b.visible).length;

    if (this._output)
      this._output.textContent = `${this._dict("scoreboardRemainingBricks", this._lang, this._remaining)}`;
  }

  _setStyles() {
    return getStyles.call(this);
  }

  _setNodes() {
    this._btnStop = this.shadowRoot.querySelector(".qp-breakout-btn-stop");
    this._btnStart = this.shadowRoot.querySelector(".qp-breakout-btn-start");
    this._btnPause = this.shadowRoot.querySelector(".qp-breakout-btn-pause");

    this._wrapper = this.shadowRoot.querySelector(".qp-breakout-wrapper");

    this._output = this.shadowRoot.querySelector(".qp-scoreboard-output");
    this._stateNode = this.shadowRoot.querySelector(".qp-scoreboard-state");
    this._counter = this.shadowRoot.querySelector(".qp-scoreboard-counter");
  }

  _render() {
    this._reset();

    this.shadowRoot.innerHTML = `
    ${this._setStyles()}
    ${this._createScoreboard()}
    ${this._createCanvas()}
    ${this._createButtonBar()}
    `;

    if (this.isConnected) {
      this._setNodes();
      this._initCanvas();
      this._initScreens();
      this._resizeScreens();
      this._attachEvents();
      this._setState();
    }
  }

  _createScoreboard() {
    return `
    <div class="qp-scoreboard">
      <div class="qp-scoreboard-state">---</div>
      <div class="qp-scoreboard-output">---</div>
      <div class="qp-scoreboard-counter">${this._dict("scoreboardLevel", this._lang, this._level)}, ${this._dict("scoreboardScore", this._lang, this._score)}, ${this._dict("scoreboardLives", this._lang, this._lives)}</div>
    </div>`;
  }

  _createCanvas() {
    return `
      <div class="qp-breakout-wrapper"></div>`;
  }

  _createButtonBar() {
    return `
      <div class="qp-breakout-button-bar">
        <button class="qp-btn qp-btn-primary qp-breakout-btn-start">${this._dict("funBreakoutStart", this._lang)}</button>
        <button class="qp-btn qp-btn-cta qp-breakout-btn-pause">${this._dict("funBreakoutPause", this._lang)}</button>
        <button class="qp-btn qp-btn-secondary qp-breakout-btn-stop">${this._dict("funBreakoutStop", this._lang)}</button>
      </div>`;
  }
  /* END - UI / Rendering */
}

// Registration
customElements.define("qp-breakout", QPBreakout);

export default QPBreakout;
