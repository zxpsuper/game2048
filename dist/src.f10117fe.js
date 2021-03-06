// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"src/InputManager.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var map = {
  38: 0,
  39: 1,
  40: 2,
  37: 3,
  75: 0,
  76: 1,
  74: 2,
  72: 3,
  87: 0,
  68: 1,
  83: 2,
  65: 3 // A

};

var InputManager =
/** @class */
function () {
  function InputManager() {
    this.events = {};

    if (window.navigator.msPointerEnabled) {
      // ?????? ie 10
      this.eventTouchstart = 'MSPointerDown';
      this.eventTouchmove = 'MSPointerMove';
      this.eventTouchend = 'MSPointerUp';
    } else {
      this.eventTouchstart = 'touchstart';
      this.eventTouchmove = 'touchmove';
      this.eventTouchend = 'touchend';
    }

    this.listen();
  }
  /**
   * ????????????
   * @param event ????????????
   * @param data ??????
   */


  InputManager.prototype.emit = function (event, data) {
    var callbacks = this.events[event];

    if (callbacks) {
      callbacks.forEach(function (callback) {
        callback(data);
      });
    }
  };
  /**
   * ????????????
   * @param event
   * @param callback
   */


  InputManager.prototype.on = function (event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event].push(callback);
  };
  /**
   * ??????????????????
   */


  InputManager.prototype.listen = function () {
    var self = this; // ??????????????????????????????

    document.addEventListener('keydown', function (event) {
      var modifiers = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
      var mapped = map[event.key]; // 0??????1??????2??????3???

      if (!modifiers) {
        if (mapped !== undefined) {
          event.preventDefault();
          self.emit('move', mapped);
        }
      } // ?????? R ????????????


      if (!modifiers && event.which === 82) {
        self.restart.call(self, event);
      }
    }); // ????????????????????????????????????

    this.bindButtonPress('.retry-button', this.restart);
    this.bindButtonPress('.restart-button', this.restart);
    this.bindButtonPress('.keep-playing-button', this.keepPlaying); // Respond to swipe events

    var touchStartClientX, touchStartClientY;
    var gameContainer = document.getElementsByClassName('game-container')[0];
    gameContainer.addEventListener(this.eventTouchstart, function (event) {
      if (!window.navigator.msPointerEnabled && event.touches.length > 1 || event.targetTouches.length > 1) {
        // ???????????????????????????
        return;
      }

      if (window.navigator.msPointerEnabled) {
        touchStartClientX = event.pageX;
        touchStartClientY = event.pageY;
      } else {
        touchStartClientX = event.touches[0].clientX;
        touchStartClientY = event.touches[0].clientY;
      }

      event.preventDefault();
    });
    gameContainer.addEventListener(this.eventTouchmove, function (event) {
      event.preventDefault();
    });
    gameContainer.addEventListener(this.eventTouchend, function (event) {
      if (!window.navigator.msPointerEnabled && event.touches.length > 0 || event.targetTouches.length > 0) {
        return; // Ignore if still touching with one or more fingers
      }

      var touchEndClientX, touchEndClientY;

      if (window.navigator.msPointerEnabled) {
        touchEndClientX = event.pageX;
        touchEndClientY = event.pageY;
      } else {
        touchEndClientX = event.changedTouches[0].clientX;
        touchEndClientY = event.changedTouches[0].clientY;
      }

      var dx = touchEndClientX - touchStartClientX;
      var absDx = Math.abs(dx);
      var dy = touchEndClientY - touchStartClientY;
      var absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) > 10) {
        // (right : left) : (down : up)
        self.emit('move', absDx > absDy ? dx > 0 ? 1 : 3 : dy > 0 ? 2 : 0);
      }
    });
  };
  /**???????????????????????? */


  InputManager.prototype.restart = function (event) {
    event.preventDefault();
    this.emit('restart');
  };
  /**???????????? */


  InputManager.prototype.keepPlaying = function (event) {
    event.preventDefault();
    this.emit('keepPlaying');
  };
  /**
   * ??????????????????
   * @param selector ?????????
   * @param fn
   */


  InputManager.prototype.bindButtonPress = function (selector, fn) {
    var button = document.querySelector(selector);
    button.addEventListener('click', fn.bind(this));
    button.addEventListener(this.eventTouchend, fn.bind(this));
  };

  return InputManager;
}();

