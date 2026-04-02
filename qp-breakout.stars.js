export default class Stars {
  constructor(options) {
    options = Object.assign(
      {
        count: 150,
        canvasWidth: 480,
        canvasHeight: 480,
        ctx: null,
      },
      options,
    );

    this.ctx = options.ctx;
    this.canvasWidth = options.canvasWidth;
    this.canvasHeight = options.canvasHeight;
    this.count = options.count;
    this.stars = [];
  }

  generate() {
    this.stars = [];

    for (let i = 0; i < this.count; i++) {
      this.stars.push({
        x: Math.random() * this.canvasWidth,
        y: Math.random() * this.canvasHeight,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
      });
    }
  }

  draw() {
    for (const star of this.stars) {
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      this.ctx.fill();
      this.ctx.closePath();
    }
  }
}
