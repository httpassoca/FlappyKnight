const piece = createEl("img", "piece");
const cover = createEl("img", "cover");
piece.setAttribute("src", "./images/block-piece.png");
cover.setAttribute("src", "./images/block-cover.png");

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function createEl(el, className = "") {
  const element = document.createElement(el);
  element.className = className;
  return element;
}

function clearEl(el) {
  el.innerHTML = "";
}

function AreaColliding(El, El2) {
  const a = El.getBoundingClientRect();
  const b = El2.getBoundingClientRect();

  const horizontal = a.left + a.width >= b.left +10 && b.left + b.width >= a.left +10;
  const vertical = a.top + a.height >= b.top +10 && b.top + b.height >= a.top +10;
  return horizontal && vertical;
}

function hasCollided(knight, columns){
    let collided = false;
    columns.pares.forEach(column =>{
        if(!collided) {
            const up = column.up;
            const down = column.down;
            collided = AreaColliding(knight.el, up) || AreaColliding(knight.el, down)
        }
    })
    return collided;
}

function Block(className) {
  this.block = createEl("div");
  this.block.className = className;
  this.block.setHeight = size => {
    clearEl(this.block);
    for (let i = 0; i < size; i++) {
      this.block.appendChild(piece.cloneNode());
    }
    this.block.appendChild(cover.cloneNode());
  };
  return this.block;
}

function Column(x = 0, size = 12) {
  this.column = createEl("div");
  this.up = new Block("up");
  this.down = new Block("down");

  this.column.appendChild(this.up);
  this.column.appendChild(this.down);
  this.column.className = "column";

  this.getX = () => parseInt(this.column.style.left.split("px")[0]);
  this.setX = x => (this.column.style.left = `${x}px`);
  this.getWidth = () => this.column.clientWidth;
  this.sortGate = () => {
    let blockSize = getRandomInt(size);
    this.up.setHeight(blockSize + 3);
    this.down.setHeight(size - blockSize + 3);
  };

  this.sortGate();
  this.setX(x);
}

function Columns(q = 6, gameWidth = 1200, space = 240, size, UpdatePoints) {
  this.pares = [];
  for (let i = 0; i < q; i++) {
    this.pares.push(new Column(gameWidth + space * i, size));
  }
  const speed = 3; //pixels per animation
  this.animation = () => {
    this.pares.forEach(column => {
      column.setX(column.getX() - speed);
      if (column.getX() < -column.getWidth()) {
        column.sortGate();
        column.setX(column.getX() + space * this.pares.length);
      }
      const Pointed = column.getX() + speed >= 600 && column.getX() < 600;
      if (Pointed) UpdatePoints();
    });
  };
}

function Knight(gameHeight) {
  let flying = false;
  this.el = createEl("img", "knight");
  this.el.src = "./images/knight.png";
  this.getY = () => parseInt(this.el.style.bottom.split("px")[0]);
  this.setY = y => (this.el.style.bottom = `${y}px`);

  window.onkeydown = e => {
    flying = true;
  };
  window.onkeyup = e => {
    flying = false;
  };

  this.animation = () => {
    const newY = this.getY() + (flying ? 8 : -5);
    const maxY = gameHeight - this.el.clientHeight - 5;
    if (newY <= 0) this.setY(0);
    else if (newY >= maxY) this.setY(maxY);
    else this.setY(newY);
  };
  this.setY(gameHeight / 2);
}

function FlappyKnight() {
  let points = 0;
  const game = document.querySelector(".container");
  const gameWidth = game.clientWidth;
  const gameHeight = game.clientHeight;

  const score = new Pointer();
  const knight = new Knight(gameHeight);
  const cols = new Columns(6, gameWidth, 300, 12, () => {
    score.UpdatePoints(++points);
  });
  game.appendChild(knight.el);

  cols.pares.forEach(cols => {
    game.appendChild(cols.column);
  });

  this.start = () => {
    // game loop
    const temporizador = setInterval(() => {
        knight.animation();
      cols.animation();

      if(hasCollided(knight,cols)) clearInterval(temporizador)
    }, 20);
  };
}

function Pointer() {
  this.el = document.getElementById("score");
  this.UpdatePoints = pontos => {
    clearEl(this.el);
    this.el.innerHTML = "Score: " + pontos;
  };
}
