import { API_ENDPOINTS } from "./config.js";
import GameState from "./gameState.js";

// Update the plant's growth stage.
export async function updatePlant(seed) {
  try {
    if (GameState.user.actions <= 0) {
      return;
    }

    await fetch(API_ENDPOINTS.GET_GAME_DATA, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updatePlant",
        lat: GameState.userLocation.latitude,
        lon: GameState.userLocation.longitude,
        seed: seed,
        username: GameState.user.username,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        useSeed(data);
        return data.seeds;
      });
  } catch (error) {
    console.error("Error updating seed: ", error);
  }
}

// Plant a seed in the game.
export async function plantSeed(seed) {
  try {
    if (GameState.user.actions <= 0) {
      return;
    }

    await fetch(API_ENDPOINTS.GET_GAME_DATA, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "plantSeed",
        lat: GameState.userLocation.latitude,
        lon: GameState.userLocation.longitude,
        seed: seed,
        username: GameState.user.username,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        useSeed(data);
        return data.seeds;
      });
  } catch (error) {
    console.error("Error adding seed: ", error);
  }
}

// Update the user's action count and inventory after using a seed.
function useSeed(data) {
  GameState.user.actions--;

  const inventoryItem = GameState.user.inventory.find(
    (item) => item.name === GameState.selectedItem.name
  );

  inventoryItem.quantity--;
  if (inventoryItem.quantity == 0) {
    GameState.user.inventory = GameState.user.inventory.filter(
      (item) => item.name !== GameState.selectedItem.name
    );
    GameState.selectedItem = null;
  }

  GameState.tile.seeds = data.seeds;
  GameState.world[
    `${GameState.tile.coords.x}_${GameState.tile.coords.y}`
  ].seeds = data.seeds;
}
