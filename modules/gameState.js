import { GAME_CONFIG, GEO_CONSTANTS, API_ENDPOINTS } from "./config.js";
import { Game } from "./game.js";
import { Inventory } from "./inventory.js";
import { Map } from "./map.js";

const GameState = (() => {
  class GameState {
    constructor() {
      if (GameState.instance) {
        return GameState.instance;
      }

      this.user = {
        username: "",
        actions: 0,
        inventory: {},
      };
      this.selectedItem = null;

      this.userLocation = {
        longitude: null,
        latitude: null,
      };
      this.isTileView = true;

      this.tile = {
        coords: {
          x: 0,
          y: 0,
        },
        environment: [],
        lifeforms: [],
        seeds: [],
      };
      this.world = {};

      this.canvas = {
        game: null,
        inventory: null,
        map: null,
      };

      GameState.instance = this;
    }

    // Set the user's location and initialize the game state.
    setUserLocation = (position) => {
      this.userLocation.longitude = position.coords.longitude;
      this.userLocation.latitude = position.coords.latitude;

      this.tile.coords.x = Math.floor(
        this.userLocation.longitude / GEO_CONSTANTS.LONGITUDE_DIVISOR
      );
      this.tile.coords.y = Math.floor(
        this.userLocation.latitude / GEO_CONSTANTS.LATITUDE_DIVISOR
      );

      this.fetchWorldData().then(() => {
        this.canvas.game = new Game("game");
        this.canvas.inventory = new Inventory("inventory");
        this.canvas.map = new Map("map");

        console.log("Game state initialized:", this);
      });
    };

    // Load the assets are needed for the current tile.
    getTileAssets = (p) => {
      const assets = {};
      const allItems = [
        ...this.tile.environment,
        ...this.tile.seeds,
        ...this.tile.lifeforms,
        ...this.user.inventory,
      ];

      assets["grass_base"] = p.loadImage("assets/grass_base.png");
      allItems.forEach((item) => {
        assets[item.name] = p.loadImage(`assets/${item.name}.png`);
      });

      return assets;
    };

    // Fetch the game data for the current tile and the surrounding tiles.
    fetchWorldData = async () => {
      try {
        const response = await fetch(
          `${API_ENDPOINTS.GET_GAME_DATA}?lat=${this.userLocation.latitude}&lon=${this.userLocation.longitude}`,
          { method: "GET", headers: { "Content-Type": "application/json" } }
        );
        const data = await response.json();

        this.processWorldData(data, this.tile.coords.x, this.tile.coords.y);
      } catch (error) {
        console.error("Error fetching game data:", error);
      }
    };

    // Align the environments items to the grid and update the world state.
    processWorldData = (data, tileX, tileY) => {
      const currentTile = data[`${tileX}_${tileY}`] || {};

      this.tile.seeds = currentTile.seeds || [];

      this.tile.lifeforms = currentTile.lifeforms || [];

      this.tile.environment = (currentTile.environment || []).map((item) => ({
        ...item,
        x: Math.floor(item.x / GAME_CONFIG.CELL_SIZE) * GAME_CONFIG.CELL_SIZE,
        y: Math.floor(item.y / GAME_CONFIG.CELL_SIZE) * GAME_CONFIG.CELL_SIZE,
      }));

      Object.assign(this.world, data);
    };
  }

  return new GameState();
})();

export default GameState;
