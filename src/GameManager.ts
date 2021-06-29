import InputManager from './InputManager'
import StorageManager from './StorageManager'
import HTMLActuator from './HTMLActuator'
import Grid from './Grid' // 格子
import Tile from './Tile' // 块
import { Position } from './Tile'

export default class GameManager {
  /**格子数量 n * n */
  public size = 4
  /**格子[] */
  public grid: Grid
  /**得分 */
  public score: number
  /*初始块个数 */
  public startTiles = 2
  /**事件管理器 */
  public inputManager: InputManager
  public storageManager: StorageManager
  /**结束 */
  public over: boolean = false
  /**胜利 */
  public won: boolean = false
  /**游戏中 */
  public isKeepPlaying: boolean = false
  /**html执行器 */
  public actuator: HTMLActuator
  constructor() {
    this.storageManager = new StorageManager()
    /**发布订阅器监听事件，触发相应的行为 */
    this.inputManager = new InputManager()
    this.inputManager.on('move', this.move.bind(this))
    this.inputManager.on('restart', this.restart.bind(this))
    this.inputManager.on('keepPlaying', this.keepPlaying.bind(this))
    /**执行器，用于数据操作后执行，修改dom */
    this.actuator = new HTMLActuator()
    this.setup()
  }
  /**游戏是否结束了 */
  get isGameTerminated() {
    return this.over || (this.won && !this.isKeepPlaying)
  }
  /**块移动坐标增量 */
  getVector(direction: number) {
    const map = {
      0: { x: 0, y: -1 }, // Up
      1: { x: 1, y: 0 }, // Right
      2: { x: 0, y: 1 }, // Down
      3: { x: -1, y: 0 } // Left
    }
    return map[direction]
  }

  /**获取一个遍历顺序的数组，从左往右，从右往左，从上到下，从下到上 */
  public buildTraversals(vector: Position) {
    var traversals = { x: [], y: [] }

    for (var pos = 0; pos < this.size; pos++) {
      traversals.x.push(pos)
      traversals.y.push(pos)
    }
    // 根据 vector 进行方向调转
    if (vector.x === 1) traversals.x = traversals.x.reverse()
    if (vector.y === 1) traversals.y = traversals.y.reverse()
    return traversals
  }

