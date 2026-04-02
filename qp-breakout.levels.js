/**
 * Level definitions and brick type configuration for QPBreakout.
 *
 * Brick types map numeric IDs (used in layout grids) to visual and gameplay
 * properties. Layouts are 2D arrays where each number references a brick type:
 *   0 = empty cell
 *   1–6 = single-hit bricks (ascending score)
 *   7 = silver brick (2 hits)
 *   8 = gold brick (3 hits)
 */

export const BRICK_TYPES = {
  0: null,
  1: { color: "rgba(255, 193, 7, 0.9)", score: 10, hits: 1 }, // yellow
  2: { color: "rgba(255, 153, 0, 0.9)", score: 15, hits: 1 }, // orange
  3: { color: "rgba(220, 53, 69, 0.9)", score: 20, hits: 1 }, // red
  4: { color: "rgba(25, 135, 84, 0.9)", score: 25, hits: 1 }, // green
  5: { color: "rgba(13, 110, 253, 0.9)", score: 30, hits: 1 }, // blue
  6: { color: "rgba(102, 16, 242, 0.9)", score: 50, hits: 1 }, // purple
  7: { color: "rgba(108, 117, 125, 0.9)", score: 40, hits: 2 }, // silver (2 hits)
  8: { color: "rgba(255, 215, 0, 0.9)", score: 75, hits: 3 }, // gold (3 hits)
};

export const LEVELS = [
  // Level 1: Classic — full grid (matches original behavior)
  {
    name: "Classic",
    score: 100,
    layout: [
      [6, 6, 6, 6, 6, 6, 6, 6],
      [5, 5, 5, 5, 5, 5, 5, 5],
      [4, 4, 4, 4, 4, 4, 4, 4],
      [3, 3, 3, 3, 3, 3, 3, 3],
    ],
  },

  // Level 2: Checkerboard pattern
  {
    name: "Checkerboard",
    score: 150,
    layout: [
      [5, 0, 5, 0, 5, 0, 5, 0],
      [0, 4, 0, 4, 0, 4, 0, 4],
      [3, 0, 3, 0, 3, 0, 3, 0],
      [0, 2, 0, 2, 0, 2, 0, 2],
      [1, 0, 1, 0, 1, 0, 1, 0],
    ],
  },

  // Level 3: Diamond shape
  {
    name: "Diamond",
    score: 200,
    layout: [
      [0, 0, 0, 6, 6, 0, 0, 0],
      [0, 0, 5, 5, 5, 5, 0, 0],
      [0, 4, 4, 4, 4, 4, 4, 0],
      [3, 3, 3, 3, 3, 3, 3, 3],
      [0, 2, 2, 2, 2, 2, 2, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
    ],
  },

  // Level 4: Fortress — with multi-hit bricks
  {
    name: "Fortress",
    score: 250,
    layout: [
      [7, 7, 7, 8, 8, 7, 7, 7],
      [6, 0, 0, 0, 0, 0, 0, 6],
      [5, 0, 7, 0, 0, 7, 0, 5],
      [4, 0, 0, 0, 0, 0, 0, 4],
      [3, 3, 3, 3, 3, 3, 3, 3],
    ],
  },

  // Level 5: Stripes — horizontal gaps
  {
    name: "Stripes",
    score: 300,
    layout: [
      [6, 6, 6, 6, 6, 6, 6, 6],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [4, 4, 4, 4, 4, 4, 4, 4],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [2, 2, 2, 2, 2, 2, 2, 2],
    ],
  },

  // Level 6: Random
  {
    name: "Random",
    score: 500,
    random: { rows: 5, cols: 8, fillRatio: 0.6, maxType: 6 },
  },
];

export default LEVELS;
