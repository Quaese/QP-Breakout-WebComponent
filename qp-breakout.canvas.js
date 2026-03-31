export default class Canvas {
  constructor(options) {
    options = Object.assign(
      {
        wrapper: null,
        width: null,
        scale: 0.75,
        aspectRatio: 1,
        cssClass: "qp-breakout-canvas",
      },
      options,
    );

    this._wrapper = options.wrapper;
    this._fixedWidth = options.width;
    this._scale = options.scale;
    this._aspectRatio = options.aspectRatio;
    this._cssClass = options.cssClass;
    this._dpr = window.devicePixelRatio || 1;
    this._observer = null;

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

    this.height = this.width * this._aspectRatio;

    this.el.style.width = this.width + "px";
    this.el.style.height = this.height + "px";
    this._wrapper.style.height = this.height + "px";

    this.el.width = this.width * this._dpr;
    this.el.height = this.height * this._dpr;

    this.ctx.setTransform(this._dpr, 0, 0, this._dpr, 0, 0);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  observe() {
    this._observer = new ResizeObserver(() => this.resize());
    this._observer.observe(this._wrapper);
  }

  disconnect() {
    this._observer?.disconnect();
    this._observer = null;
  }

  destroy() {
    this.disconnect();
    this.el?.remove();
    this.el = null;
    this.ctx = null;
  }
}
