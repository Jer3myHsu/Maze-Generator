import { Component } from '@angular/core';
import { Maze } from 'src/app/Maze';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'this.maze-generator';
  maze: Maze = new Maze(20, 20, 0, 0, 19, 19);
  size: number = 14;
  outlineType = 'dot'

  constructor() {}

  ngOnInit() {
    this.maze.generateMaze();
    // this.drawEmptyMaze('dot');
    // this.drawMazeFromObject();
  }

  clearMaze() {
    document.querySelectorAll('.wall').forEach((g: any) => {
      g.setAttribute('fill', 'white');
      g.style.opacity = 0;
    });
    this.maze.resetMaze();
  }

  drawOutlineDot(x: number, y: number) {
    return `<use href="#dot" x="${x}" y="${y}"/>`;
  }

  drawOutlineGrid(x: number, y: number) {
    // return `<use href="#rect" x="${x}" y="${y}" width="${this.size}" height="${this.size}"/>`;
    return `<rect stroke="lightGrey" fill="white" x="${x}" y="${y}" width="${this.size}" height="${this.size}" pointer-events="none"/>`;
  }

  drawStartPoint(x: number, y: number) {
    const svg = document.getElementById('maze') ?? document.createElement('div');
    svg.innerHTML += `<g class="start" ><circle fill="lightgreen" cx="${1 + x * this.size + this.size/2}" cy="${1 + y * this.size + this.size/2}" r="${this.size / 3}"/>
                      <text x="${1 + x * this.size + this.size/2}" y="${1 + y * this.size + this.size/2}">S</text>
                      </g>`
  }

  drawEndPoint(x: number, y: number) {
    this.drawStartPoint(x,y);
  }

  drawWalls(drawX: number, drawY: number, x: number, y: number, vertical = true) {
    let wall = `<g class="wall" id="wall-${x}-${y}" opacity="0" onmouseenter="this.hightlightWall(this, 'grey')" onmouseleave="this.hightlightWall(this)"
                onclick="this.changeMazeWall(this, ${x}, ${y})">`;
    if (vertical) {
      wall += `<polygon points="${drawX},${drawY} ${drawX + this.size/3},${drawY + this.size/2}
               ${drawX},${drawY + this.size} ${drawX - this.size/3},${drawY + this.size/2}"
               opacity="0"/>`
      wall += `<rect x="${drawX - 1}" y="${drawY - 1}" width="2" height="${this.size + 2}" rx="1"/>
              </g>`;
    } else {
      wall += `<polygon points="${drawX - this.size/2},${drawY + this.size/2} ${drawX},${drawY + this.size/2 + this.size/3}
               ${drawX + this.size/2},${drawY + this.size/2} ${drawX},${drawY + this.size/6}"
               opacity="0"/>`
      wall += `<rect x="${drawX - 1 - this.size/2}" y="${drawY - 1 + this.size/2}" width="${this.size + 2}" height="2" rx="1"/>
              </g>`;
    }
    return wall;
  }

  hightlightWall(event: any, color: string) {
    if (event.getAttribute('fill') !== 'black') {
      event.setAttribute('fill', color);
      event.style.opacity = color ? '1' : '0';
    }
  }

  changeMazeWall(event: any, x: number, y: number) {
    if (event.getAttribute('fill') === 'black') {
      event.setAttribute('fill', 'grey');
    } else {
      event.setAttribute('fill', 'black');
    }
    if (Math.floor(x) === x) {
      this.maze.data[x][Math.floor(y)] = this.maze.data[x][Math.floor(y)] ^ Maze.S;
      this.maze.data[x][Math.ceil(y)] = this.maze.data[x][Math.ceil(y)] ^ Maze.N;
    } else {
      this.maze.data[Math.floor(x)][y] = this.maze.data[Math.floor(x)][y] ^ Maze.W;
      this.maze.data[Math.ceil(x)][y] = this.maze.data[Math.ceil(x)][y] ^ Maze.E;
    }
  }

  drawMazeFromObject() {
    for (let x = 0; x < this.maze.width; x++) {
      for (let y = 0; y < this.maze.height; y++) {
        if (!(this.maze.data[x][y] & Maze.E) && x !== this.maze.width - 1) {
          this.hightlightWall(document.getElementById(`wall-${x + 0.5}-${y}`), 'black');
        }
        if (!(this.maze.data[x][y] & Maze.S) && y !== this.maze.height - 1) {
          this.hightlightWall(document.getElementById(`wall-${x}-${y + 0.5}`), 'black');
        }
      }
    }
    this.drawStartPoint(this.maze.start.x, this.maze.start.y);
    this.drawEndPoint(this.maze.end.x, this.maze.end.y);
  }

  drawEmptyMaze(type: string) {
    const svg = document.getElementById('maze') ?? document.createElement('div');
    let grid = '';
    for (let x = 0; x < this.maze.width; x++) {
      for (let y = 0; y < this.maze.height; y++) {
        grid += type === 'dot' ? this.drawOutlineDot(1 + x * this.size, 1 + y * this.size) : this.drawOutlineGrid(1 + x * this.size, 1 + y * this.size);
      }
    }
    for (let x = 1; x < this.maze.width; x++) {
      for (let y = 0; y < this.maze.height; y++) {
        grid += this.drawWalls(1 + x * this.size, 1 + y * this.size, x - .5, y, true);
      }
    }
    for (let x = 0; x < this.maze.width; x++) {
      for (let y = 1; y < this.maze.height; y++) {
        grid += this.drawWalls(1 + x * this.size + this.size / 2, 1 + y * this.size - this.size / 2, x, y - .5, false);
      }
    }

    svg.innerHTML += grid;
    svg.innerHTML += `<rect x="0" y="0" width="${this.size * this.maze.width + 2}" height="2" rx="1" ry="1"/>
                      <rect x="0" y="${this.size * (this.maze.height)}" width="${this.size * this.maze.width + 2}" height="2" rx="1" ry="1"/>
                      <rect x="${this.size * (this.maze.width)}" y="0" width="2" height="${this.size * this.maze.height + 2}" rx="1" ry="1"/>
                      <rect x="0" y="0" width="2" height="${this.size * this.maze.height + 2}" rx="1" ry="1"/>`;
  }
}
