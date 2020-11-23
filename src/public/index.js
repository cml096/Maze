//Canvas
const maze = document.getElementById('maze');
const ctx = maze.getContext("2d");

let generationComplete = false;
let current;

class Maze {
    constructor(size, rows, columns) {
    this.size = size;
    this.columns = columns;
    this.rows = rows;
    this.grid = [];
    this.stack = [];

    this.colInit = 0;
    this.rowInit = 0;
    }

    // Set the grid: Create new this.grid array based on number of instance rows and columns
    setup() {
    for (let r = 0; r < this.rows; r++) {
        let row = [];
        for (let c = 0; c < this.columns; c++) {
        // Create a new instance of the Cell class for each element in the 2D array and push to the maze grid array
        let cell = new Cell(r, c, this.grid, this.size);
        row.push(cell);
        }
        this.grid.push(row);
    }
    // Set the starting grid
    current = this.grid[0][0];
    }

    // Draw the canvas by setting the size and placing the cells in the grid array on the canvas.
    draw() {
    maze.width = this.size;
    maze.height = this.size;
    maze.style.background = "rgb(249, 213, 164)";
    // Set the first cell as visited
    current.visited = true;
    // Loop through the 2d grid array and call the show method for each cell instance
    for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.columns; c++) {
        let grid = this.grid;
        let num = Math.floor(Math.random() * 100);
        grid[r][c].flat = num > 67 ? 1 : 0.84;
        grid[r][c].show(this.size, this.rows, this.columns, num);
        }
    }
    // This function will assign the variable 'next' to random cell out of the current cells available neighbouting cells
    let next = current.checkNeighbours();
    // If there is a non visited neighbour cell
    if (next) {
        next.visited = true;
        // Add the current cell to the stack for backtracking
        this.stack.push(current);
        // This function compares the current cell to the next cell and removes the relevant walls for each cell
        current.removeWalls(current, next);
        // Set the nect cell to the current cell
        current = next;

        // Else if there are no available neighbours start backtracking using the stack
    } else if (this.stack.length > 0) {
        let cell = this.stack.pop();
        current = cell;
        //current.highlight(this.columns);
    }
    // If no more items in the stack then all cells have been visted and the function can be exited
    if (this.stack.length === 0) {
        generationComplete = true;
        let rand_x = Math.floor(Math.random() * this.columns);
        let rand_y = Math.floor(Math.random() * this.rows);
        // set init
        console.log(rand_x,rand_y);
        // save init in current variable
        current = this.grid[rand_x][rand_y];
        this.colInit = rand_x;
        this.rowInit = rand_y;
        // mark the init
        this.grid[rand_x][rand_y].init = true;
        this.grid[rand_x][rand_y].setConfig(this.columns,this.rows,rand_x,rand_y,"purple");
        // set target
        rand_x = Math.floor(Math.random() * this.columns);
        rand_y = Math.floor(Math.random() * this.rows);
        this.grid[rand_x][rand_y].target = true;
        this.grid[rand_x][rand_y].setConfig(this.columns,this.rows,rand_x,rand_y,"green");
        return;
    }

    // Recursively call the draw function. This will be called up until the stack is empty
    window.requestAnimationFrame(() => {
        this.draw();
    });
  }
}

class Cell {
    // Constructor takes in the rowNum and colNum which will be used as coordinates to draw on the canvas.
    constructor(rowNum, colNum, parentGrid, parentSize) {
      this.rowNum = rowNum;
      this.colNum = colNum;
      this.visited = false;
      this.walls = {
        topWall: true,
        rightWall: true,
        bottomWall: true,
        leftWall: true,
      };
      this.init = false;
      this.target = false;
      this.flat = 0;
      this.spiritVisited = false;
      // parentGrid is passed in to enable the checkneighbours method.
      // parentSize is passed in to set the size of each cell on the grid
      this.parentGrid = parentGrid;
      this.parentSize = parentSize;
    }
  
    checkNeighbours() {
      let grid = this.parentGrid;
      let row = this.rowNum;
      let col = this.colNum;
      let neighbours = [];
  
      // The following lines push all available neighbours to the neighbours array
      // undefined is returned where the index is out of bounds (edge cases)
      let top = row !== 0 ? grid[row - 1][col] : undefined;
      let right = col !== grid.length - 1 ? grid[row][col + 1] : undefined;
      let bottom = row !== grid.length - 1 ? grid[row + 1][col] : undefined;
      let left = col !== 0 ? grid[row][col - 1] : undefined;
  
      // if the following are not 'undefined' then push them to the neighbours array
      if (top && !top.visited) neighbours.push(top);
      if (right && !right.visited) neighbours.push(right);
      if (bottom && !bottom.visited) neighbours.push(bottom);
      if (left && !left.visited) neighbours.push(left);
  
      // Choose a random neighbour from the neighbours array
      if (neighbours.length !== 0) {
        let random = Math.floor(Math.random() * neighbours.length);
        return neighbours[random];
      } else {
        return undefined;
      }
    }
  
