let gridSize = 25;
let userLatitude, userLongitude;
let seeds = [];
let geoLoaded = false;

// Get user's location.
window.onload = function () {
  navigator.geolocation.getCurrentPosition((position) => {
    userLatitude = position.coords.latitude;
    userLongitude = position.coords.longitude;
    geoLoaded = true;
    updateGridIndexDisplay();
  });
};

// p5.js setup function.
function setup() {
  // Wait until geolocation data is loaded before creating the canvas.
  if (geoLoaded) {
    let canvasSize = Math.floor(500 / gridSize) * gridSize;
    createCanvas(canvasSize, canvasSize);
    fetchNearbySeeds();
  } else {
    // If geolocation data is not yet available, try again shortly.
    setTimeout(setup, 100);
  }
}

// p5.js draw function.
function draw() {
  if (geoLoaded) {
    background(124, 252, 0);
    drawGrid();
    drawSeeds();
  }
}

function updateGridIndexDisplay() {
  const latIndex = Math.floor(userLatitude / 0.0135); // Calculate latitude index
  const lonIndex = Math.floor(userLongitude / 0.0135); // Calculate longitude index

  // Update the grid index div
  const gridIndexElement = document.getElementById("gridIndex");
  gridIndexElement.innerText = `[${latIndex}, ${lonIndex}]`; // Update the text
}

function drawGrid() {
  stroke(200);
  for (let x = 0; x < width; x += gridSize) {
    line(x, 0, x, height);
  }
  for (let y = 0; y < height; y += gridSize) {
    line(0, y, width, y);
  }
}

function mousePressed() {
  if (geoLoaded) {
    // Calculate the grid position where the seed should be placed.
    let gridX = Math.floor(mouseX / gridSize) * gridSize;
    let gridY = Math.floor(mouseY / gridSize) * gridSize;

    // Create a seed object without lat/lon, focusing only on grid placement.
    let newSeed = {
      x: gridX,
      y: gridY,
      state: 0,
    };

    // Send the new seed to the server.
    fetch(`data.php?lat=${userLatitude}&lon=${userLongitude}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newSeed),
    })
      .then((response) => response.json())
      .then((data) => {
        seeds = data.seeds;
      })
      .catch((error) => console.error("Error posting seed:", error));
  }
}

function drawSeeds() {
  noStroke();

  seeds.forEach((seed) => {
    // Set fill color based on seed state
    switch (seed.state) {
      case 0:
        fill(139, 69, 19);
        break; // Brown for state 0
      case 1:
        fill(255, 215, 0);
        break; // Gold for state 1
      case 2:
        fill(0, 255, 0);
        break; // Green for state 2
      case 3:
        fill(0, 0, 255);
        break; // Blue for state 3
      case 4:
        fill(255, 0, 0);
        break; // Red for state 4
      case 5:
        fill(128, 0, 128);
        break; // Purple for state 5
    }

    // Draw the seed
    rect(seed.x, seed.y, gridSize, gridSize); // Draw seeds the same size as grid cells
  });
}

function fetchNearbySeeds() {
  fetch(`data.php?lat=${userLatitude}&lon=${userLongitude}`)
    .then((response) => response.json())
    .then((data) => {
      seeds = data.seeds;
    })
    .catch((error) => console.error("Error fetching seeds:", error));
}
