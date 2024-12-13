# Project Overview

This web-based game allows users to grow plants and manage a virtual garden tied to their real-world location on Earth.

The frontend is composed of HTML, CSS and JavaScript. The JavaScript library p5.js is used to render the game world and user interface components (inventory and map).

The backend utilized PHP, coupled with a MongoDB database. The database is hosted on MongoDB Atlas, making it easily accessible using the MongoDB PHP driver and a private URI stored in an .env file. The environment variable is loaded with the help of the “PHP dotenv” library. Composer was used to facilitate the installation and management of all the dependencies.


## Files

### `db.php`
Handles database connections:
- Connects to MongoDB using credentials from environment variables.
- Provides access to user and tile collections.

### `get-game-data.php`
Handles game data requests:
- Generates random environment and lifeforms.
- Handles planting and updating seeds.
- Fetches game data for the current tile and surrounding tiles.

### `get-user.php`
Fetches user information from the database:
- Returns the logged-in user's details such as username, actions left, and inventory.

### `head.php`
Includes the HTML head section:
- Meta tags for character set and viewport.
- Links to Google Fonts and the stylesheet.
- Includes the favicon.
- Conditionally includes scripts for the main page.

### `header.php`
Includes the HTML header section:
- A link to the home page with the project title.

### `index.php`
The main page of the game:
- Redirects to the login page if the user is not logged in.
- Displays the game interface with options to view the map, inventory, and logout.

### `login.php`
Handles user login:
- Form validation for username and password.
- Checks if the user exists and verifies the password.
- Starts a session for the logged-in user.

### `path.php`
Determines the base path of the project:
- Detects the protocol (HTTP or HTTPS).
- Gets the host and script path.
- Normalizes the path and ensures it has a trailing slash.
- Sets the `$BASE_PATH` variable.

### `register.php`
Handles user registration:
- Form validation for username and password.
- Checks for username length and profanity.
- Password strength validation.
- Inserts new user into the database.
- Starts a session for the registered user.

### `modules/api.js`
Handles API requests:
- Functions to update plant growth stages and plant seeds.
- Updates the user's action count and inventory after using a seed.

### `modules/config.js`
Contains configuration constants:
- Game configuration settings like cell size and map dimensions.
- Geographic constants for tile calculations.
- API endpoints for fetching game data.

### `modules/game.js`
Handles the main game display and interactions:
- Initializes the game canvas.
- Draws the tile view and world view.
- Handles user actions like planting seeds and updating plants.

### `modules/gameState.js`
Manages the game state:
- Stores user information, location, and game data.

### `modules/inventory.js`
Handles the inventory display:
- Initializes the inventory canvas.
- Draws the inventory items and their quantities.
- Handles item selection.

### `modules/map.js`
Handles the mini-map display:
- Initializes the mini-map canvas.
- Draws the mini-map with the user's current position.

### `modules/utils.js`
Utility functions for the game:
- Function to draw images with correct aspect ratios.
- Function to update the action count displayed on the UI.