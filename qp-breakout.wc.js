/**
 * <qp-breakout> — Breakout Game Web Component
 *
 * A classic breakout/brick-breaker game rendered on an HTML5 Canvas. A ball
 * bounces off a paddle controlled by the player, destroying bricks on contact.
 * The game ends when all lives are lost or all bricks are destroyed.
 *
 * @element qp-breakout
 *
 * @attr {string} width  - Canvas width in pixels. Default: "480"
 * @attr {string} height - Canvas height in pixels. Default: "320"
 * @attr {number} cols   - Number of brick columns. Default: 8
 * @attr {number} rows   - Number of brick rows. Default: 4
 * @attr {number} lives  - Number of lives. Default: 3
 * @attr {string} lang   - Language code for translations ("de" or "en"). Default: "de"
 *
 * @example
 *   <qp-breakout></qp-breakout>
 *
 *   <!-- Custom size and language -->
 *   <qp-breakout width="600" height="400" cols="10" rows="5" lang="en"></qp-breakout>
 *
 * @dependencies
 *   - ./qp-breakout.dictionary.js  — i18n translations
 *   - ./qp-breakout.styles.js      — scoped styles
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
    return ["width", "scale", "lang"];
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    // attributes
    this._lang = "de";
    this._width = null;
    this._scale = 0.75;

    // canvas
    this._bgCanvas = null;
    this._logoCanvas = null;
    this._bricksCanvas = null;
    this._gameCanvas = null;

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
    this._state = "stopped";
    this._remaining = 0;

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
    }

    if (this.isConnected && this._gameCanvas && this._bricksCanvas) {
      this._render();
    }
  }

  _reset() {
    this._removeEvents();
    this._bgCanvas?.destroy();
    this._logoCanvas?.destroy();
    this._bricksCanvas?.destroy();
    this._gameCanvas?.destroy();
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
      scoreboardLives: { de: `Leben: ${args[0]}`, en: `Lives: ${args[0]}` },
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
    if (this._state === "stopped") {
      this._startGame();
    } else if (this._state === "paused") {
      if (this._remaining <= 0) {
        this._nextLevel();
      } else {
        this._resumeGame();
      }
    } else {
      this._pauseGame();
    }
  }

  _handleKeyDown(e) {
    Object.keys(QPBreakout.PREVENT_KEYCODES).map(Number).includes(e.keyCode) && e.preventDefault();

    switch (e.key) {
      case "ArrowRight":
        if (this._state === "running") this._paddle.setSpeed("right");
        break;
      case "ArrowLeft":
        if (this._state === "running") this._paddle.setSpeed("left");
        break;
      case " ":
        // if (this._state === "stopped") {
        //   this._startGame();
        // } else if (this._state === "paused") {
        //   if (this._remaining <= 0) {
        //     this._nextLevel();
        //   } else {
        //     this._resumeGame();
        //   }
        // } else {
        //   this._pauseGame();
        // }
        this._handlePauseClick();
        break;
      case "Escape":
        // if (this._state === "running" || this._state === "paused") {
        //   this._gameOver();
        // }
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

    if (this._state !== "running") return;

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
      onResize: () => this._drawInitialBackground(),
    });
    this._bgCanvas.create();
    this._bgCanvas.observe();

    this._logoCanvas = new Canvas({ ...canvasOptions, cssClass: "qp-breakout-logo-canvas" });
    this._logoCanvas.create();

    this._bricksCanvas = new Canvas({ ...canvasOptions, cssClass: "qp-breakout-bricks-canvas" });
    this._bricksCanvas.create();

    this._gameCanvas = new Canvas(canvasOptions);
    this._gameCanvas.create();

    this._initStars();
    this._drawInitialBackground();
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
    this._logoImage = await this._loadImage("./images/qp-logo-horns-flash.svg");
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
  }

  _initRound() {
    this._gameCanvas.clear();
    this._bricksCanvas.clear();

    this._setBall();
    this._setBricks();
    this._remaining = this._bricks.flat().filter((b) => b.visible).length;
    this._drawBricks();
    this._gameLoop();

    this._state = "running";
    this._setState();
    this._setCounter();
    this._setOutput();
  }

  _pauseGame() {
    this._stopLoop();

    this._state = "paused";
    this._setState();
  }

  _resumeGame() {
    this._gameLoop();

    this._state = "running";
    this._setState();
  }

  _nextLevel() {
    this._level++;
    // advance to next level definition (predefined or random)
    this._currentLevelDef = this._getLevelDef(this._level);
    this._initRound();
  }

  _gameOver() {
    this._stopLoop();
    this._gameCanvas.clear();
    this._state = "stopped";
    this._setState();
    this._setOutput();
    this._dispatchEvent("qp-breakout.game-over");
  }

  _gameLoop() {
    this._gameCanvas.clear();
    this._drawParallax();

    this._paddle.move();
    this._ball.move();

    if (!this._checkPaddleCollision()) return;
    // ball hits a brick
    if (this._checkBrickCollision()) {
      this._remaining = this._bricks.flat().filter((b) => b.visible).length;
      this._bricksCanvas.clear();
      this._setOutput();

      if (this._remaining <= 0) {
        this._score += this._currentLevelDef.score;
        this._pauseGame();
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

    this._bricks = [];
    const rows = layout.length;
    const cols = Math.max(...layout.map((r) => r.length));

    const cw = this._bricksCanvas.width;
    const margin = Math.round(cw / 100);
    const brickWidth = (cw - margin * (cols + 1)) / cols;
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

        this._ball.reset();
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
            this._lives += newThreshold - oldThreshold;
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
  _setState() {
    if (this._stateNode) {
      const state =
        this._state === "stopped" && this._lives <= 0
          ? this._dict("funBreakoutGameOver", this._lang)
          : this._dict(`scoreboardState_${this._state}`, this._lang);

      this._stateNode.textContent = state;
    }
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
      this._attachEvents();
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
