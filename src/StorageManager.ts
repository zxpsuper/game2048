;(window as any).fakeStorage = {
  _data: {},

  setItem: function (id: string, val: string) {
    return (this._data[id] = String(val))
  },

  getItem: function (id: string) {
    return this._data.hasOwnProperty(id) ? this._data[id] : undefined
  },

  removeItem: function (id: string) {
    return delete this._data[id]
  },

  clear: function () {
    return (this._data = {})
  }
}
/**
 * 是否支持 localStorage
 * @returns 
 */
function localStorageSupported(): boolean {
  const testKey = 'test'
  const storage = window.localStorage

  try {
    storage.setItem(testKey, '1')
    storage.removeItem(testKey)
    return true
  } catch (error) {
    return false
  }
}

export default class StorageManager {
  public bestScoreKey = 'bestScore'
  public gameStateKey = 'gameState'
  public storage: Storage

  constructor() {
    this.storage = localStorageSupported() ? window.localStorage : (window as any).fakeStorage;
  }

  /**获取历史最高分 */
  public getBestScore() {
    return this.storage.getItem(this.bestScoreKey) || 0;
  }

  /**设置最高分 */
  public setBestScore(score: number) {
    this.storage.setItem(this.bestScoreKey, String(score));
  }

  /**获取游戏状态 */
  public getGameState() {
    const stateJSON = this.storage.getItem(this.gameStateKey);
    return stateJSON ? JSON.parse(stateJSON) : null;
  }

  /**设置游戏状态 */
  public setGameState(gameState) {
    this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
  }

  /**清除游戏状态 */
  public clearGameState() {
    this.storage.removeItem(this.gameStateKey);
  }
}
