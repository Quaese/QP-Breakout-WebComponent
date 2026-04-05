export default class Brick {
  constructor(options) {
    options = Object.assign(
      {
        width: 50,
        height: 8,
        x: 0,
        y: 0,
        fill: "orange",
        score: 10,
        hits: 1,
        ctx: null,
        image: null,
      },
      options,
    );

    // context
    this.ctx = options.ctx;
    // brick position
    this.x = options.x;
    this.y = options.y;
    // brick dimensions
    this.width = options.width;
    this.height = options.height;
    // brick ui
    this.fill = options.fill;
    this.score = options.score;
    // style
    this.image = options.image;
    // multi-hit
    this.hits = options.hits;
    this.maxHits = options.hits;
    this.visible = true;
  }

  /**
   * Register a hit on this brick.
   * @returns {boolean} true if the brick was destroyed (hits reached 0)
   */
  hit() {
    if (!this.visible) return false;

    this.hits--;

    if (this.hits <= 0) {
      this.visible = false;
      return true;
    }

    return false;
  }

  draw() {
    if (!this.visible) return;

    if (this.image) {
      // Multi-hit visual feedback: reduce opacity as hits decrease
      if (this.maxHits > 1) {
        const ratio = this.hits / this.maxHits;
        this.ctx.globalAlpha = 0.4 + 0.5 * ratio;
      }

      this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);

      if (this.maxHits > 1) {
        this.ctx.globalAlpha = 1.0;
      }
    } else {
      // Multi-hit visual feedback: reduce opacity as hits decrease
      if (this.maxHits > 1) {
        const ratio = this.hits / this.maxHits;
        const alpha = 0.4 + 0.5 * ratio;
        this.ctx.fillStyle = this.fill.replace(/[\d.]+\)$/, `${alpha})`);
      } else {
        this.ctx.fillStyle = this.fill;
      }

      this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}