    // Wall drawing functions for each cell. Will be called if relevent wall is set to true in cell constructor
    drawTopWall(x, y, size, columns, rows) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + size / columns, y);
      ctx.stroke();
    }
  
    drawRightWall(x, y, size, columns, rows) {
      ctx.beginPath();
      ctx.moveTo(x + size / columns, y);
      ctx.lineTo(x + size / columns, y + size / rows);
      ctx.stroke();
    }
  
    drawBottomWall(x, y, size, columns, rows) {
      ctx.beginPath();
      ctx.moveTo(x, y + size / rows);
      ctx.lineTo(x + size / columns, y + size / rows);
      ctx.stroke();
    }
  
    drawLeftWall(x, y, size, columns, rows) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + size / rows);
      ctx.stroke();
    }
  
    // Highlights the current cell on the grid. Columns is once again passed in to set the size of the grid.
    setConfig(columns,rows,rand_x,rand_y,color) {
      let x = (rand_x * this.parentSize) / columns;
      let y = (rand_y * this.parentSize) / rows;
      ctx.fillStyle = color;
      ctx.fillRect(
        x,
        y,
        this.parentSize / columns - 3,
        this.parentSize / rows - 3
      );
    }
  
    removeWalls(cell1, cell2) {
      // compares to two cells on x axis
      let x = cell1.colNum - cell2.colNum;
      // Removes the relevant walls if there is a different on x axis
      if (x === 1) {
        cell1.walls.leftWall = false;
        cell2.walls.rightWall = false;
      } else if (x === -1) {
        cell1.walls.rightWall = false;
        cell2.walls.leftWall = false;
      }
      // compares to two cells on x axis
      let y = cell1.rowNum - cell2.rowNum;
      // Removes the relevant walls if there is a different on x axis
      if (y === 1) {
        cell1.walls.topWall = false;
        cell2.walls.bottomWall = false;
      } else if (y === -1) {
        cell1.walls.bottomWall = false;
        cell2.walls.topWall = false;
      }
    }
  
    // Draws each of the cells on the maze canvas
    show(size, rows, columns, num) {
      let x = (this.colNum * size) / columns;
      let y = (this.rowNum * size) / rows;
      //console.log(`x =${x}`);
      //console.log(`y =${y}`);
      ctx.strokeStyle = "black";
      ctx.fillStyle = num > 67 ? "rgb(201, 79, 58)" : "rgb(249, 213, 164)";
      ctx.lineWidth = 2;
      if (this.walls.topWall) this.drawTopWall(x, y, size, columns, rows);
      if (this.walls.rightWall) this.drawRightWall(x, y, size, columns, rows);
      if (this.walls.bottomWall) this.drawBottomWall(x, y, size, columns, rows);
      if (this.walls.leftWall) this.drawLeftWall(x, y, size, columns, rows);
      if (this.visited) {
        ctx.fillRect(x + 1, y + 1, size / columns - 2, size / rows - 2);
      }
    }
}

class Spirit {
  constructor(){
    this.move = {
      norte : false,
      sur : false,
      este : true,
      oeste : false,
    };
  }

  // this function returns the position where the "spirit" is pointer
  getDirection(){
    switch (true){
      case this.move.norte:
        return 'n';
      case this.move.sur:
        return 's';
      case this.move.este:
        return 'e';
      case this.move.oeste:
        return 'o';
    }
  }

  // rotate the pointer counterclockwise and change the direction where it is pointing 
  rotartePointer(){
    switch(this.getDirection()){
      case 'n':
        this.move.norte = false;
        this.move.oeste = true;
        break;
      case 's':
        this.move.sur = false;
        this.move.este = true;
        break;
      case 'e':
        this.move.este = false;
        this.move.norte = true;
        break;
      case 'o':
        this.move.oeste = false;
        this.move.sur = true;
        break;
    }
  }

  rotate(time){
    let n = time / 4;
    for (let i; i <= n; i++){
      this.rotartePointer();
    }
  }
}

class Node {
  constructor(timeRotation,totalTime,colNum,rowNum){
    this.timeRotation = 0;
    this.totalTime = 0;
    this.colNum = 0;
    this.rowNum = 0;
  }
}

async function game(){
  let newMaze = new Maze(600, 10, 10); 
  newMaze.setup();
  await newMaze.draw();
  return newMaze;
}

