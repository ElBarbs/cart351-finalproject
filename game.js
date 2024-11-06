const cellSize = 35;
const miniMapWidth = 180;
const miniMapHeight = miniMapWidth / 2;

let userLatitude,
  userLongitude,
  geoLoaded = false,
  zoomedIn = true;
const clientData = { seeds: [], environment: [] };
const surroundingData = {};
const assets = {};

// P5.js instances for the game and UI.
let game, ui;

// Initialize the application on window load.
window.onload = () => {
  navigator.geolocation.getCurrentPosition(initLocation);
};

function initLocation(position) {
  userLatitude = position.coords.latitude;
  userLongitude = position.coords.longitude;
  geoLoaded = true;
  // Initialize the game and UI instances.
  game = new p5(setupGame, "game");
  ui = new p5(setupUI, "ui");
}

function getUserGridPosition() {
  return [
    Math.floor(userLongitude / 0.0135),
    Math.floor(userLatitude / 0.0135),
  ];
}

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
    [lonIndex, latIndex] = getUserGridPosition();
    clientData.seeds = await response.json();
    surroundingData[`grid_${lonIndex}_${latIndex}`].seeds = clientData.seeds;
  } catch (error) {
    console.error("Error posting seed:", error);
  }
}

function setupGame(p) {
  p.preload = () => {
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

    assetNames.forEach((name) => {
      assets[name] = p.loadImage(`assets/${name}.png`, (img) =>
        scaleImage(img)
      );
    });
  };

  p.setup = () => {
    if (geoLoaded) {
      const canvasSize = Math.floor(500 / cellSize) * cellSize;
      p.createCanvas(canvasSize, canvasSize);
      fetchWorldData();
      document
        .getElementById("btnView")
        .addEventListener("click", () => toggleView());
    } else {
      setTimeout(() => setupGame(), 100);
    }
  };

  p.draw = () => {
    if (geoLoaded) {
      p.background("#4C9557");
      zoomedIn ? drawZoomedView() : drawWorldView();
    }
  };

  function toggleView() {
    zoomedIn = !zoomedIn;
    p.redraw();
  }

  function drawZoomedView() {
    drawBackground();
    drawEnvironment();
    drawSeeds();
  }

  function drawBackground() {
    for (let x = 0; x < p.width; x += cellSize) {
      for (let y = 0; y < p.height; y += cellSize) {
        p.image(assets["grass_base"], x, y, cellSize, cellSize);
      }
    }
  }

  function drawEnvironment() {
    clientData.environment.forEach((item) => {
      p.image(item.img, item.x, item.y);
    });
  }

  function drawSeeds() {
    clientData.seeds.forEach((seed) => {
      p.image(
        assets[`crops_${seed.state}`],
        seed.x,
        seed.y,
        cellSize,
        cellSize
      );
    });
  }

  function drawWorldView() {
    const [userGridX, userGridY] = getUserGridPosition();
    const subCellSize = p.width / 3 / 14;

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const offsetX = p.width / 3 + dx * (p.width / 3);
        const offsetY = p.height / 3 + dy * (p.height / 3);

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

  function drawHighlightBorder(x, y) {
    p.noFill();
    p.stroke(255, 0, 0);
    p.strokeWeight(1);
    p.rect(x, y, p.width / 3, p.height / 3);
  }

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

  function drawItem(item, offsetX, offsetY, subCellSize, color) {
    const gridX = Math.floor(item.x / cellSize) * subCellSize;
    const gridY = Math.floor(item.y / cellSize) * subCellSize;
    const envX = offsetX + gridX;
    const envY = offsetY + gridY;

    p.noStroke();
    p.fill(color);
    p.rect(envX + subCellSize / 2 - 2.5, envY + subCellSize / 2 - 2.5, 5, 5);
  }

  function scaleImage(img) {
    const scale = cellSize / Math.max(img.width, img.height);
    img.resize(scale * img.width, scale * img.height);
  }

  p.mousePressed = () => {
    if (
      !geoLoaded ||
      !zoomedIn ||
      p.mouseX < 0 ||
      p.mouseX > p.width ||
      p.mouseY < 0 ||
      p.mouseY > p.height
    )
      return;

    const gridX = Math.floor(p.mouseX / cellSize) * cellSize;
    const gridY = Math.floor(p.mouseY / cellSize) * cellSize;
    if (
      clientData.seeds.some((seed) => seed.x === gridX && seed.y === gridY) ||
      clientData.environment.some(
        (item) => item.x === gridX && item.y === gridY
      )
    )
      return;

    addSeed({ x: gridX, y: gridY, state: 0 });
  };
}

function setupUI(p) {
  p.setup = () => {
    p.createCanvas(200, 135);
  };

  p.draw = () => {
    p.background(255);
    drawMiniMap();
  };

  function drawMiniMap() {
    const miniMapX = (p.width - miniMapWidth) / 2; // Center horizontally
    const miniMapY = 10;

    p.fill(200, 200, 200, 150); // Semi-transparent background
    p.rect(miniMapX, miniMapY, miniMapWidth, miniMapHeight); // Draw mini-map background

    const miniMapLongitudeRange = 360; // Total longitude range (from -180 to 180)
    const miniMapLatitudeRange = 180; // Total latitude range (from -90 to 90)

    // Calculate user's position on the mini-map.
    const miniMapUserX =
      miniMapX + ((userLongitude + 180) / miniMapLongitudeRange) * miniMapWidth; // Convert longitude to mini-map X
    const miniMapUserY =
      miniMapY + ((90 - userLatitude) / miniMapLatitudeRange) * miniMapHeight; // Convert latitude to mini-map Y

    // Draw grid lines on the mini-map for better orientation.
    p.stroke(150);
    for (let i = 0; i <= miniMapWidth; i += miniMapWidth / 10) {
      p.line(miniMapX + i, miniMapY, miniMapX + i, miniMapY + miniMapHeight); // Vertical lines
    }
    for (let i = 0; i <= miniMapHeight; i += miniMapHeight / 10) {
      p.line(miniMapX, miniMapY + i, miniMapX + miniMapWidth, miniMapY + i); // Horizontal lines
    }

    // Highlight X and Y axes.
    p.stroke(0);
    p.strokeWeight(2);
    p.line(
      miniMapX,
      miniMapY + miniMapHeight / 2,
      miniMapX + miniMapWidth,
      miniMapY + miniMapHeight / 2
    );
    p.line(
      miniMapX + miniMapWidth / 2,
      miniMapY,
      miniMapX + miniMapWidth / 2,
      miniMapY + miniMapHeight
    );

    // Draw user's current position on the mini-map.
    p.noStroke();
    p.fill(255, 0, 0);
    p.ellipse(miniMapUserX, miniMapUserY, 6);

    // Draw position coordinates.
    const [lonIndex, latIndex] = getUserGridPosition();
    p.fill(0);
    p.textSize(14);
    p.textAlign(p.CENTER, p.CENTER); // Center the text
    p.text(
      `(${lonIndex}, ${latIndex})`,
      miniMapX + miniMapWidth / 2,
      miniMapY + miniMapHeight + 15
    );
  }
}
