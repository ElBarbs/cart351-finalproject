import GameState from "./modules/gameState.js";
import { updateActionCount } from "./modules/utils.js";

window.onload = () => {
  const basePath = window.location.pathname.replace(/\/[^/]*$/, "");

  fetch(`${basePath}/get-user.php`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.response === "success") {
        // When the user is logged in, set the user data in the GameState.
        GameState.user = data.user;

        // Update the user information in the UI.
        document.getElementById("username").innerText = data.user.username;
        updateActionCount();

        // Get the user location and initialize the game.
        navigator.geolocation.getCurrentPosition(GameState.setUserLocation);
      }
    });

  document.getElementById("btnLogout").addEventListener("click", function () {
    fetch(`${basePath}/index.php`, {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.response === "success") {
          // Redirect to the login page.
          window.location.href = `${basePath}/login.php`;
        }
      });
  });
};