function init(){

  console.log('work!');

  let newMaze = game();

  console.log(newMaze.colInit,newMaze.rowInit);
  console.log(newMaze.grid);

  generationComplete = false;
  let stack = [];
  let spirit = new Spirit();
  let node;

  while(!generationComplete){
    // mark path
    newMaze[current.rowNum][current.colNum].spiritVisited = true;
    // get direction of our punter
    let dir = spirit.getDirection();
    // We insert in the stack all the possible paths that "spirit" has
    if(!current.walls.topWall && !current.spiritVisited){
        switch(dir){
          case 'n':
            node = new Node(
              0,
              newMaze[current.rowNum - 1][current.colNum].flat + 0,
              current.rowNum,
              current.colNum
            );
            stack.push(node);
            break;
          case 'o':
            node = new Node(
              12,
              newMaze[current.rowNum][current.colNum + 1].flat + 12,
              current.rowNum,
              current.colNum
            );
            stack.push(node);
            break;
          case 's':
            node = new Node(
              8,
              newMaze[current.rowNum + 1][current.colNum].flat + 8,
              current.rowNum,
              current.colNum
            );
            stack.push(node);
            break;
          case 'e':
            node = new Node(
              4,
              newMaze[current.rowNum][current.colNum - 1].flat + 4,
              current.rowNum,
              current.colNum
            );
            stack.push(node);
            break;
        }
    }
    if(!current.walls.rightWall && !current.spiritVisited){
        switch(dir){
          case 'n':
            node = new Node(
              4,
              newMaze[current.rowNum - 1][current.colNum].flat + 4,
              current.rowNum,
              current.colNum
            );
            stack.push(node);
            break;
          case 'o':
            node = new Node(
              8,
              newMaze[current.rowNum][current.colNum + 1].flat + 18,
              current.rowNum,
              current.colNum
            );
            stack.push(node);
            break;
          case 's':
            node = new Node(
              12,
              newMaze[current.rowNum + 1][current.colNum].flat + 12,
              current.rowNum,
              current.colNum
            );
            stack.push(node);
            break;
          case 'e':
            node = new Node(
              0,
              newMaze[current.rowNum][current.colNum - 1].flat + 0,
              current.rowNum,
              current.colNum
            );
            stack.push(node);
            break;
        }
        
    }
    if(!current.walls.bottomWall && !current.spiritVisited){
        switch(dir){
          case 'n':
            node = new Node(
              8,
              newMaze[current.rowNum - 1][current.colNum].flat + 8,
              current.rowNum,
              current.colNum
            );
            stack.push(node);
            break;
          case 'o':
            node = new Node(
              4,
              newMaze[current.rowNum][current.colNum + 1].flat + 4,
              current.rowNum,
              current.colNum
            );
            stack.push(node);
            break;
          case 's':
            node = new Node(
              0,
              newMaze[current.rowNum + 1][current.colNum].flat + 0,
              current.rowNum,
              current.colNum
            );
            stack.push(node);
            break;
          case 'e':
            node = new Node(
              12,
              newMaze[current.rowNum][current.colNum - 1].flat + 12,
              current.rowNum,
              current.colNum
            );
            stack.push(node);
            break;
        }
    }
    if(!current.walls.leftWall && !current.spiritVisited){
        switch(dir){
          case 'n':
            node = new Node(
              12,
              newMaze[current.rowNum - 1][current.colNum].flat + 12,
              current.rowNum,
              current.colNum
            );
            stack.push(node);
            break;
          case 'o':
            node = new Node(
              0,
              newMaze[current.rowNum][current.colNum + 1].flat + 0,
              current.rowNum,
              current.colNum
            );
            stack.push(node);
            break;
          case 's':
            node = new Node(
              4,
              newMaze[current.rowNum + 1][current.colNum].flat + 4,
              current.rowNum,
              current.colNum
            );
            stack.push(node);
            break;
          case 'e':
            node = new Node(
              8,
              newMaze[current.rowNum][current.colNum - 1].flat + 8,
              current.rowNum,
              current.colNum
            );
            stack.push(node);
            break;
        }
    }
    console.log(stack);
    //sort the stack
    stack.sort( (node_a, node_b) => (node_a.totalTime > node_b.totalTime) ? 1 : -1 );
    //pop
    let path = stack.pop();
    // rotate current
    spirit.rotate(path.timeRotation);
    //upddate current
    current = newMaze[path.rowNum][path.colNum];
    // paint the area where i move
    newMaze[current.rowNum][current.colNum].setConfig(
      newMaze.columns,
      newMaze.rows,
      "purple"
    );
    // if ending
    if(current.target){
      generationComplete = true;
    }
  }
}

document.addEventListener('DOMContentLoaded', init);