import GameState from "./gameState.js";
import { GAME_CONFIG } from "./config.js";

const MAP_WIDTH = GAME_CONFIG.MAP_WIDTH;
const MAP_HEIGHT = GAME_CONFIG.MAP_HEIGHT;

export class Map {
  constructor(containerID) {
    this.containerID = containerID;
    this.p = null;

    this.initCanvas();
  }

  initCanvas = () => {
    this.p = new p5((p) => {
      p.setup = () => {
        p.createCanvas(200, 135);
      };

      p.draw = () => {
        p.background(255);
        this.drawMiniMap(p);
      };
    }, this.containerID);
  };

  drawMiniMap = (p) => {
    const mapX = (p.width - MAP_WIDTH) / 2;
    const mapY = 10;

    p.fill(200, 200, 200, 150);
    p.rect(mapX, mapY, MAP_WIDTH, MAP_HEIGHT);

    const mapLongitudeRange = 360; // Total longitude range (from -180 to 180).
    const mapLatitudeRange = 180; // Total latitude range (from -90 to 90).

    // Calculate user's position on the mini-map.
    const mapUserX =
      mapX +
      ((GameState.userLocation.longitude + 180) / mapLongitudeRange) *
        MAP_WIDTH;
    const mapUserY =
      mapY +
      ((90 - GameState.userLocation.latitude) / mapLatitudeRange) * MAP_HEIGHT;

    // Draw grid lines on the mini-map for better orientation.
    p.stroke(150);
    p.strokeWeight(1);
    for (let i = 0; i <= MAP_WIDTH; i += MAP_WIDTH / 10) {
      p.line(mapX + i, mapY, mapX + i, mapY + MAP_HEIGHT); // Vertical lines.
    }
    for (let i = 0; i <= MAP_HEIGHT; i += MAP_HEIGHT / 10) {
      p.line(mapX, mapY + i, mapX + MAP_WIDTH, mapY + i); // Horizontal lines.
    }

    // Highlight X and Y axes.
    p.stroke(0);
    p.line(
      mapX,
      mapY + MAP_HEIGHT / 2,
      mapX + MAP_WIDTH,
      mapY + MAP_HEIGHT / 2
    );
    p.line(mapX + MAP_WIDTH / 2, mapY, mapX + MAP_WIDTH / 2, mapY + MAP_HEIGHT);

    // Draw user's current position on the mini-map.
    p.noStroke();
    p.fill(255, 0, 0);
    p.ellipse(mapUserX, mapUserY, 6);

    // Draw position coordinates.
    p.fill(0);
    p.textSize(14);
    p.textAlign(p.CENTER, p.CENTER);
    p.text(
      `(${GameState.tile.coords.x}, ${GameState.tile.coords.y})`,
      mapX + MAP_WIDTH / 2,
      mapY + MAP_HEIGHT + 15
    );
  };
}
