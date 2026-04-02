export default class Paddle {
  constructor(options) {
    options = Object.assign(
      {
        canvasWidth: 480,
        canvasHeight: 320,
        paddleWidth: 80,
        paddleHeight: 10,
        speed: 6,
        ctx: null,
      },
      options,
    );

    // context
    this.ctx = options.ctx;
    // dimessions
    this.canvasWidth = options.canvasWidth;
    this.canvasHeight = options.canvasHeight;
    // paddle
    this.width = options.paddleWidth;
    this.height = options.paddleHeight;
    this.x = options.canvasWidth / 2 - this.width / 2;
    this.y = options.canvasHeight - 40;
    // speed / kinetics
    this.speed = options.speed;
    this.dx = 0;
  }

  move() {
    this.x += this.dx;

    // Boundary check
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > this.canvasWidth) {
      this.x = this.canvasWidth - this.width;
    }
  }

  setSpeed(direction = "right", speed) {
    const sign = direction === "right" ? 1 : -1;

    // Set paddle speed (negative for left, positive for right)
    this.dx = sign * (speed !== undefined ? speed : this.speed);
  }

  draw() {
    this.ctx.fillStyle = "#e0e0e0";
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
