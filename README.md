# Project Overview

This project is a web-based game called "Digital Garden" where users can plant seeds, grow plants, and explore a virtual world. The game is built using HTML, CSS, and JavaScript with a PHP backend for user registration and login. The game uses a MongoDB database to store user information, game data, and plant growth stages.

## Files

### `register.php`
Handles user registration. It includes:
- Form validation for username and password.
- Checks for username length and profanity.
- Password strength validation.
- Inserts new user into the database.
- Starts a session for the registered user.

### `login.php`
Handles user login. It includes:
- Form validation for username and password.
- Checks if the user exists and verifies the password.
- Starts a session for the logged-in user.

### `index.php`
The main page of the game. It includes:
- Redirects to the login page if the user is not logged in.
- Displays the game interface with options to view the map, inventory, and logout.

### `get-user.php`
Fetches user information from the database. It includes:
- Returns the logged-in user's details such as username, actions left, and inventory.

### `get-game-data.php`
Handles game data requests. It includes:
- Generates random environment and lifeforms.
- Handles planting and updating seeds.
- Fetches game data for the current tile and surrounding tiles.

### `db.php`
Handles database connections. It includes:
- Connects to MongoDB using credentials from environment variables.
- Provides access to user and tile collections.

### `modules/utils.js`
Utility functions for the game. It includes:
- Functions to draw images with correct aspect ratios.
- Updates the action count displayed on the UI.

### `modules/map.js`
Handles the mini-map display. It includes:
- Initializes the mini-map canvas.
- Draws the mini-map with the user's current position and grid lines.

### `modules/inventory.js`
Handles the inventory display. It includes:
- Initializes the inventory canvas.
- Draws the inventory items and their quantities.
- Handles item selection.

### `modules/gameState.js`
Manages the game state. It includes:
- Stores user information, location, and game data.
- Fetches and processes game data.
- Initializes game components like the game canvas, inventory, and map.

### `modules/game.js`
Handles the main game display and interactions. It includes:
- Initializes the game canvas.
- Draws the tile view and world view.
- Handles user actions like planting seeds and updating plants.

### `modules/config.js`
Contains configuration constants. It includes:
- Game configuration settings like cell size and map dimensions.
- Geographic constants for tile calculations.
- API endpoints for fetching game data.

### `modules/api.js`
Handles API requests. It includes:
- Functions to update plant growth stages and plant seeds.
- Updates the user's action count and inventory after using a seed.