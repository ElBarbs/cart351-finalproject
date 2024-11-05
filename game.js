const cellSize = 35;
let userLatitude,
  userLongitude,
  geoLoaded = false,
  zoomedIn = true;
const clientData = { seeds: [], environment: [] };
const surroundingData = {};
const assets = {};

// Initialize the application on window load
window.onload = () => {
  navigator.geolocation.getCurrentPosition(initLocation);
  setupAssets();
  document.getElementById("btnView").addEventListener("click", toggleView);
};

// Initialize user's location and set up the grid
function initLocation(position) {
  userLatitude = position.coords.latitude;
  userLongitude = position.coords.longitude;
  geoLoaded = true;
  updateGridIndexDisplay();
}

// p5.js setup function with delayed execution until geolocation is loaded
function setup() {
  if (geoLoaded) {
    const canvasSize = Math.floor(500 / cellSize) * cellSize;
    createCanvas(canvasSize, canvasSize);
    fetchWorldData();
  } else {
    setTimeout(setup, 100);
  }
}

// Toggle between zoomed-in and world view
function toggleView() {
  zoomedIn = !zoomedIn;
  document.getElementById("btnView").innerText = zoomedIn
    ? "World View"
    : "Current Grid";
  redraw();
}

// p5.js draw function
function draw() {
  if (geoLoaded) {
    background("#4C9557");
    zoomedIn ? drawZoomedView() : drawWorldView();
  }
}

// Draw zoomed view of environment and seeds
function drawZoomedView() {
  drawBackground();
  drawEnvironment();
  drawSeeds();
}

// Draw world view with scaled grid and surrounding data
function drawWorldView() {
  const [userGridX, userGridY] = getUserGridPosition();
  const subCellSize = width / 3 / 14;

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const offsetX = width / 3 + dx * (width / 3);
      const offsetY = height / 3 + dy * (height / 3);

      // Draw user's current position border
      if (dx === 0 && dy === 0) drawHighlightBorder(offsetX, offsetY);

      // Retrieve and draw environment and seeds for each cell
      drawCellData(
        surroundingData[`grid_${userGridX + dx}_${userGridY + dy}`] || {},
        offsetX,
        offsetY,
        subCellSize
      );
    }
  }
}

// Highlight the user's current grid position
function drawHighlightBorder(x, y) {
  noFill();
  stroke(255, 0, 0);
  strokeWeight(1);
  rect(x, y, width / 3, height / 3);
  noStroke();
}

// Draw environment and seeds within each main grid cell
function drawCellData(cellData, offsetX, offsetY, subCellSize) {
  cellData.environment?.forEach((item) =>
    drawItem(
      item,
      offsetX,
      offsetY,
      subCellSize,
      item.type.includes("rock") ? "#A9A9A9" : "#228B22"
    )
  );
  cellData.seeds?.forEach((seed) =>
    drawItem(seed, offsetX, offsetY, subCellSize, "#8B4513")
  );
}

// Draw individual item (seed or environment) in the subgrid
// Draw individual item (seed or environment) in the subgrid
function drawItem(item, offsetX, offsetY, subCellSize, color) {
  // Calculate the position of the item, snapping it to the nearest grid position
  const gridX = Math.floor(item.x / cellSize) * subCellSize;
  const gridY = Math.floor(item.y / cellSize) * subCellSize;

  // Calculate the final position with the offset applied
  const envX = offsetX + gridX;
  const envY = offsetY + gridY;

  fill(color);
  rect(envX + subCellSize / 2 - 2.5, envY + subCellSize / 2 - 2.5, 5, 5);
}

// Load and scale images for assets
function setupAssets() {
  const assetNames = [
    "rock_0",
    "small_rocks",
    "crops_0",
    "crops_1",
    "crops_2",
    "grass_base",
    "grass_0",
    "grass_1",
    "grass_2",
    "grass_3",
    "grass_4",
  ];
  assetNames.forEach(
    (name) => (assets[name] = loadImage(`assets/${name}.png`, scaleImage))
  );
}

function scaleImage(img) {
  const scale = cellSize / Math.max(img.width, img.height);
  img.resize(scale * img.width, scale * img.height);
}

// Fetch world data from the server
async function fetchWorldData() {
  try {
    const response = await fetch(
      `data.php?lat=${userLatitude}&lon=${userLongitude}`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );
    const data = await response.json();
    const [lonIndex, latIndex] = getUserGridPosition();

    clientData.seeds = data[`grid_${lonIndex}_${latIndex}`]?.seeds || [];
    data[`grid_${lonIndex}_${latIndex}`]?.environment.forEach((item) => {
      item.x = Math.floor(item.x / cellSize) * cellSize;
      item.y = Math.floor(item.y / cellSize) * cellSize;
      item.img = assets[item.type];
      clientData.environment.push(item);
    });
    Object.assign(surroundingData, data);
  } catch (error) {
    console.error("Error fetching seeds:", error);
  }
}

// Helper to get user's grid position based on geolocation
function getUserGridPosition() {
  return [
    Math.floor(userLongitude / 0.0135),
    Math.floor(userLatitude / 0.0135),
  ];
}

// Update the grid index display on the UI
function updateGridIndexDisplay() {
  const [lonIndex, latIndex] = getUserGridPosition();
  document.getElementById("gridIndex").innerText = `[${lonIndex}, ${latIndex}]`;
}

// Draw background grid of grass base
function drawBackground() {
  for (let x = 0; x < width; x += cellSize) {
    for (let y = 0; y < height; y += cellSize) {
      image(assets["grass_base"], x, y, cellSize, cellSize);
    }
  }
}

// Draw seeds in their respective positions
function drawSeeds() {
  clientData.seeds.forEach((seed) => {
    image(assets[`crops_${seed.state}`], seed.x, seed.y, cellSize, cellSize);
  });
}

// Draw environment items based on coordinates
function drawEnvironment() {
  clientData.environment.forEach((item) => {
    image(item.img, item.x, item.y);
  });
}

// Add a new seed on mouse press if in zoomed view
function mousePressed() {
  if (
    !geoLoaded ||
    !zoomedIn ||
    mouseX < 0 ||
    mouseX > width ||
    mouseY < 0 ||
    mouseY > height
  )
    return;

  const gridX = Math.floor(mouseX / cellSize) * cellSize;
  const gridY = Math.floor(mouseY / cellSize) * cellSize;
  if (
    clientData.seeds.some((seed) => seed.x === gridX && seed.y === gridY) ||
    clientData.environment.some((item) => item.x === gridX && item.y === gridY)
  )
    return;

  addSeed({ x: gridX, y: gridY, state: 0 });
}

// Add a new seed to the database
async function addSeed(newSeed) {
  try {
    const response = await fetch(
      `data.php?lat=${userLatitude}&lon=${userLongitude}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSeed),
      }
    );
    clientData.seeds = await response.json();
  } catch (error) {
    console.error("Error posting seed:", error);
  }
}
