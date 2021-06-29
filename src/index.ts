import GameManager from './GameManager'
import './index.scss'
window.requestAnimationFrame(function () {
  ;(window as any).game = new GameManager();
  console.log((window as any).game);
})
