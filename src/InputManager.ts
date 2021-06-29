const map = {
  38: 0, // Up
  39: 1, // Right
  40: 2, // Down
  37: 3, // Left
  75: 0, // Vim up
  76: 1, // Vim right
  74: 2, // Vim down
  72: 3, // Vim left
  87: 0, // W
  68: 1, // D
  83: 2, // S
  65: 3 // A
}

export default class InputManager {
  public events = {}
  public eventTouchstart: string
  public eventTouchmove: string
  public eventTouchend: string
  constructor() {
    if (window.navigator.msPointerEnabled) {
      // 兼容 ie 10
      this.eventTouchstart = 'MSPointerDown'
      this.eventTouchmove = 'MSPointerMove'
      this.eventTouchend = 'MSPointerUp'
    } else {
      this.eventTouchstart = 'touchstart'
      this.eventTouchmove = 'touchmove'
      this.eventTouchend = 'touchend'
    }
    this.listen()
  }

  /**
   * 事件发布
   * @param event 事件类型
   * @param data 数据
   */
  public emit(event: string, data?: any) {
    var callbacks = this.events[event]
    if (callbacks) {
      callbacks.forEach(function (callback) {
        callback(data)
      })
    }
  }

  /**
   * 事件订阅
   * @param event 
   * @param callback 
   */
  public on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  /**
   * 键盘事件监听
   */
  public listen() {
    const self = this
    // 监听键盘上下左右事件
    document.addEventListener('keydown', function (event) {
      var modifiers =
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey
      var mapped = map[event.key]
      // 0上，1右，2下，3左
      if (!modifiers) {
        if (mapped !== undefined) {
          event.preventDefault()
          self.emit('move', mapped)
        }
      }

      // 点击 R 重新开始
      if (!modifiers && event.which === 82) {
        self.restart.call(self, event)
      }
    })

    // 绑定页面几个按钮点击事件
    this.bindButtonPress('.retry-button', this.restart)
    this.bindButtonPress('.restart-button', this.restart)
    this.bindButtonPress('.keep-playing-button', this.keepPlaying)

    // Respond to swipe events
    let touchStartClientX: number, touchStartClientY: number
    const gameContainer = document.getElementsByClassName('game-container')[0]

    gameContainer.addEventListener(this.eventTouchstart, function (event: any) {
      if (
        (!window.navigator.msPointerEnabled && event.touches.length > 1) ||
        event.targetTouches.length > 1
      ) {
        // 忽略多手指触碰事件
        return 
      }

      if (window.navigator.msPointerEnabled) {
        touchStartClientX = event.pageX
        touchStartClientY = event.pageY
      } else {
        touchStartClientX = event.touches[0].clientX
        touchStartClientY = event.touches[0].clientY
      }

      event.preventDefault()
    })

    gameContainer.addEventListener(this.eventTouchmove, function (event) {
      event.preventDefault()
    })

    gameContainer.addEventListener(this.eventTouchend, function (event: any) {
      if (
        (!window.navigator.msPointerEnabled && event.touches.length > 0) ||
        event.targetTouches.length > 0
      ) {
        return // Ignore if still touching with one or more fingers
      }

      let touchEndClientX: number, touchEndClientY: number

      if (window.navigator.msPointerEnabled) {
        touchEndClientX = event.pageX
        touchEndClientY = event.pageY
      } else {
        touchEndClientX = event.changedTouches[0].clientX
        touchEndClientY = event.changedTouches[0].clientY
      }

      const dx = touchEndClientX - touchStartClientX
      const absDx = Math.abs(dx)

      const dy = touchEndClientY - touchStartClientY
      const absDy = Math.abs(dy)

      if (Math.max(absDx, absDy) > 10) {
        // (right : left) : (down : up)
        self.emit('move', absDx > absDy ? (dx > 0 ? 1 : 3) : dy > 0 ? 2 : 0)
      }
    })
  }

  /**发布重新开始消息 */
  public restart(event: Event) {
    event.preventDefault()
    this.emit('restart')
  }

  /**继续游戏 */
  public keepPlaying(event: Event) {
    event.preventDefault()
    this.emit('keepPlaying')
  }

  /**
   * 绑定按钮事件
   * @param selector 选择器
   * @param fn 
   */
  public bindButtonPress(selector: string, fn: Function) {
    const button = document.querySelector(selector)
    button.addEventListener('click', fn.bind(this))
    button.addEventListener(this.eventTouchend, fn.bind(this))
  }
}
