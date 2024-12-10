import { GAME_CONFIG } from "./config.js";
import { drawImageWithRatio } from "./utils.js";
import GameState from "./gameState.js";

const CELL_SIZE = GAME_CONFIG.CELL_SIZE;

export class Inventory {
  constructor(containerID) {
    this.containerID = containerID;
    this.p = null;
    this.assets = {};

    this.initCanvas();
  }

  initCanvas = () => {
    this.p = new p5((p) => {
      p.preload = () => {
        GameState.user.inventory.forEach((item) => {
          this.assets[item.name] = p.loadImage(`assets/${item.name}.png`);
        });
      };

      p.setup = () => {
        p.createCanvas(200, 200);
      };

      p.draw = () => {
        p.background(255);
        this.drawInventory(p);
      };
    }, this.containerID);
  };

  getItemIndex = (index, inventoryX, inventoryY) => {
    const itemX = inventoryX + 12.5 + (index % 5) * (CELL_SIZE + 17.5);
    const itemY = inventoryY + 15 + Math.floor(index / 5) * (CELL_SIZE + 10);
    return [itemX, itemY];
  };

  drawInventory = (p) => {
    const inventoryX = 10;
    const inventoryY = 10;
    const inventoryWidth = p.width - 20;
    const inventoryHeight = p.height - 20;

    p.cursor(p.ARROW);

    p.fill(200, 200, 200, 150); // Semi-transparent background
    p.rect(inventoryX, inventoryY, inventoryWidth, inventoryHeight); // Draw inventory background

    GameState.user.inventory.forEach((item, index) => {
      const [itemX, itemY] = this.getItemIndex(index, inventoryX, inventoryY);

      // Change cursor to hand when hovering over an item.
      if (
        p.mouseX > itemX &&
        p.mouseX < itemX + CELL_SIZE &&
        p.mouseY > itemY &&
        p.mouseY < itemY + CELL_SIZE
      ) {
        p.cursor(p.HAND);
      }

      // Highlight the selected item.
      if (GameState.selectedItem && GameState.selectedItem.name === item.name) {
        p.fill("#729b79");
        p.circle(itemX + CELL_SIZE / 2, itemY + CELL_SIZE / 2, CELL_SIZE + 15);
      }

      // Display image.
      p.noStroke();
      p.fill(0);
      const img = this.assets[item.name];
      drawImageWithRatio(p, img, itemX, itemY);

      // Display small circle with quantity.
      p.fill("#2E2C2F");
      p.circle(itemX + CELL_SIZE, itemY + CELL_SIZE, 20);
      p.fill(255);
      p.textSize(12);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(item.quantity, itemX + CELL_SIZE, itemY + CELL_SIZE);
    });

    p.mousePressed = () => {
      GameState.user.inventory.forEach((item, index) => {
        const [itemX, itemY] = this.getItemIndex(index, inventoryX, inventoryY);

        // Check if the mouse is within the bounds of the item
        if (
          p.mouseX > itemX &&
          p.mouseX < itemX + CELL_SIZE &&
          p.mouseY > itemY &&
          p.mouseY < itemY + CELL_SIZE
        ) {
          if (
            GameState.selectedItem &&
            GameState.selectedItem.name === item.name
          ) {
            GameState.selectedItem = null;
          } else {
            GameState.selectedItem = item;
          }
        }
      });
    };
  };
}
