/**位置 */
export type Position = {
  x: number
  y: number
}

export default class Tile {
  public x: number
  public y: number
  public value: number
  /**先前位置 */
  public previousPosition?: Position | null
  public mergedFrom: Tile[]

  constructor(position: Position, value: number) {
    this.x = position.x
    this.y = position.y
    this.value = value || 2
    this.previousPosition = null
    this.mergedFrom = null // Tracks tiles that merged together
  }

  /**保存操作前位置 */
  public savePosition() {
    this.previousPosition = { x: this.x, y: this.y }
  }

  /**更新位置 */
  public updatePosition(position: Position) {
    this.x = position.x
    this.y = position.y
  }

  /**获取值与位置 */
  public serialize() {
    return {
      position: {
        x: this.x,
        y: this.y
      },
      value: this.value
    }
  }
}
