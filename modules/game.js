import { GAME_CONFIG } from "./config.js";
import { updatePlant, plantSeed } from "./api.js";
import { drawImageWithRatio } from "./utils.js";
import GameState from "./gameState.js";

const CELL_SIZE = GAME_CONFIG.CELL_SIZE;

export class Game {
  constructor(containerID) {
    this.containerID = containerID;
    this.assets = {};
    this.p = null;

    this.initCanvas();
  }

  initCanvas = () => {
    this.p = new p5((p) => {
      p.preload = () => {
        this.assets = GameState.getTileAssets(p);
      };

      p.setup = () => {
        const canvasSize = Math.floor(320 / CELL_SIZE) * CELL_SIZE;
        p.createCanvas(canvasSize, canvasSize);
        document
          .getElementById("btnView")
          .addEventListener("click", () => this.toggleView());
      };

      p.draw = () => {
        p.background("#4C9557");
        GameState.isTileView ? this.drawTileView() : this.drawWorldView();
      };

      p.mousePressed = async () => {
        await this.doAction();
      };
    }, this.containerID);
  };

  toggleView = () => {
    GameState.isTileView = !GameState.isTileView;
    this.p.redraw();
  };

  drawTileView = () => {
    this.p.cursor(this.p.ARROW);
    this.drawBackground();
    this.drawEnvironment();
    this.drawPlants();
    this.drawLifeforms();
    this.drawCursor();
  };

  drawBackground = () => {
    const p = this.p;

    for (let x = 0; x < p.width; x += CELL_SIZE) {
      for (let y = 0; y < p.height; y += CELL_SIZE) {
        drawImageWithRatio(p, this.assets["grass_base"], x, y);
      }
    }
  };

  drawEnvironment = () => {
    GameState.tile.environment.forEach((item) => {
      const img = this.assets[item.name];
      drawImageWithRatio(this.p, img, item.x, item.y);
    });
  };

  drawPlants = () => {
    GameState.tile.seeds.forEach((seed) => {
      const img = this.assets[seed.name];
      drawImageWithRatio(this.p, img, seed.x, seed.y);
    });
  };

  drawLifeforms = () => {
    GameState.tile.lifeforms.forEach((lifeform) => {
      const img = this.assets[lifeform.name];
      drawImageWithRatio(
        this.p,
        img,
        lifeform.x,
        lifeform.y,
        CELL_SIZE * lifeform.resize
      );
    });
  };

  drawCursor = () => {
    const p = this.p;

    const gridX = Math.floor(this.p.mouseX / CELL_SIZE) * CELL_SIZE;
    const gridY = Math.floor(this.p.mouseY / CELL_SIZE) * CELL_SIZE;

    if (
      gridX >= 0 &&
      gridX < p.width &&
      gridY >= 0 &&
      gridY < p.height &&
      GameState.selectedItem
    ) {
      p.cursor(p.HAND);

      const img = this.assets[GameState.selectedItem.name];
      drawImageWithRatio(p, img, gridX, gridY);
    }
  };

