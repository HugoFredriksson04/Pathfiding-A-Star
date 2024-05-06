const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cols = 20;
const rows = 20;
const cellWidth = canvas.width / cols;
const cellHeight = canvas.height / rows;
const animationSpeed = 100; // milliseconds
let animationId = null;

// Grid generation
let grid = new Array(cols);
for (let i = 0; i < cols; i++) {
  grid[i] = new Array(rows);
}

// Node class
class Node {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.neighbors = [];
    this.previous = undefined;
    this.wall = false;
    if (Math.random() < 0.2) {
      this.wall = true;
    }
  }

  draw(color) {
    ctx.fillStyle = color;
    ctx.fillRect(this.x * cellWidth, this.y * cellHeight, cellWidth, cellHeight);
  }

  addNeighbors(grid) {
    const x = this.x;
    const y = this.y;
    if (x < cols - 1) this.neighbors.push(grid[x + 1][y]);
    if (x > 0) this.neighbors.push(grid[x - 1][y]);
    if (y < rows - 1) this.neighbors.push(grid[x][y + 1]);
    if (y > 0) this.neighbors.push(grid[x][y - 1]);
  }
}

// Initialize grid
function init() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j] = new Node(i, j);
    }
  }
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].addNeighbors(grid);
    }
  }
}
init();

// Draw function
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j].wall) {
        grid[i][j].draw('black');
      } else {
        grid[i][j].draw('white');
      }
    }
  }
  // Draw start and end blocks
  const start = grid[0][0];
  const end = grid[cols - 1][rows - 1];
  start.draw('green');
  end.draw('red');
}

// Visualize pathfinding
function visualizePathfinding() {
  const start = grid[0][0];
  const end = grid[cols - 1][rows - 1];
  const path = astar(start, end);
  let i = 0;
  
  function animate() {
    if (i < path.length) {
      const current = path[i];
      current.draw('blue');
      i++;
      animationId = requestAnimationFrame(animate);
    }
  }
  
  animate();
}

// Start button event listener
document.getElementById('startButton').addEventListener('click', function() {
  if (!animationId) {
    visualizePathfinding();
  }
});

// Stop button event listener
document.getElementById('stopButton').addEventListener('click', function() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
});

// A* algorithm
function astar(start, end) {
  const openSet = [];
  const closedSet = [];
  openSet.push(start);

  while (openSet.length > 0) {
    let winner = 0;
    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[winner].f) {
        winner = i;
      }
    }

    const current = openSet[winner];

    if (current === end) {
      let temp = current;
      const path = [];
      while (temp.previous) {
        path.push(temp);
        temp = temp.previous;
      }
      return path;
    }

    const index = openSet.indexOf(current);
    openSet.splice(index, 1);
    closedSet.push(current);

    const neighbors = current.neighbors;
    for (let i = 0; i < neighbors.length; i++) {
      const neighbor = neighbors[i];

      if (!closedSet.includes(neighbor) && !neighbor.wall) {
        const tempG = current.g + 1;

        let newPath = false;
        if (openSet.includes(neighbor)) {
          if (tempG < neighbor.g) {
            neighbor.g = tempG;
            newPath = true;
          }
        } else {
          neighbor.g = tempG;
          newPath = true;
          openSet.push(neighbor);
        }

        if (newPath) {
          neighbor.h = heuristic(neighbor, end);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.previous = current;
        }
      }
    }
  }
  return [];
}

// Heuristic function
function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
