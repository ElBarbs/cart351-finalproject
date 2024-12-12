# Project Overview

This web-based game allows users to grow plants and manage a virtual garden tied to their real-world location on Earth. It leverages HTML, CSS, and JavaScript for the frontend, with a PHP backend. A MongoDB Atlas database is used to store user information and game data. P5.js is utilized to render the game world and user interface components.

## Files

### `register.php`
Handles user registration.
- Form validation for username and password.
- Checks for username length and profanity.
- Password strength validation.
- Inserts new user into the database.
- Starts a session for the registered user.

### `login.php`
Handles user login.
- Form validation for username and password.
- Checks if the user exists and verifies the password.
- Starts a session for the logged-in user.

### `index.php`
The main page of the game.
- Redirects to the login page if the user is not logged in.
- Displays the game interface with options to view the map, inventory, and logout.

### `get-user.php`
Fetches user information from the database.
- Returns the logged-in user's details such as username, actions left, and inventory.

### `get-game-data.php`
Handles game data requests.
- Generates random environment and lifeforms.
- Handles planting and updating seeds.
- Fetches game data for the current tile and surrounding tiles.

### `db.php`
Handles database connections.
- Connects to MongoDB using credentials from environment variables.
- Provides access to user and tile collections.

### `modules/utils.js`
Utility functions for the game.
- Functions to draw images with correct aspect ratios.
- Updates the action count displayed on the UI.

### `modules/map.js`
Handles the mini-map display.
- Initializes the mini-map canvas.
- Draws the mini-map with the user's current position and grid lines.

### `modules/inventory.js`
Handles the inventory display.
- Initializes the inventory canvas.
- Draws the inventory items and their quantities.
- Handles item selection.

### `modules/gameState.js`
Manages the game state.
- Stores user information, location, and game data.
- Fetches and processes game data.
- Initializes game components like the game canvas, inventory, and map.

### `modules/game.js`
Handles the main game display and interactions.
- Initializes the game canvas.
- Draws the tile view and world view.
- Handles user actions like planting seeds and updating plants.

### `modules/config.js`
Contains configuration constants.
- Game configuration settings like cell size and map dimensions.
- Geographic constants for tile calculations.
- API endpoints for fetching game data.

### `modules/api.js`
Handles API requests. It includes:
- Functions to update plant growth stages and plant seeds.
- Updates the user's action count and inventory after using a seed.
