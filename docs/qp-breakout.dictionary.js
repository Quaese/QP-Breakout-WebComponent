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
  screenInitTitle: { de: `QP Breakout`, en: `QP Breakout` },
  screenInitText: { de: `Start drücken oder Leertaste`, en: `Press start or space to play` },
  screenWaitingTitle: { de: `Breakout`, en: `Breakout` },
  screenWaitingText: {
    de: `Pfeiltasten links und rechts zum Bewegen`,
    en: `Use Arrow keys left and right to move`,
  },
  screenWaitingAction: { de: `Leertaste zum Starten`, en: `Press space to start` },
  screenPausedTitle: { de: `Pausiert`, en: `Paused` },
  screenPausedText: { de: `Leertaste zum Fortsetzen`, en: `Press space to resume` },
  screenLevel: { de: `Level: ${args[0]}`, en: `Level: ${args[0]}` },
  screenCompleteTitle: { de: `Level geschafft`, en: `Level Complete` },
  screenCompleteScore: { de: `Punkte: ${args[0]}`, en: `Score: ${args[0]}` },
  screenCompleteText: { de: `Leertaste zum Weiterspielen`, en: `Press space to continue` },
  screenGameoverTitle: { de: `Game Over`, en: `Game Over` },
  screenGameoverText: {
    de: `Start oder Leertaste drücken zum Neustarten`,
    en: `Press start or space to restart`,
  },
  screenRemainingLives: { de: `Leben: ${args[0]}`, en: `Lives: ${args[0]}` },
  scoreboardState_init: { de: `QP Breakout`, en: `QP Breakout` },
  scoreboardState_waiting: { de: `Bereit`, en: `Ready` },
  scoreboardState_complete: { de: `Level geschafft`, en: `Level Complete` },
  scoreboardState_paused: { de: `Pausiert`, en: `Paused` },
  scoreboardState_running: { de: `Running`, en: `Running` },
  scoreboardState_stopped: { de: `Stop`, en: `Stopped` },
});

const Languages = ["de", "en"];

export default Dictionary;
export { Languages };