exports.default = InputManager;
},{}],"src/StorageManager.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
;
window.fakeStorage = {
  _data: {},
  setItem: function setItem(id, val) {
    return this._data[id] = String(val);
  },
  getItem: function getItem(id) {
    return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
  },
  removeItem: function removeItem(id) {
    return delete this._data[id];
  },
  clear: function clear() {
    return this._data = {};
  }
};
/**
 * ???????????? localStorage
 * @returns
 */

function localStorageSupported() {
  var testKey = 'test';
  var storage = window.localStorage;

  try {
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

var StorageManager =
/** @class */
function () {
  function StorageManager() {
    this.bestScoreKey = 'bestScore';
    this.gameStateKey = 'gameState';
    this.storage = localStorageSupported() ? window.localStorage : window.fakeStorage;
  }
  /**????????????????????? */


  StorageManager.prototype.getBestScore = function () {
    return this.storage.getItem(this.bestScoreKey) || 0;
  };
  /**??????????????? */


  StorageManager.prototype.setBestScore = function (score) {
    this.storage.setItem(this.bestScoreKey, String(score));
  };
  /**?????????????????? */


  StorageManager.prototype.getGameState = function () {
    var stateJSON = this.storage.getItem(this.gameStateKey);
    return stateJSON ? JSON.parse(stateJSON) : null;
  };
  /**?????????????????? */


  StorageManager.prototype.setGameState = function (gameState) {
    this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
  };
  /**?????????????????? */


  StorageManager.prototype.clearGameState = function () {
    this.storage.removeItem(this.gameStateKey);
  };

  return StorageManager;
}();

exports.default = StorageManager;
},{}],"src/HTMLActuator.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * html dom ?????????
 */

var HTMLActuator =
/** @class */
function () {
  function HTMLActuator() {
    this.tileContainer = document.querySelector('.tile-container');
    this.scoreContainer = document.querySelector('.score-container');
    this.bestContainer = document.querySelector('.best-container');
    this.messageContainer = document.querySelector('.game-message');
    this.score = 0;
  }

  HTMLActuator.prototype.actuate = function (grid, metadata) {
    var self = this;
    window.requestAnimationFrame(function () {
      self.clearContainer(self.tileContainer);
      grid.cells.forEach(function (column) {
        column.forEach(function (cell) {
          if (cell) {
            self.addTile(cell);
          }
        });
      });
      self.updateScore(metadata.score);
      self.updateBestScore(metadata.bestScore);

      if (metadata.terminated) {
        if (metadata.over) {
          self.message(false); // You lose
        } else if (metadata.won) {
          self.message(true); // You win!
        }
      }
    });
  };
  /**??????????????????????????? */


  HTMLActuator.prototype.message = function (won) {
    var type = won ? 'game-won' : 'game-over';
    var message = won ? 'You win!' : 'Game over!';
    this.messageContainer.classList.add(type);
    this.messageContainer.getElementsByTagName('p')[0].textContent = message;
  };
  /**???????????? */


  HTMLActuator.prototype.updateScore = function (score) {
    this.clearContainer(this.scoreContainer);
    var difference = score - this.score;
    this.score = score;
    this.scoreContainer.textContent = String(this.score);

    if (difference > 0) {
      var addition = document.createElement('div');
      addition.classList.add('score-addition');
      addition.textContent = '+' + difference;
      this.scoreContainer.appendChild(addition);
    }
  };
  /**?????????????????? */


  HTMLActuator.prototype.updateBestScore = function (bestScore) {
    this.bestContainer.textContent = String(bestScore);
  };
  /**???????????? */


  HTMLActuator.prototype.clearContainer = function (container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  };
  /**???????????????????????????0.0????????????????????????1.1????????????????????????1*/


  HTMLActuator.prototype.normalizePosition = function (position) {
    return {
      x: position.x + 1,
      y: position.y + 1
    };
  };
  /**?????????????????? */


  HTMLActuator.prototype.positionClass = function (position) {
    position = this.normalizePosition(position);
    return 'tile-position-' + position.x + '-' + position.y;
  };
  /**????????????????????? */


  HTMLActuator.prototype.applyClasses = function (element, classes) {
    element.setAttribute('class', classes.join(' '));
  };

  ;

  HTMLActuator.prototype.addTile = function (tile) {
    var self = this;
    var wrapper = document.createElement('div');
    var inner = document.createElement('div');
    var position = tile.previousPosition || {
      x: tile.x,
      y: tile.y
    };
    var positionClass = this.positionClass(position);
    var classes = ['tile', 'tile-' + tile.value, positionClass];
    if (tile.value > 2048) classes.push('tile-super');
    this.applyClasses(wrapper, classes);
    inner.classList.add('tile-inner');
    inner.textContent = String(tile.value);

    if (tile.previousPosition) {
      // Make sure that the tile gets rendered in the previous position first
      window.requestAnimationFrame(function () {
        classes[2] = self.positionClass({
          x: tile.x,
          y: tile.y
        });
        self.applyClasses(wrapper, classes); // Update the position
      });
    } else if (tile.mergedFrom) {
      classes.push('tile-merged');
      this.applyClasses(wrapper, classes); // Render the tiles that merged

      tile.mergedFrom.forEach(function (merged) {
        self.addTile(merged);
      });
    } else {
      classes.push('tile-new');
      this.applyClasses(wrapper, classes);
    } // Add the inner part of the tile to the wrapper


    wrapper.appendChild(inner); // Put the tile on the board

    this.tileContainer.appendChild(wrapper);
  };
  /**???????????? */


  HTMLActuator.prototype.continueGame = function () {
    this.clearMessage();
  };
  /**?????????????????? */


  HTMLActuator.prototype.clearMessage = function () {
    // IE only takes one value to remove at a time.
    this.messageContainer.classList.remove('game-won');
    this.messageContainer.classList.remove('game-over');
  };

  return HTMLActuator;
}();

