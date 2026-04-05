/**
 * Screen overlay system for QPBreakout.
 *
 * Contains two classes:
 *   - Screen (internal)          — represents a single overlay element
 *   - ScreenController (export)  — orchestrates all Screen instances
 *
 * Screen definitions are declared in SCREEN_DEFS. Each definition describes
 * a screen's state mapping, CSS classes, HTML template, dynamic fields for
 * automatic text updates, and an optional onShow callback for custom logic.
 *
 * @module qp-breakout.screen
 */

/**
 * Declarative screen definitions.
 *
 * Each entry maps a game state to a screen overlay. The template function
 * receives the translation helper (dict), the current language, and game
 * data ({ score, level, lives }) to render translated HTML.
 *
 * dynamicFields are updated automatically when the screen is shown:
 *   - selector — CSS selector for the element to update
 *   - dictKey  — translation key passed to dict()
 *   - dataKey  — property name on the gameData object
 *
 * onShow is an optional callback invoked after dynamicFields are applied,
 * useful for custom DOM manipulation beyond simple text updates.
 *
 * styleProps is an optional function that returns CSS custom properties
 * to set on the screen element (e.g. background image on the init screen).
 */
const SCREEN_DEFS = [
  {
    state: "init",
    cssClasses: ["qp-breakout-screen", "qp-breakout-screen-init"],
    styleProps: (logoSrc) => ({ "--bg-image": `url("${logoSrc}")` }),
    template: (dict, lang) => `
      <div class="qp-breakout-screen-content">
        <h1>${dict("screenInitTitle", lang)}</h1>
        <p>${dict("screenInitText", lang)}</p>
      </div>`,
    dynamicFields: [],
  },
  {
    state: "waiting",
    cssClasses: ["qp-breakout-screen"],
    template: (dict, lang, data) => `
      <div class="qp-breakout-screen-content">
        <h1>${dict("screenInitTitle", lang)}</h1>
        <p>${dict("screenWaitingText", lang)}</p>
        <p class="qp-breakout-screen-lives">${dict("screenRemainingLives", lang, data.lives)}</p>
        <p>${dict("screenWaitingAction", lang)}</p>
      </div>`,
    dynamicFields: [
      { selector: ".qp-breakout-screen-lives", dictKey: "screenRemainingLives", dataKey: "lives" },
    ],
  },
  {
    state: "paused",
    cssClasses: ["qp-breakout-screen"],
    template: (dict, lang) => `
      <div class="qp-breakout-screen-content">
        <h1>${dict("screenPausedTitle", lang)}</h1>
        <p>${dict("screenPausedText", lang)}</p>
      </div>`,
    dynamicFields: [],
  },
  {
    state: "complete",
    cssClasses: ["qp-breakout-screen"],
    template: (dict, lang, data) => `
      <div class="qp-breakout-screen-content">
        <h1>${dict("screenCompleteTitle", lang)}</h1>
        <p class="qp-breakout-screen-level">${dict("screenLevel", lang, data.level)}</p>
        <p class="qp-breakout-screen-lives">${dict("screenRemainingLives", lang, data.lives)}</p>
        <p class="qp-breakout-screen-score">${dict("screenCompleteScore", lang, data.score)}</p>
        <p>${dict("screenCompleteText", lang)}</p>
      </div>`,
    dynamicFields: [
      { selector: ".qp-breakout-screen-score", dictKey: "screenCompleteScore", dataKey: "score" },
      { selector: ".qp-breakout-screen-level", dictKey: "screenLevel", dataKey: "level" },
      { selector: ".qp-breakout-screen-lives", dictKey: "screenRemainingLives", dataKey: "lives" },
    ],
  },
  {
    state: "stopped",
    cssClasses: ["qp-breakout-screen"],
    template: (dict, lang, data) => `
      <div class="qp-breakout-screen-content">
        <h1>${dict("screenGameoverTitle", lang)}</h1>
        <p class="qp-breakout-screen-score">${dict("screenCompleteScore", lang, data.score)}</p>
        <p class="qp-breakout-screen-level">${dict("screenLevel", lang, data.level)}</p>
        <p>${dict("screenGameoverText", lang)}</p>
      </div>`,
    dynamicFields: [
      { selector: ".qp-breakout-screen-score", dictKey: "screenCompleteScore", dataKey: "score" },
      { selector: ".qp-breakout-screen-level", dictKey: "screenLevel", dataKey: "level" },
    ],
  },
];

/**
 * Represents a single screen overlay.
 *
 * Each Screen instance owns one DOM element that is appended to a wrapper
 * container. The element is created from a template function and can have
 * dynamic fields that are updated each time the screen is shown.
 *
 * Visibility is controlled via a CSS class toggle ("qp-breakout-screen-visible").
 * The screen is hidden by default after creation.
 */
class Screen {
  /**
   * @param {Object} def - A screen definition from SCREEN_DEFS
   * @param {string}   def.state        - Game state this screen belongs to
   * @param {string[]} def.cssClasses   - CSS classes for the root element
   * @param {Function} def.template     - (dict, lang, data) => innerHTML string
   * @param {Array}    def.dynamicFields - Auto-update rules: [{ selector, dictKey, dataKey }]
   * @param {Function} [def.onShow]     - Optional callback (el, dict, lang, data) for custom logic
   * @param {Function} [def.styleProps] - Optional (logoSrc) => { "--key": "value" }
   */
  constructor(def) {
    this.state = def.state;
    this._template = def.template;
    this._cssClasses = def.cssClasses;
    this._dynamicFields = def.dynamicFields || [];
    this._onShow = def.onShow || null;
    this._styleProps = def.styleProps || null;
    this.el = null;
  }

