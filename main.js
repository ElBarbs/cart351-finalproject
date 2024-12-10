import GameState from "./modules/gameState.js";

window.onload = () => {
  fetch("get-user.php", {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.response === "success") {
        GameState.user = data.user;
        document.getElementById("username").innerText = data.user.username;
        document.getElementById(
          "actions-count"
        ).innerText = `${data.user.actions}/3`;
        navigator.geolocation.getCurrentPosition(GameState.setUserLocation);
      }
    });

  document.getElementById("btnLogout").addEventListener("click", function () {
    fetch("index.php", {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.response === "success") {
          window.location.href = "/login.php";
        }
      });
  });
};
