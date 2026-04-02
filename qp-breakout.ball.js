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
        fill: "#ffb347",
        // fill: "#ff9933",
        image: null,
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
    this.image = options.image;

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

    // collision with left wall (moving left)
    if (this.dx < 0 && this.x - this.radius < 0) this.dx *= -1;
    // collision with right wall (moving right)
    if (this.dx > 0 && this.x + this.radius > this.canvasWidth) this.dx *= -1;
    // collision with ceiling (moving up)
    if (this.dy < 0 && this.y - this.radius < 0) this.dy *= -1;
  }

  pos() {
    return {
      x: this.x,
      y: this.y,
    };
  }

  draw() {
    if (this.image) {
      const size = this.radius * 2;
      this.ctx.drawImage(this.image, this.x - this.radius, this.y - this.radius, size, size);
    } else {
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = this.fill;
      this.ctx.fill();
      this.ctx.closePath();
    }
  }
}