  /**
   * Create the screen DOM element and append it to the wrapper.
   *
   * Builds the element from the template function, applies CSS classes,
   * sets optional CSS custom properties (e.g. --bg-image), and appends
   * the element to the provided wrapper container.
   *
   * @param {HTMLElement} wrapper - Parent element to append the screen to
   * @param {Function} dict       - Translation function (key, lang, ...args) => string
   * @param {string} lang         - Current language code
   * @param {Object} data         - Game data { score, level, lives }
   * @param {string} logoSrc      - Logo image src (for styleProps)
   */
  create(wrapper, dict, lang, data, logoSrc) {
    this.el = document.createElement("div");
    this.el.classList.add(...this._cssClasses);
    this.el.innerHTML = this._template(dict, lang, data);

    // Apply optional CSS custom properties (e.g. --bg-image on init screen)
    if (this._styleProps) {
      const props = this._styleProps(logoSrc);

      Object.entries(props).forEach(([key, value]) => {
        this.el.style.setProperty(key, value);
      });
    }

    wrapper.appendChild(this.el);
  }

  /**
   * Update dynamic text fields and invoke the optional onShow callback.
   *
   * Iterates over dynamicFields and sets textContent on matched elements
   * using the dict function. Then calls onShow if defined, allowing
   * custom DOM manipulation beyond simple text updates.
   *
   * @param {Function} dict - Translation function
   * @param {string} lang   - Current language code
   * @param {Object} data   - Game data { score, level, lives }
   */
  update(dict, lang, data) {
    if (!this.el) return;

    this._dynamicFields.forEach(({ selector, dictKey, dataKey }) => {
      const node = this.el.querySelector(selector);

      if (node) {
        node.textContent = dict(dictKey, lang, data[dataKey]);
      }
    });

    if (this._onShow) {
      this._onShow(this.el, dict, lang, data);
    }
  }

  /**
   * Make this screen visible by adding the visible CSS class.
   */
  show() {
    this.el?.classList.add("qp-breakout-screen-visible");
  }

  /**
   * Hide this screen by removing the visible CSS class.
   */
  hide() {
    this.el?.classList.remove("qp-breakout-screen-visible");
  }

  /**
   * Set the screen element dimensions to match the canvas size.
   *
   * @param {string} width  - CSS width value (e.g. "480px")
   * @param {string} height - CSS height value (e.g. "320px")
   */
  resize(width, height) {
    if (!this.el) return;

    this.el.style.width = width;
    this.el.style.height = height;
  }

  /**
   * Remove the screen element from the DOM and clear references.
   */
  destroy() {
    this.el?.remove();
    this.el = null;
  }
}

/**
 * Orchestrates all Screen instances for the QPBreakout game.
 *
 * The ScreenController creates Screen instances from the declarative
 * SCREEN_DEFS configuration. It manages the state-to-screen mapping
 * and ensures only one screen is visible at a time.
 *
 * Usage in the web component:
 *   const ctrl = new ScreenController({ wrapper, dict, logoSrc });
 *   ctrl.init(lang, { score, level, lives });
 *   ctrl.show("waiting", lang, { score, level, lives });
 *   ctrl.resize("480px", "320px");
 *   ctrl.destroy();
 */
export default class ScreenController {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.wrapper - Parent element for all screen overlays
   * @param {Function}    options.dict    - Translation function (key, lang, ...args) => string
   * @param {string}      options.logoSrc - Logo image src for the init screen background
   */
  constructor(options) {
    this._wrapper = options.wrapper;
    this._dict = options.dict;
    this._logoSrc = options.logoSrc;

    // Map of state string to Screen instance, populated by init()
    this._screens = new Map();
  }

  /**
   * Create all screen instances from SCREEN_DEFS and append them to the wrapper.
   *
   * Each definition in SCREEN_DEFS becomes a Screen instance. The screens
   * are stored in a Map keyed by their state string for O(1) lookup in show().
   *
   * @param {string} lang - Current language code
   * @param {Object} data - Initial game data { score, level, lives }
   */
  init(lang, data) {
    SCREEN_DEFS.forEach((def) => {
      const screen = new Screen(def);
      screen.create(this._wrapper, this._dict, lang, data, this._logoSrc);
      this._screens.set(def.state, screen);
    });
  }

  /**
   * Show the screen matching the given state, hide all others.
   *
   * Hides every screen first, then looks up the screen for the requested
   * state. If found, updates its dynamic fields with current game data
   * and makes it visible. If the state has no associated screen (e.g.
   * "running"), all screens remain hidden.
   *
   * @param {string} state - Game state (e.g. "init", "waiting", "paused", "complete", "stopped")
   * @param {string} lang  - Current language code
   * @param {Object} data  - Current game data { score, level, lives }
   */
  show(state, lang, data) {
    // Hide all screens
    this._screens.forEach((screen) => screen.hide());

    // Show and update the matching screen (from this._screens Map)
    const screen = this._screens.get(state);

    if (screen) {
      screen.update(this._dict, lang, data);
      screen.show();
    }
  }

  /**
   * Resize all screen elements to match the canvas dimensions.
   *
   * Called from the Canvas resize observer callback to keep screens
   * aligned with the game canvas.
   *
   * @param {string} width  - CSS width value (e.g. "480px")
   * @param {string} height - CSS height value (e.g. "320px")
   */
  resize(width, height) {
    this._screens.forEach((screen) => screen.resize(width, height));
  }

  /**
   * Destroy all screens and clear the internal Map.
   *
   * Called from _reset() when the component is re-rendered or disconnected.
   */
  destroy() {
    this._screens.forEach((screen) => screen.destroy());
    this._screens.clear();
  }
}
