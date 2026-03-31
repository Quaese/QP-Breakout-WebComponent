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

class QPBreakout extends HTMLElement {
  static COLS = 8;
  static ROWS = 4;
  static LIVES = 3;
  static PADDLE_SPEED = 6;
  static BRICK_PADDING = 4;
  static BRICK_OFFSET_TOP = 40;
  static BRICK_OFFSET_LEFT = 10;
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
    this._cols = QPBreakout.COLS;
    this._rows = QPBreakout.ROWS;

    // canvas
    this._gameCanvas = null;

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
    this._paddle = null;
    this._bricks = [];
    this._score = 0;
    this._lives = QPBreakout.LIVES;
    this._speed = 0;
    this._level = 1;
    this._state = "stopped";

    // bound methods
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleKeyUp = this._handleKeyUp.bind(this);
    this._checkPaddleCollision = this._checkPaddleCollision.bind(this);
    this._gameLoop = this._gameLoop.bind(this);
    // this._handleStopClick = this._handleStopClick.bind(this);
    this._handleStartClick = this._handleStartClick.bind(this);
    // this._handlePauseClick = this._handlePauseClick.bind(this);

    this._initializeDictionary();
  }

  /* START - Lifecycle */

  connectedCallback() {
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

    if (this.isConnected && this._gameCanvas) {
      this._render();
    }
  }

  _reset() {
    this._removeEvents();
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

    window.addEventListener("keydown", this._handleKeyDown);
    window.addEventListener("keyup", this._handleKeyUp);
  }

  _removeEvents() {
    this._btnStart && this._btnStart.removeEventListener("click", this._handleStartClick);

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
        if (this._state === "stopped") {
          this._startGame();
        } else if (this._state === "paused") {
          this._resumeGame();
        } else {
          this._pauseGame();
        }
        break;
      case "Escape":
        if (this._state === "running" || this._state === "paused") {
          this._gameOver();
        }
        break;
    }
  }

  _handleKeyUp(e) {
    Object.keys(QPBreakout.PREVENT_KEYCODES).map(Number).includes(e.keyCode) && e.preventDefault();

    if (this._state !== "running") return;
    this._paddle.setSpeed("right", 0);
    // switch (e.key) {
    //   case "ArrowRight":
    //     this._paddle.setSpeed("right", 0);
    //     break;
    //   case "ArrowLeft":
    //     this._paddle.setSpeed("left", 0);
    //     break;
    // }
  }
  /* END - Event Handlers */

  /* START - Canvas Controller */
  _initCanvas() {
    this._gameCanvas = new Canvas({
      wrapper: this._wrapper,
      width: this._width,
      scale: this._scale,
    });
    this._gameCanvas.create();
    this._gameCanvas.observe();
  }
  /* END - Canvas Controller */

  /* START - Game Controller */
  _startGame() {
    if (this._state === "running") return;

    this._lives = QPBreakout.LIVES;
    this._score = 0;

    this._setPaddle();
    this._setBall();
    this._gameLoop();

    this._state = "running";
    this._setState();
    this._setOutput(this._dict("funBreakoutStart", this._lang));
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

  _gameOver() {
    this._stopLoop();
    this._gameCanvas.clear();
    this._state = "stopped";
    this._setState();
    this._setOutput(this._dict("funBreakoutGameOver", this._lang));
    this._dispatchEvent("qp-breakout.game-over");
  }

  _gameLoop() {
    this._gameCanvas.clear();

    this._paddle.move();
    this._ball.move();

    if (!this._checkPaddleCollision()) return;

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
      speedX: Math.round(this._gameCanvas.width / 120),
      speedY: -Math.round(this._gameCanvas.width / 120),
      canvasWidth: this._gameCanvas.width,
      canvasHeight: this._gameCanvas.height,
      ctx: this._gameCanvas.ctx,
    });
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
        this._ball.dy *= -1;
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
  /* END - Game Controller */

  /* START - Game Logic (Helpers) */
  /* END - Game Logic (Helpers) */

  /* START - UI / Rendering */
  _setState() {
    if (this._stateNode)
      this._stateNode.textContent = this._dict(`scoreboardState_${this._state}`, this._lang);
  }
  _setCounter() {
    if (this._counter)
      this._counter.textContent = `${this._dict("scoreboardScore", this._lang, this._score)}, ${this._dict("scoreboardLives", this._lang, this._lives)}`;
  }
  _setOutput(output) {
    if (this._output) this._output.textContent = output;
  }

  _setStyles() {
    return getStyles.call(this);
  }

  _setNodes() {
    this._btnStop = this.shadowRoot.querySelector(".qp-breakout-btn-stop");
    this._btnStart = this.shadowRoot.querySelector(".qp-breakout-btn-start");
    this._btnPause = this.shadowRoot.querySelector(".qp-breakout-btn-pause");

    this._wrapper = this.shadowRoot.querySelector(".qp-breakout-wrapper");

    this._counter = this.shadowRoot.querySelector(".qp-scoreboard-counter");
    this._stateNode = this.shadowRoot.querySelector(".qp-scoreboard-state");
    this._output = this.shadowRoot.querySelector(".qp-scoreboard-output");
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
      <div class="qp-scoreboard-title">${this._dict("scoreboardSize", this._lang, this._cols, this._rows)}</div>
      <div class="qp-scoreboard-output">---</div>
      <div class="qp-scoreboard-counter">${this._dict("scoreboardScore", this._lang, this._score)}, ${this._dict("scoreboardLives", this._lang, this._lives)}</div>
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

  _getBrickColor(row) {
    const colors = [
      "rgba(220, 53, 69, 0.9)", // red
      "rgba(255, 153, 0, 0.9)", // orange
      "rgba(255, 193, 7, 0.9)", // yellow
      "rgba(25, 135, 84, 0.9)", // green
      "rgba(13, 110, 253, 0.9)", // blue
      "rgba(102, 16, 242, 0.9)", // purple
    ];

    return colors[row % colors.length];
  }
  /* END - UI / Rendering */
}

// Registration
customElements.define("qp-breakout", QPBreakout);

export default QPBreakout;
