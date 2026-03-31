export default class Ball {
  constructor(options) {
    options = Object.assign(
      {
        canvasWidth: 480,
        canvasHeight: 320,
        ballRadius: 8,
        speedX: 3,
        speedY: -3,
        ctx: null,
        fill: "#000000",
      },
      options,
    );

    // context
    this.ctx = options.ctx;
    // dimessions
    this.canvasWidth = options.canvasWidth;
    this.canvasHeight = options.canvasHeight;
    // ball
    this.radius = options.ballRadius;
    this.speedX = options.speedX;
    this.speedY = options.speedY;
    // style
    this.fill = options.fill;

    this.reset();
  }

  reset() {
    this.x = this.canvasWidth / 2;
    this.y = this.canvasHeight / 2;
    this.dx = this.speedX;
    this.dy = this.speedY;
  }

  move() {
    // new ball position
    this.x += this.dx;
    this.y += this.dy;

    // collision with wall (left/right) => reverse direction (invert sign)
    if (this.x - this.radius < 0 || this.x + 2 * this.radius > this.canvasWidth) this.dx *= -1;
    // collision with ceiling (top) => reverse direction
    if (this.y - this.radius < 0) this.dy *= -1;
  }

  pos() {
    return {
      x: this.x,
      y: this.y,
    };
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = this.fill;
    this.ctx.fill();
    this.ctx.closePath();
  }
}
