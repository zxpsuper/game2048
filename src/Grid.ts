import Tile, { Position } from './Tile'

type Cell = Tile[][]

export default class Grid {
  // 多少格子
  public size: number
  public cells: Cell

  constructor(size: number, previousState?) {
    this.size = size
    this.cells = previousState ? this.fromState(previousState) : this.empty()
  }

  /**获取 cell 内容 */
  cellContent(position: Position) {
    if (this.withinBounds(position)) {
      return this.cells[position.x][position.y]
    } else {
      return null
    }
  }

  /**是否在范围之内 */
  withinBounds(position: Position) {
    return (
      position.x >= 0 &&
      position.x < this.size &&
      position.y >= 0 &&
      position.y < this.size
    )
  }

  /**格子是否被占有了 */
  cellOccupied(position: Position) {
    return !!this.cellContent(position)
  }

  removeTile(position: Position) {
    this.cells[position.x][position.y] = null;
  }

  /**格子是否可用 */
  cellAvailable(position: Position) {
    return !this.cellOccupied(position);
  }

  /** 获取 cellState[]*/
  serialize() {
    const cellState = []
    for (let x = 0; x < this.size; x++) {
      let row = (cellState[x] = [])

      for (let y = 0; y < this.size; y++) {
        row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null)
      }
    }
    return {
      size: this.size,
      cells: cellState
    }
  }
  /**是否存在可用的格子 */
  cellsAvailable() {
    return !!this.availableCells().length
  }

  /**插入数字格 */
  insertTile(tile: Tile) {
    this.cells[tile.x][tile.y] = tile
  }

  /**根据之前保存的 state 充值 cells */
  public fromState(state) {
    let cells = []
    for (let x = 0; x < this.size; x++) {
      let row = (cells[x] = [])
      for (let y = 0; y < this.size; y++) {
        let tile = state[x][y]
        row.push(tile ? new Tile(tile.position, tile.value) : null)
      }
    }
    return cells
  }

  /**返回空 cells */
  public empty() {
    let cells = []
    for (let x = 0; x < this.size; x++) {
      let row = (cells[x] = [])
      for (let y = 0; y < this.size; y++) {
        row.push(null)
      }
    }
    return cells
  }

  /**获取一个随机未放置的格子 */
  public randomAvailableCell() {
    let cells = this.availableCells()

    if (cells.length) {
      return cells[Math.floor(Math.random() * cells.length)]
    }
  }

  /**找到所有没有 tile 的格子 */
  public availableCells() {
    let cells = []

    this.eachCell(function (x, y, tile) {
      if (!tile) {
        cells.push({ x: x, y: y })
      }
    })

    return cells
  }

  /**操作每个格子 */
  public eachCell(callback: (x: number, y: number, tile: Tile) => void) {
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        callback(x, y, this.cells[x][y])
      }
    }
  }
}
