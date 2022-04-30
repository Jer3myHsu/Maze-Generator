export class Maze {
  static N = 0B1000;
  static S = 0B0100;
  static E = 0B0010;
  static W = 0B0001;
  data: number[][];
  start: {
    x: number,
    y: number
  };
  end: {
    x: number,
    y: number
  };

  constructor(width: number, height: number, startX: number, startY: number, endX: number, endY: number) {
    this.data = [[0]];
    this.width = width;
    this.height = height;
    this.start = {
      x: startX,
      y: startY
    };
    this.end = {
      x: endX,
      y: endY
    };
  }

  get width() {
    return this.data.length;
  }

  get height() {
    return this.data[0].length;
  }

  set width(width: number) {
    if (width < 3 || width > 50) {
      return;
    }
    while (this.width > width) {
      this.data[this.width - 1].forEach((_cell, y) => {
        this.data[this.width - 2][y] &= Maze.N|Maze.S|Maze.W;
      })
      this.data.pop();
    }
    if (this.width < width) {
      this.data[this.width - 1].forEach((_cell, y) => {
        this.data[this.width - 1][y] |= Maze.E;
      });
      const column = [0B0111];
      while (column.length + 1 < this.width)
        column.push(0B1111);
      column.push(0B1011);
      while (this.width < width)
        this.data.push([...column]);
      this.data[this.width - 1].forEach((_cell, y) => {
        this.data[this.width - 1][y] &= Maze.N|Maze.S|Maze.W;
      });
    }
  }

  set height(height: number) {
    if (height < 3 || height > 50) {
      return;
    }
    if (this.height > height) {
      this.data.forEach(column => {
        while (column.length > height) {
          column[column.length - 2] &= Maze.N|Maze.E|Maze.W;
          column.pop();
        }
      });
    } else if (this.height < height) {
      this.data.forEach((column, x) => {
        column[column.length - 1] |= Maze.S;
        while (column.length < height) {
          column.push((x === 0 ? 0B1110 : 0B1111) & (x === this.width - 1 ? 0B1101 : 0B1111));
        }
        column[column.length - 1] &= Maze.N|Maze.E|Maze.W;
      });
    }
  }

  static opD(d: number) {
    if (d === Maze.N) {
      return Maze.S;
    } else if (d === Maze.S) {
      return Maze.N;
    } else if (d === Maze.E) {
      return Maze.W;
    } else if (d === Maze.W) {
      return Maze.E;
    }
    return 0;
  }

  resetMaze() {
    this.data.forEach((column, x) => {
      column.forEach((_cell, y) => {
        column[y] = Maze.N|Maze.S|Maze.E|Maze.W;
        if (x === 0) {
          column[y] &= Maze.N|Maze.S|Maze.E;
        } else if (x === this.width - 1) {
          column[y] &= Maze.N|Maze.S|Maze.W;
        }
        if (y === 0) {
          column[y] &= Maze.S|Maze.E|Maze.W;
        } else if (y === this.height - 1) {
          column[y] &= Maze.N|Maze.E|Maze.W;
        }
      });
    });
  }

  pickDirections(avoid: number) {
    const directions = [];
    while (directions.length < 3) {
      const d = 1 << Math.floor(Math.random() * 4);
      const sameD = Math.floor(Math.random() * 2);
      if (directions.indexOf(d) < 0 && d !== avoid && (!sameD || d !== Maze.opD(avoid))) {
        directions.push(d);
      }
    }
    return directions;
  }

  generateMazePath(endX: number, endY: number, x: number, y: number, origin: number, i = 0) {
    if (endX === x && endY === y) {
      this.data[x][y] = origin;
      return;
    }
    let intersection = i;
    this.pickDirections(origin).forEach(d => {
      if (intersection > 1) return;
      if (d === Maze.N && y > 0 && !this.data[x][y - 1]) {
        this.data[x][y] |= Maze.N;
        this.data[x][y - 1] |= Maze.S;
        this.generateMazePath(endX, endY, x, y - 1, Maze.S);
        intersection++;
      } else if (d === Maze.S && y < this.height - 1 && !this.data[x][y + 1]) {
        this.data[x][y] |= Maze.S;
        this.data[x][y + 1] |= Maze.N;
        this.generateMazePath(endX, endY, x, y + 1, Maze.N);
        intersection++;
      } else if (d === Maze.E && x < this.width - 1 && !this.data[x + 1][y]) {
        this.data[x][y] |= Maze.E;
        this.data[x + 1][y] |= Maze.W;
        this.generateMazePath(endX, endY, x + 1, y, Maze.W);
        intersection++;
      } else if (d === Maze.W && x > 0 && !this.data[x - 1][y]) {
        this.data[x][y] |= Maze.W;
        this.data[x - 1][y] |= Maze.E;
        this.generateMazePath(endX, endY, x - 1, y, Maze.E);
        intersection++;
      }
    });
  }

  generateMaze() {
    if (this.width < 3 || this.width > 50 || this.height < 3 || this.height > 50 ||
      this.width <= this.start.x || this.width <= this.end.x || this.height <= this.start.y || this.height <= this.start.y ||
      (this.start.x === this.end.x && this.start.y === this.end.y)) {
      return;
    }
    this.data.forEach(column => {
      column.forEach((_cell, y) => {
        column[y] = 0;
      });
    });
    this.generateMazePath(this.start.x, this.start.y, this.end.x, this.end.y, Maze.N|Maze.S|Maze.E|Maze.W, 1);
  }

  // outputMaze() {// For testing
  //   const box = document.getElementById('maze');
  //   box.innerHTML = '';
  //   box.style.gridTemplateColumns = ' 44px'.repeat(this.width)
  //   box.style.gridTemplateRows = ' 44px'.repeat(this.height)
  //   for (let y = 0; y < this.height; y++) {
  //     for (let x = 0; x < this.width; x++) {
  //       let span = document.createElement('span');
  //       span.style.lineHeight = '44px';
  //       span.style.border = '2px solid darkslateblue';
  //       if (x === this.start.x && y === this.start.y) {
  //         span.innerHTML = '<b>S</b>';
  //         span.className = 'start-cell';
  //       } else if (x === this.end.x && y === this.end.y) {
  //         span.innerHTML = '<b>F</b>';
  //         span.className = 'finish-cell';
  //       }
  //       if (this.data[x][y] & Maze.N) {
  //         span.style.borderTopColor = 'white';
  //       }
  //       if (this.data[x][y] & Maze.S) {
  //         span.style.borderBottomColor = 'white';
  //       }
  //       if (this.data[x][y] & Maze.E) {
  //         span.style.borderRightColor = 'white';
  //       }
  //       if (this.data[x][y] & Maze.W) {
  //         span.style.borderLeftColor = 'white';
  //       }
  //       box.appendChild(span)
  //     }
//     }
//   }
}
