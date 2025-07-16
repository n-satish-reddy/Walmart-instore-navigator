// Product positions on the map
const productData = {
  milk: { aisle: "5", node: "milk" },
  bread: { aisle: "2", node: "bread" },
  rice: { aisle: "8", node: "rice" },
  toothpaste: { aisle: "3", node: "toothpaste" }
};

// Entrance position
const entrance = "entrance";
let currentStart = entrance; // default starting node

// Graph of store paths
const graph = {
  entrance: ["a1"],
  a1: ["a2", "b1"],
  a2: ["a3"],
  a3: ["milk", "rice"],
  b1: ["bread", "toothpaste"],
  milk: [],
  rice: [],
  bread: [],
  toothpaste: []
};

// Map positions (node locations)
const positions = {
  entrance: { x: 0, y: 0 },
  a1: { x: 100, y: 0 },
  a2: { x: 200, y: 0 },
  a3: { x: 300, y: 0 },
  milk: { x: 400, y: 0 },
  rice: { x: 400, y: 180 },
  b1: { x: 100, y: 100 },
  bread: { x: 150, y: 200 },
  toothpaste: { x: 180, y: 120 }
};

// Breadth-First Search for pathfinding
function findPath(graph, start, end) {
  const queue = [[start]];
  const visited = new Set();

  while (queue.length) {
    const path = queue.shift();
    const node = path[path.length - 1];

    if (node === end) return path;

    if (!visited.has(node)) {
      visited.add(node);
      for (const neighbor of graph[node] || []) {
        queue.push([...path, neighbor]);
      }
    }
  }
  return null;
}

// Called when user searches
function findproduct() {
  const input = document.getElementById("search").value.toLowerCase();
  const result = document.getElementById("result");
  const marker = document.getElementById("marker");
  const dirBox = document.getElementById("directions");

  const product = productData[input];

  if (product) {
    const node = product.node;
    const aisle = product.aisle;

    result.innerText = `Product found in Aisle ${aisle}`;
    dirBox.innerHTML = "";

    const path = findPath(graph, currentStart, node); // use updated starting point
    if (path) {
      const endPos = positions[node];
      marker.style.display = "block";
      marker.style.left = endPos.x + "px";
      marker.style.top = endPos.y + "px";

      drawPath(path);
      animateDot(path);
      showDirections(path);
    } else {
      result.innerText = "No route found.";
      marker.style.display = "none";
    }
  } else {
    result.innerText = "Product not found";
    marker.style.display = "none";
    document.getElementById("directions").innerHTML = "";

    const canvas = document.getElementById("route-canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// Draw path and arrows
function drawPath(path) {
  const canvas = document.getElementById("route-canvas");
  const ctx = canvas.getContext("2d");
  const map = document.getElementById("map");

  canvas.width = map.clientWidth;
  canvas.height = map.clientHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();

  const start = positions[path[0]];
  ctx.moveTo(start.x, start.y);

  for (let i = 1; i < path.length; i++) {
    const from = positions[path[i - 1]];
    const to = positions[path[i]];
    ctx.lineTo(to.x, to.y);
    drawArrow(ctx, from.x, from.y, to.x, to.y);
  }

  ctx.strokeStyle = "blue";
  ctx.lineWidth = 4;
  ctx.stroke();
}

// Draw arrow on canvas
function drawArrow(ctx, fromx, fromy, tox, toy) {
  const headlen = 10;
  const dx = tox - fromx;
  const dy = toy - fromy;
  const angle = Math.atan2(dy, dx);

  ctx.moveTo(tox, toy);
  ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(tox, toy);
  ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
}

// Animate dot along path
function animateDot(path) {
  const canvas = document.getElementById("route-canvas");
  const ctx = canvas.getContext("2d");
  const map = document.getElementById("map");

  const dot = { x: positions[path[0]].x, y: positions[path[0]].y };
  let i = 1;

  function move() {
    if (i >= path.length) return;

    const start = positions[path[i - 1]];
    const end = positions[path[i]];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const steps = 20;
    let step = 0;

    const interval = setInterval(() => {
      if (step > steps) {
        clearInterval(interval);
        i++;
        move();
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawPath(path);

      const progress = step / steps;
      dot.x = start.x + dx * progress;
      dot.y = start.y + dy * progress;

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = "blue";
      ctx.fill();

      step++;
    }, 30);
  }

  move();
}

// Show text directions
function showDirections(path) {
  const list = document.getElementById("directions");

  for (let i = 1; i < path.length; i++) {
    const from = positions[path[i - 1]];
    const to = positions[path[i]];

    let dir = "Proceed";
    if (from.x === to.x && from.y !== to.y) {
      dir = to.y > from.y ? "Go Down" : "Go Up";
    } else if (from.y === to.y && from.x !== to.x) {
      dir = to.x > from.x ? "Go Right" : "Go Left";
    } else {
      dir = "Turn diagonally";
    }

    const li = document.createElement("li");
    li.innerText = `${dir} to ${path[i]}`;
    list.appendChild(li);
  }
}

//
// 🔽 ADDED BELOW: Handle user click to set current start location
//
document.getElementById("map").addEventListener("click", function (e) {
  const rect = this.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  let closestNode = "entrance";
  let minDist = Infinity;

  for (let node in positions) {
    const pos = positions[node];
    const dist = Math.hypot(pos.x - clickX, pos.y - clickY);
    if (dist < minDist) {
      minDist = dist;
      closestNode = node;
    }
  }

  currentStart = closestNode;
  console.log("Start location updated to:", currentStart);
});
