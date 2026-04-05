export default class Canvas {
  static HEIGHT_RATIO = 0.9;
  static _observer = null;
  static _instances = new Set();

  /**
   * Initializes a single shared ResizeObserver for all Canvas instances.
   *
   * This method is called each time a Canvas registers via observe(), but
   * the observer is only created once (guard clause on line 1). The callback
   * iterates over Canvas._instances — a Set that collects all registered
   * Canvas objects. Since the ResizeObserver callback fires asynchronously
   * (next microtask), all instances are guaranteed to be registered by the
   * time the first resize event is processed, even though observe() is
   * called sequentially during _initCanvas().
   *
   * The observer watches document.documentElement to react to viewport
   * changes (e.g. window resize, devtools toggle). Individual wrappers
   * are added in observe() to also catch container-level layout changes.
   */
  static _initObserver() {
    if (Canvas._observer) return;

    Canvas._observer = new ResizeObserver(() => {
      // is filled with all registered Canvas instances when Canvas.observe() is called the first time (earliest next microtask)
      Canvas._instances.forEach((instance) => instance.resize());
    });

    Canvas._observer.observe(document.documentElement);
  }

  static _destroyObserver() {
    if (Canvas._instances.size > 0) return;

    Canvas._observer?.disconnect();
    Canvas._observer = null;
  }

  constructor(options) {
    options = Object.assign(
      {
        wrapper: null,
        width: null,
        scale: 0.75,
        aspectRatio: 1,
        cssClass: "qp-breakout-canvas",
        onResize: null,
      },
      options,
    );

    this._wrapper = options.wrapper;
    this._onResize = options.onResize;
    this._fixedWidth = options.width;
    this._scale = options.scale;
    this._aspectRatio = options.aspectRatio;
    this._cssClass = options.cssClass;
    this._dpr = window.devicePixelRatio || 1;

    this.el = null;
    this.ctx = null;
    this.width = 0;
    this.height = 0;
    this.valid = !!this._wrapper;
  }

  create() {
    if (!this.valid) return;

    this.el = document.createElement("canvas");
    this.el.classList.add(this._cssClass);
    this._wrapper.appendChild(this.el);
    this.ctx = this.el.getContext("2d");

    this.resize();
  }

  resize() {
    if (!this.valid || !this.el) return;

    const available = this._wrapper.offsetWidth;

    if (this._fixedWidth) {
      this.width = Math.min(this._fixedWidth, available);
    } else {
      this.width = available * this._scale;
    }

    // Limit width so the canvas height fits within 90% of the viewport height
    const maxHeight = window.innerHeight * Canvas.HEIGHT_RATIO;
    const desiredHeight = this.width * this._aspectRatio;

    if (desiredHeight > maxHeight) {
      this.width = maxHeight / this._aspectRatio;
    }

    this.height = this.width * this._aspectRatio;

    this.el.style.width = this.width + "px";
    this.el.style.height = this.height + "px";
    this._wrapper.style.height = this.height + "px";

    this.el.width = this.width * this._dpr;
    this.el.height = this.height * this._dpr;

    this.ctx.setTransform(this._dpr, 0, 0, this._dpr, 0, 0);

    // Call resize callback (if defined)
    if (this._onResize && typeof this._onResize === "function") this._onResize();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  observe() {
    // add to instances Map
    Canvas._instances.add(this);
    // init observer
    Canvas._initObserver();

    // Also observe the wrapper for container-level resizes
    if (this._wrapper) {
      Canvas._observer.observe(this._wrapper);
    }
  }

  disconnect() {
    Canvas._instances.delete(this);
    Canvas._destroyObserver();
  }

  destroy() {
    this.disconnect();
    this.el?.remove();
    this.el = null;
    this.ctx = null;
  }
}
