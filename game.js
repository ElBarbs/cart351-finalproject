const cellSize = 24;
const miniMapWidth = 180;
const miniMapHeight = miniMapWidth / 2;

let userLatitude,
  userLongitude,
  user,
  selectedItem,
  geoLoaded = false,
  zoomedIn = true;
const clientData = { seeds: [], environment: [] };
const surroundingData = {};
const assets = {};

// P5.js instances.
let game, map, inventory;

// Initialize the application on window load.
window.onload = () => {
  fetch("get-user.php", {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.response === "success") {
        user = data.user;
        console.log(user);
        document.getElementById("username").innerText = user.username;
        document.getElementById(
          "actions-count"
        ).innerText = `${user.actions}/3`;
        navigator.geolocation.getCurrentPosition(initGame);
      }
    });

  document.getElementById("btnLogout").addEventListener("click", function () {
    fetch("index.php", {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.response === "success") {
          window.location.href = "/login.php";
        }
      });
  });
};

function initGame(position) {
  userLatitude = position.coords.latitude;
  userLongitude = position.coords.longitude;
  geoLoaded = true;
  // Initialize the game and map instances.
  game = new p5(setupGame, "game");
  map = new p5(setupMap, "map");
  inventory = new p5(setupInventory, "inventory");
}

function getUserTilePosition() {
  return [
    Math.floor(userLongitude / 0.0135),
    Math.floor(userLatitude / 0.0135),
  ];
}

async function fetchWorldData() {
  try {
    const response = await fetch(
      `get-game-data.php?lat=${userLatitude}&lon=${userLongitude}`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );
    const data = await response.json();
    const [lonIndex, latIndex] = getUserTilePosition();

    clientData.seeds = data[`${lonIndex}_${latIndex}`]?.seeds || [];
    data[`${lonIndex}_${latIndex}`]?.environment.forEach((item) => {
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
    const response = await fetch("get-game-data.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addSeed",
        lat: userLatitude,
        lon: userLongitude,
        seed: newSeed,
      }),
    });

    [userTileX, userTileY] = getUserTilePosition();
    clientData.seeds = await response.json();
    surroundingData[`${userTileX}_${userTileY}`].seeds = clientData.seeds;
  } catch (error) {
    console.error("Error adding seed: ", error);
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
      "potted_plant",
      "vine",
    ];

    assetNames.forEach((name) => {
      assets[name] = p.loadImage(`assets/${name}.png`, (img) =>
        scaleImage(img)
      );
    });
  };

  p.setup = () => {
    if (geoLoaded) {
      const canvasSize = Math.floor(320 / cellSize) * cellSize;
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
    p.cursor(p.ARROW);
    drawBackground();
    drawEnvironment();
    drawSeeds();
    drawCursor();
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

  function drawCursor() {
    const gridX = Math.floor(p.mouseX / cellSize) * cellSize;
    const gridY = Math.floor(p.mouseY / cellSize) * cellSize;

    if (
      gridX >= 0 &&
      gridX < p.width &&
      gridY >= 0 &&
      gridY < p.height &&
      selectedItem
    ) {
      p.cursor(p.HAND);
      p.image(assets[selectedItem], gridX, gridY, cellSize, cellSize);
    }
  }

  function drawWorldView() {
    const [userTileX, userTileY] = getUserTilePosition();
    const subCellSize = p.width / 3 / 14;

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const offsetX = p.width / 3 + dx * (p.width / 3);
        const offsetY = p.height / 3 + dy * (p.height / 3);

        // Draw user's current position border
        if (dx === 0 && dy === 0) drawHighlightBorder(offsetX, offsetY);

        // Retrieve and draw environment and seeds for each cell
        drawCellData(
          surroundingData[`${userTileX + dx}_${userTileY + dy}`] || {},
          offsetX,
          offsetY,
          subCellSize
        );
      }
    }
  }

  function drawHighlightBorder(x, y) {
    p.noFill();
    p.stroke("#475B63");
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

function setupMap(p) {
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
    p.strokeWeight(1);
    for (let i = 0; i <= miniMapWidth; i += miniMapWidth / 10) {
      p.line(miniMapX + i, miniMapY, miniMapX + i, miniMapY + miniMapHeight); // Vertical lines
    }
    for (let i = 0; i <= miniMapHeight; i += miniMapHeight / 10) {
      p.line(miniMapX, miniMapY + i, miniMapX + miniMapWidth, miniMapY + i); // Horizontal lines
    }

    // Highlight X and Y axes.
    p.stroke(0);
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
    const [lonIndex, latIndex] = getUserTilePosition();
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

function setupInventory(p) {
  p.setup = () => {
    p.createCanvas(200, 200);
  };

  p.draw = () => {
    p.background(255);
    drawInventory();
  };

  function drawInventory() {
    const inventoryX = 10;
    const inventoryY = 10;
    const inventoryWidth = p.width - 20;
    const inventoryHeight = p.height - 20;

    p.cursor(p.ARROW);

    p.fill(200, 200, 200, 150); // Semi-transparent background
    p.rect(inventoryX, inventoryY, inventoryWidth, inventoryHeight); // Draw inventory background

    function getItemIndex(index) {
      const itemX = inventoryX + 12.5 + (index % 5) * (cellSize + 17.5);
      const itemY = inventoryY + 15 + Math.floor(index / 5) * (cellSize + 10);
      return [itemX, itemY];
    }

    user.inventory.forEach((item, index) => {
      const [itemX, itemY] = getItemIndex(index);

      // Change cursor to hand when hovering over an item.
      if (
        p.mouseX > itemX &&
        p.mouseX < itemX + cellSize &&
        p.mouseY > itemY &&
        p.mouseY < itemY + cellSize
      ) {
        p.cursor(p.HAND);
      }

      // Highlight the selected item.
      if (selectedItem === item.type) {
        p.fill("#729b79");
        p.circle(itemX + cellSize / 2, itemY + cellSize / 2, cellSize + 15);
      }

      // Display image.
      p.noStroke();
      p.fill(0);
      p.image(assets[item.type], itemX, itemY, cellSize, cellSize);

      // Display small circle with quantity.
      p.fill("#2E2C2F");
      p.circle(itemX + cellSize, itemY + cellSize, 20);
      p.fill(255);
      p.textSize(12);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(item.quantity, itemX + cellSize, itemY + cellSize);
    });

    p.mousePressed = () => {
      user.inventory.forEach((item, index) => {
        const [itemX, itemY] = getItemIndex(index);

        // Check if the mouse is within the bounds of the item
        if (
          p.mouseX > itemX &&
          p.mouseX < itemX + cellSize &&
          p.mouseY > itemY &&
          p.mouseY < itemY + cellSize
        ) {
          if (selectedItem === item.type) {
            selectedItem = null;
          } else {
            selectedItem = item.type;
          }
        }
      });
    };
  }
}