exports.default = HTMLActuator;
},{}],"src/Tile.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Tile =
/** @class */
function () {
  function Tile(position, value) {
    this.x = position.x;
    this.y = position.y;
    this.value = value || 2;
    this.previousPosition = null;
    this.mergedFrom = null; // Tracks tiles that merged together
  }
  /**????????????????????? */


  Tile.prototype.savePosition = function () {
    this.previousPosition = {
      x: this.x,
      y: this.y
    };
  };
  /**???????????? */


  Tile.prototype.updatePosition = function (position) {
    this.x = position.x;
    this.y = position.y;
  };
  /**?????????????????? */


  Tile.prototype.serialize = function () {
    return {
      position: {
        x: this.x,
        y: this.y
      },
      value: this.value
    };
  };

  return Tile;
}();

exports.default = Tile;
},{}],"src/Grid.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Tile_1 = __importDefault(require("./Tile"));

var Grid =
/** @class */
function () {
  function Grid(size, previousState) {
    this.size = size;
    this.cells = previousState ? this.fromState(previousState) : this.empty();
  }
  /**?????? cell ?????? */


  Grid.prototype.cellContent = function (position) {
    if (this.withinBounds(position)) {
      return this.cells[position.x][position.y];
    } else {
      return null;
    }
  };
  /**????????????????????? */


  Grid.prototype.withinBounds = function (position) {
    return position.x >= 0 && position.x < this.size && position.y >= 0 && position.y < this.size;
  };
  /**???????????????????????? */


  Grid.prototype.cellOccupied = function (position) {
    return !!this.cellContent(position);
  };

  Grid.prototype.removeTile = function (position) {
    this.cells[position.x][position.y] = null;
  };
  /**?????????????????? */


  Grid.prototype.cellAvailable = function (position) {
    return !this.cellOccupied(position);
  };
  /** ?????? cellState[]*/


  Grid.prototype.serialize = function () {
    var cellState = [];

    for (var x = 0; x < this.size; x++) {
      var row = cellState[x] = [];

      for (var y = 0; y < this.size; y++) {
        row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
      }
    }

    return {
      size: this.size,
      cells: cellState
    };
  };
  /**??????????????????????????? */


  Grid.prototype.cellsAvailable = function () {
    return !!this.availableCells().length;
  };
  /**??????????????? */


  Grid.prototype.insertTile = function (tile) {
    this.cells[tile.x][tile.y] = tile;
  };
  /**????????????????????? state ?????? cells */


  Grid.prototype.fromState = function (state) {
    var cells = [];

    for (var x = 0; x < this.size; x++) {
      var row = cells[x] = [];

      for (var y = 0; y < this.size; y++) {
        var tile = state[x][y];
        row.push(tile ? new Tile_1.default(tile.position, tile.value) : null);
      }
    }

    return cells;
  };
  /**????????? cells */


  Grid.prototype.empty = function () {
    var cells = [];

    for (var x = 0; x < this.size; x++) {
      var row = cells[x] = [];

      for (var y = 0; y < this.size; y++) {
        row.push(null);
      }
    }

    return cells;
  };
  /**???????????????????????????????????? */


  Grid.prototype.randomAvailableCell = function () {
    var cells = this.availableCells();

    if (cells.length) {
      return cells[Math.floor(Math.random() * cells.length)];
    }
  };
  /**?????????????????? tile ????????? */


  Grid.prototype.availableCells = function () {
    var cells = [];
    this.eachCell(function (x, y, tile) {
      if (!tile) {
        cells.push({
          x: x,
          y: y
        });
      }
    });
    return cells;
  };
  /**?????????????????? */


  Grid.prototype.eachCell = function (callback) {
    for (var x = 0; x < this.size; x++) {
      for (var y = 0; y < this.size; y++) {
        callback(x, y, this.cells[x][y]);
      }
    }
  };

  return Grid;
}();

