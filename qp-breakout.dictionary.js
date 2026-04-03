const Dictionary = (args) => ({
  funBreakoutStart: { de: "Start", en: "Start" },
  funBreakoutStop: { de: "Stop", en: "Stop" },
  funBreakoutPause: { de: "Pause", en: "Pause" },
  funBreakoutGameOver: { de: "Game Over", en: "Game Over" },
  scoreboardSize: {
    de: `Spalten: ${args[0]}, Reihen: ${args[1]}`,
    en: `Cols: ${args[0]}, Rows: ${args[1]}`,
  },
  scoreboardScore: { de: `Punkte: ${args[0]}`, en: `Score: ${args[0]}` },
  scoreboardSpeed: { de: `Speed: ${args[0]}`, en: `Speed: ${args[0]}` },
  scoreboardLevel: { de: `Level: ${args[0]}`, en: `Level: ${args[0]}` },
  scoreboardLives: { de: `Leben: ${args[0]}`, en: `Lives: ${args[0]}` },
  scoreboardRemainingBricks: { de: `Bricks: ${args[0]}`, en: `Bricks: ${args[0]}` },
  scoreboardState_waiting: { de: `Bereit`, en: `Ready` },
  scoreboardState_paused: { de: `Pausiert`, en: `Paused` },
  scoreboardState_running: { de: `Running`, en: `Running` },
  scoreboardState_stopped: { de: `Stop`, en: `Stopped` },
});

const Languages = ["de", "en"];

export default Dictionary;
export { Languages };