  drawWorldView = () => {
    const p = this.p;
    const subCellSize = p.width / 3 / GAME_CONFIG.GRID_DIMENSION;

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const offsetX = this.p.width / 3 + dx * (p.width / 3);
        const offsetY = this.p.height / 3 + dy * (p.height / 3);

        // Draw user's current position border
        if (dx === 0 && dy === 0) this.drawHighlightBorder(offsetX, offsetY);

        // Retrieve and draw environment and seeds for each cell
        this.drawCellData(
          GameState.world[
            `${GameState.tile.coords.x + dx}_${GameState.tile.coords.y + dy}`
          ] || {},
          offsetX,
          offsetY,
          subCellSize
        );
      }
    }
  };

  drawHighlightBorder = (x, y) => {
    const p = this.p;
    p.noFill();
    p.stroke("#475B63");
    p.strokeWeight(1);
    p.rect(x, y, p.width / 3, p.height / 3);
  };

  getItemColor = (name) => {
    if (name.includes("rock")) return "#A9A9A9";
    if (name.includes("grass")) return "#228B22";
    if (name.includes("water")) return "#5D97E7";
    if (name.includes("seed")) return "#8B4513";
    return "#4C9557";
  };

  drawCellData = (cellData, offsetX, offsetY, subCellSize) => {
    cellData.environment?.forEach((item) =>
      this.drawItem(
        item,
        offsetX,
        offsetY,
        subCellSize,
        this.getItemColor(item.name)
      )
    );
    cellData.seeds?.forEach((seed) =>
      this.drawItem(
        seed,
        offsetX,
        offsetY,
        subCellSize,
        this.getItemColor(seed.name)
      )
    );
  };

  drawItem = (item, offsetX, offsetY, subCellSize, color) => {
    const p = this.p;

    const gridX = Math.floor(item.x / CELL_SIZE) * subCellSize;
    const gridY = Math.floor(item.y / CELL_SIZE) * subCellSize;
    const envX = offsetX + gridX;
    const envY = offsetY + gridY;

    p.noStroke();
    p.fill(color);
    p.rect(envX + subCellSize / 2 - 2.5, envY + subCellSize / 2 - 2.5, 5, 5);
  };

  doAction = async () => {
    const p = this.p;

    // Check if the cursor is within the canvas.
    if (
      !GameState.isTileView ||
      p.mouseX < 0 ||
      p.mouseX > p.width ||
      p.mouseY < 0 ||
      p.mouseY > p.height
    ) {
      return;
    }

    // Check if the cursor is on a seed or environment item.
    const gridX = Math.floor(p.mouseX / CELL_SIZE) * CELL_SIZE;
    const gridY = Math.floor(p.mouseY / CELL_SIZE) * CELL_SIZE;
    if (
      GameState.tile.seeds.some(
        (seed) =>
          seed.x === gridX && seed.y === gridY && seed.name.includes("seed")
      ) ||
      GameState.tile.environment.some(
        (item) => item.x === gridX && item.y === gridY
      )
    ) {
      return;
    }

    if (GameState.selectedItem.name === "seed" && GameState.user.actions > 0) {
      // If the seed is on a crop, add the seed to the crop.
      if (
        GameState.tile.seeds.some(
          (item) =>
            item.x === gridX &&
            item.y === gridY &&
            item.name === "small_crops_0"
        )
      ) {
        const crop = GameState.tile.seeds.find(
          (item) =>
            item.x === gridX &&
            item.y === gridY &&
            item.name === "small_crops_0"
        );

        crop.state++;
        crop.variant = GameState.selectedItem.variant;
        crop.name = `small_crops_${crop.state}`;
        if (!this.assets.hasOwnProperty(crop.name)) {
          this.assets[crop.name] = this.p.loadImage(`assets/${crop.name}.png`);
        }

        updatePlant(crop).then(() => {
          document.getElementById(
            "actions-count"
          ).innerText = `${GameState.user.actions}/3`;
        });
      } else {
        plantSeed({
          x: gridX,
          y: gridY,
          name: `${GameState.selectedItem.name}_${GameState.selectedItem.variant}${GameState.selectedItem.state}`,
          variant: GameState.selectedItem.variant,
          state: 0,
        }).then(() => {
          document.getElementById(
            "actions-count"
          ).innerText = `${GameState.user.actions}/3`;
        });
      }
    } else if (
      GameState.selectedItem.name === "small_crops_0" &&
      GameState.user.actions > 0
    ) {
      const newCrop = {
        x: gridX,
        y: gridY,
        name: GameState.selectedItem.name,
        variant: "",
        state: 0,
      };

      plantSeed(newCrop).then(() => {
        document.getElementById(
          "actions-count"
        ).innerText = `${GameState.user.actions}/3`;
      });
    }
  };
}