exports.default = Grid;
},{"./Tile":"src/Tile.ts"}],"src/GameManager.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var InputManager_1 = __importDefault(require("./InputManager"));

var StorageManager_1 = __importDefault(require("./StorageManager"));

var HTMLActuator_1 = __importDefault(require("./HTMLActuator"));

var Grid_1 = __importDefault(require("./Grid")); // ??????


var Tile_1 = __importDefault(require("./Tile")); // ???


var GameManager =
/** @class */
function () {
  function GameManager() {
    /**???????????? n * n */
    this.size = 4;
    /*??????????????? */

    this.startTiles = 2;
    /**?????? */

    this.over = false;
    /**?????? */

    this.won = false;
    /**????????? */

    this.isKeepPlaying = false;
    this.storageManager = new StorageManager_1.default();
    /**??????????????????????????????????????????????????? */

    this.inputManager = new InputManager_1.default();
    this.inputManager.on('move', this.move.bind(this));
    this.inputManager.on('restart', this.restart.bind(this));
    this.inputManager.on('keepPlaying', this.keepPlaying.bind(this));
    /**????????????????????????????????????????????????dom */

    this.actuator = new HTMLActuator_1.default();
    this.setup();
  }

  Object.defineProperty(GameManager.prototype, "isGameTerminated", {
    /**????????????????????? */
    get: function get() {
      return this.over || this.won && !this.isKeepPlaying;
    },
    enumerable: false,
    configurable: true
  });
  /**????????????????????? */

  GameManager.prototype.getVector = function (direction) {
    var map = {
      0: {
        x: 0,
        y: -1
      },
      1: {
        x: 1,
        y: 0
      },
      2: {
        x: 0,
        y: 1
      },
      3: {
        x: -1,
        y: 0
      } // Left

    };
    return map[direction];
  };
  /**????????????????????????????????????????????????????????????????????????????????????????????? */


  GameManager.prototype.buildTraversals = function (vector) {
    var traversals = {
      x: [],
      y: []
    };

    for (var pos = 0; pos < this.size; pos++) {
      traversals.x.push(pos);
      traversals.y.push(pos);
    } // ?????? vector ??????????????????


    if (vector.x === 1) traversals.x = traversals.x.reverse();
    if (vector.y === 1) traversals.y = traversals.y.reverse();
    return traversals;
  };
  /**Tile ????????????*/


  GameManager.prototype.prepareTiles = function () {
    this.grid.eachCell(function (_, __, tile) {
      if (tile) {
        tile.mergedFrom = null;
        tile.savePosition();
      }
    });
  };
  /**?????????????????????????????????????????? ????????????????????? */


  GameManager.prototype.findFarthestPosition = function (cell, vector) {
    var previous;

    do {
      previous = cell;
      cell = {
        x: previous.x + vector.x,
        y: previous.y + vector.y
      };
    } while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));

    return {
      farthest: previous,
      next: cell
    };
  };

  GameManager.prototype.move = function (direction) {
    // 0: up, 1: right, 2: down, 3: left
    var self = this; // ????????????????????????????????????

    if (this.isGameTerminated) return;
    var cell, tile; // ??????????????????????????????????????????

    var vector = this.getVector(direction); // ???????????????????????????????????? {x:[], y: []}

    var traversals = this.buildTraversals(vector); // ??????????????????

    var moved = false; // ???????????? tile ????????????????????? merger ??????

    this.prepareTiles();
    traversals.x.forEach(function (x) {
      traversals.y.forEach(function (y) {
        cell = {
          x: x,
          y: y
        };
        tile = self.grid.cellContent(cell); // ???????????????

        if (tile) {
          var positions = self.findFarthestPosition(cell, vector);
          var next = self.grid.cellContent(positions.next); // ????????????????????????????????????

          if (next && next.value === tile.value && !next.mergedFrom) {
            var merged = new Tile_1.default(positions.next, tile.value * 2);
            merged.mergedFrom = [tile, next]; // ????????????????????????

            self.grid.insertTile(merged); // ????????????

            self.grid.removeTile(tile);
            tile.updatePosition(positions.next);
            console.log(self); // ????????????

            self.score += merged.value; // ????????????????????? 2048??? ???????????????

            if (merged.value === 2048) self.won = true;
          } else {
            self.moveTile(tile, positions.farthest);
          } // ?????????????????????


          if (!self.positionsEqual(cell, tile)) {
            moved = true;
          }
        }
      });
    }); // ??????????????????????????????????????????

    if (moved) {
      this.addRandomTile();

      if (!this.movesAvailable()) {
        this.over = true; // Game over!
      }

      this.actuate();
    }
  };
  /**????????????????????????????????????????????????????????????????????? */


  GameManager.prototype.movesAvailable = function () {
    return this.grid.cellsAvailable() || this.tileMatchesAvailable();
  };
  /**???????????????????????????????????????????????????????????????????????? */


  GameManager.prototype.tileMatchesAvailable = function () {
    var self = this;
    var tile;

    for (var x = 0; x < this.size; x++) {
      for (var y = 0; y < this.size; y++) {
        tile = this.grid.cellContent({
          x: x,
          y: y
        });

        if (tile) {
          for (var direction = 0; direction < 4; direction++) {
            var vector = self.getVector(direction);
            var cell = {
              x: x + vector.x,
              y: y + vector.y
            };
            var other = self.grid.cellContent(cell);

            if (other && other.value === tile.value) {
              return true; // These two tiles can be merged
            }
          }
        }
      }
    }

    return false;
  };
  /**?????????????????????????????? */


  GameManager.prototype.positionsEqual = function (first, second) {
    return first.x === second.x && first.y === second.y;
  };
  /**???????????? */


  GameManager.prototype.restart = function () {
    this.storageManager.clearGameState();
    this.actuator.continueGame(); // Clear the game won/lost message

    this.setup();
  };
  /**???????????? */


  GameManager.prototype.keepPlaying = function () {
    this.isKeepPlaying = true;
    this.actuator.continueGame(); // ???????????????????????????????????????
  };
  /**??????????????? */


  GameManager.prototype.setup = function () {
    var previousState = this.storageManager.getGameState(); // ?????????????????????????????????

    if (previousState) {
      this.grid = new Grid_1.default(previousState.grid.size, previousState.grid.cells); // Reload grid

      this.score = previousState.score;
      this.over = previousState.over;
      this.won = previousState.won;
      this.isKeepPlaying = previousState.keepPlaying;
    } else {
      this.grid = new Grid_1.default(this.size);
      this.score = 0;
      this.over = false;
      this.won = false;
      this.isKeepPlaying = false; // ?????????????????? tile

      this.addStartTiles();
    } // Update the actuator


    this.actuate();
  };

  GameManager.prototype.addStartTiles = function () {
    for (var i = 0; i < this.startTiles; i++) {
      this.addRandomTile();
    }
  };
  /**??????????????? */


  GameManager.prototype.addRandomTile = function () {
    if (this.grid.cellsAvailable()) {
      var value = Math.random() < 0.9 ? 2 : 4;
      var tile = new Tile_1.default(this.grid.randomAvailableCell(), value);
      this.grid.insertTile(tile);
    }
  };
  /**?????????????????? */


  GameManager.prototype.serialize = function () {
    return {
      grid: this.grid.serialize(),
      score: this.score,
      over: this.over,
      won: this.won,
      keepPlaying: this.isKeepPlaying
    };
  };
  /**?????? */


  GameManager.prototype.actuate = function () {
    if (this.storageManager.getBestScore() < this.score) {
      this.storageManager.setBestScore(this.score);
    } // Clear the state when the game is over (game over only, not win)


    if (this.over) {
      this.storageManager.clearGameState();
    } else {
      this.storageManager.setGameState(this.serialize());
    }

    this.actuator.actuate(this.grid, {
      score: this.score,
      over: this.over,
      won: this.won,
      bestScore: this.storageManager.getBestScore(),
      terminated: this.isGameTerminated
    });
  };
  /**?????? tile ??????????????? */


  GameManager.prototype.moveTile = function (tile, position) {
    this.grid.cells[tile.x][tile.y] = null;
    this.grid.cells[position.x][position.y] = tile;
    tile.updatePosition(position);
  };

  return GameManager;
}();

