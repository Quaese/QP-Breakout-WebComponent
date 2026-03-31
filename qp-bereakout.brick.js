export default class Brick {
  constructor(options) {
    options = Object.assign(
      {
        width: 50,
        height: 8,
        x: 0,
        y: 0,
        fill: "orange",
        ctx: null,
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
    this.visible = true;
  }

  draw() {
    if (!this.visible) return;

    this.ctx.fillStyle = this.fill;
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