  /**Tile 准备工作*/
  prepareTiles() {
    this.grid.eachCell(function (_, __, tile) {
      if (tile) {
        tile.mergedFrom = null
        tile.savePosition()
      }
    })
  }
  /**获取块合并前移动的最终位置， 以及下一个位置 */
  public findFarthestPosition(cell: Position, vector: Position) {
    let previous: Position
    do {
      previous = cell
      cell = { x: previous.x + vector.x, y: previous.y + vector.y }
    } while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell))

    return {
      farthest: previous,
      next: cell
    }
  }
  public move(direction: number) {
    // 0: up, 1: right, 2: down, 3: left
    var self = this
    // 游戏结束的话不做任何操作
    if (this.isGameTerminated) return

    let cell: Position, tile: Tile
    // 根据方向选择下一步的位置增量
    let vector = this.getVector(direction)
    // 根据方向生成遍历方向数组 {x:[], y: []}
    let traversals = this.buildTraversals(vector)
    // 默认没有移动
    let moved = false

    // 保存当前 tile 位置信息，移除 merger 信息
    this.prepareTiles()

    traversals.x.forEach(function (x) {
      traversals.y.forEach(function (y) {
        cell = { x: x, y: y }
        tile = self.grid.cellContent(cell)
        // 如果块存在
        if (tile) {
          let positions = self.findFarthestPosition(cell, vector)
          let next = self.grid.cellContent(positions.next)

          // 值相同的两个块才允许合并
          if (next && next.value === tile.value && !next.mergedFrom) {
            let merged = new Tile(positions.next, tile.value * 2)
            merged.mergedFrom = [tile, next]
            // 插入合并后的新块
            self.grid.insertTile(merged)
            // 移除旧块
            self.grid.removeTile(tile)
            tile.updatePosition(positions.next)
            console.log(self)

            // 更新分数
            self.score += merged.value

            // 如果合成分数为 2048， 则游戏获胜
            if (merged.value === 2048) self.won = true
          } else {
            self.moveTile(tile, positions.farthest)
          }
          // 判断是否移动了
          if (!self.positionsEqual(cell, tile)) {
            moved = true
          }
        }
      })
    })
    // 若是移动了，则增加一个随机块
    if (moved) {
      this.addRandomTile()

      if (!this.movesAvailable()) {
        this.over = true // Game over!
      }

      this.actuate()
    }
  }

  /**是否没有可用的格子且没法合并移动，是则游戏结束 */
  public movesAvailable() {
    return this.grid.cellsAvailable() || this.tileMatchesAvailable()
  }

  /**遍历判断每一个块上下左右是否存在一样的块进行合并 */
  public tileMatchesAvailable() {
    var self = this

    var tile: Tile

    for (var x = 0; x < this.size; x++) {
      for (var y = 0; y < this.size; y++) {
        tile = this.grid.cellContent({ x: x, y: y })

        if (tile) {
          for (var direction = 0; direction < 4; direction++) {
            var vector = self.getVector(direction)
            var cell = { x: x + vector.x, y: y + vector.y }

            var other = self.grid.cellContent(cell)

            if (other && other.value === tile.value) {
              return true // These two tiles can be merged
            }
          }
        }
      }
    }

    return false
  }

  /**判断前后位置是否一致 */
  public positionsEqual(first: Position, second: Position) {
    return first.x === second.x && first.y === second.y
  }

  /**重新开始 */
  public restart() {
    this.storageManager.clearGameState()
    this.actuator.continueGame() // Clear the game won/lost message
    this.setup()
  }

  /**继续游戏 */
  public keepPlaying() {
    this.isKeepPlaying = true
    this.actuator.continueGame() // 清理游戏结果数据，继续游戏
  }
  
  /**设置初始化 */
  public setup() {
    const previousState = this.storageManager.getGameState()
    // 重新加载之前的游戏状态
    if (previousState) {
      this.grid = new Grid(previousState.grid.size, previousState.grid.cells) // Reload grid
      this.score = previousState.score
      this.over = previousState.over
      this.won = previousState.won
      this.isKeepPlaying = previousState.keepPlaying
    } else {
      this.grid = new Grid(this.size)
      this.score = 0
      this.over = false
      this.won = false
      this.isKeepPlaying = false
      // 初始化是两个 tile
      this.addStartTiles()
    }

    // Update the actuator
    this.actuate()
  }
  public addStartTiles() {
    for (var i = 0; i < this.startTiles; i++) {
      this.addRandomTile()
    }
  }
  /**增加随机块 */
  public addRandomTile() {
    if (this.grid.cellsAvailable()) {
      var value = Math.random() < 0.9 ? 2 : 4
      var tile = new Tile(this.grid.randomAvailableCell(), value)

      this.grid.insertTile(tile)
    }
  }
  /**获取游戏数据 */
  public serialize() {
    return {
      grid: this.grid.serialize(),
      score: this.score,
      over: this.over,
      won: this.won,
      keepPlaying: this.isKeepPlaying
    }
  }
  /**执行 */
  public actuate() {
    if (this.storageManager.getBestScore() < this.score) {
      this.storageManager.setBestScore(this.score)
    }

    // Clear the state when the game is over (game over only, not win)
    if (this.over) {
      this.storageManager.clearGameState()
    } else {
      this.storageManager.setGameState(this.serialize())
    }

    this.actuator.actuate(this.grid, {
      score: this.score,
      over: this.over,
      won: this.won,
      bestScore: this.storageManager.getBestScore(),
      terminated: this.isGameTerminated
    })
  }

  /**移动 tile 到某个位置 */
  public moveTile(tile: Tile, position: Position) {
    this.grid.cells[tile.x][tile.y] = null
    this.grid.cells[position.x][position.y] = tile
    tile.updatePosition(position)
  }
}