exports.default = GameManager;
},{"./InputManager":"src/InputManager.ts","./StorageManager":"src/StorageManager.ts","./HTMLActuator":"src/HTMLActuator.ts","./Grid":"src/Grid.ts","./Tile":"src/Tile.ts"}],"C:/Users/XJY/AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/bundle-url.js":[function(require,module,exports) {
var bundleURL = null;

function getBundleURLCached() {
  if (!bundleURL) {
    bundleURL = getBundleURL();
  }

  return bundleURL;
}

function getBundleURL() {
  // Attempt to find the URL of the current script and use that as the base URL
  try {
    throw new Error();
  } catch (err) {
    var matches = ('' + err.stack).match(/(https?|file|ftp|chrome-extension|moz-extension):\/\/[^)\n]+/g);

    if (matches) {
      return getBaseURL(matches[0]);
    }
  }

  return '/';
}

function getBaseURL(url) {
  return ('' + url).replace(/^((?:https?|file|ftp|chrome-extension|moz-extension):\/\/.+)\/[^/]+$/, '$1') + '/';
}

exports.getBundleURL = getBundleURLCached;
exports.getBaseURL = getBaseURL;
},{}],"C:/Users/XJY/AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/css-loader.js":[function(require,module,exports) {
var bundle = require('./bundle-url');

function updateLink(link) {
  var newLink = link.cloneNode();

  newLink.onload = function () {
    link.remove();
  };

  newLink.href = link.href.split('?')[0] + '?' + Date.now();
  link.parentNode.insertBefore(newLink, link.nextSibling);
}

var cssTimeout = null;

function reloadCSS() {
  if (cssTimeout) {
    return;
  }

  cssTimeout = setTimeout(function () {
    var links = document.querySelectorAll('link[rel="stylesheet"]');

    for (var i = 0; i < links.length; i++) {
      if (bundle.getBaseURL(links[i].href) === bundle.getBundleURL()) {
        updateLink(links[i]);
      }
    }

    cssTimeout = null;
  }, 50);
}

module.exports = reloadCSS;
},{"./bundle-url":"C:/Users/XJY/AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/bundle-url.js"}],"src/index.scss":[function(require,module,exports) {
var reloadCSS = require('_css_loader');

module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
},{"_css_loader":"C:/Users/XJY/AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/css-loader.js"}],"src/index.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var GameManager_1 = __importDefault(require("./GameManager"));

require("./index.scss");

window.requestAnimationFrame(function () {
  ;
  window.game = new GameManager_1.default();
  console.log(window.game);
});
},{"./GameManager":"src/GameManager.ts","./index.scss":"src/index.scss"}],"C:/Users/XJY/AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "64949" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ??? Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] ????  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">????</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["C:/Users/XJY/AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","src/index.ts"], null)
//# sourceMappingURL=/src.f10117fe.js.map