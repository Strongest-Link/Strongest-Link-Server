const express = require("express");
const app = express();
const cors = require("cors");
const { createServer } = require("http");
const server = createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: ["http://localhost:3000", "https://strongest-link.netlify.app/"]
  }
});
global.io = io;

const gameRoutes = require("./routes/gamesRoutes");
const gameController = require("./controller/gameController");
app.use(cors());
app.use(express.json());
app.use("/games", gameRoutes);
app.get("/", (req, res) => {
  res.send("server is up and running :)");
});

io.on("connection", (socket) => {
  socket.on("startgame", async ({ lobbyName, roomId }) => {
    const game = await gameController.startGame(roomId);
    io.to(lobbyName).emit("game", game);
  });

  socket.on("setusername", (username) => {
    socket.username = username;
  });

  socket.on("joinroom", (lobbyName) => {
    socket.join(`${lobbyName}`);
    io.to(lobbyName).emit("joinroom", socket.username);
  });

  socket.on("answer", async ({ lobbyName, roomId, answer }) => {
    const response = await gameController.makeTurn(
      roomId,
      socket.username,
      decodeURIComponent(answer)
    );
    io.to(socket.id).emit("response", { response });
    if (response != "It's not your turn.") {
      socket.to(lobbyName).emit("next", { response });
    }
  });
});

module.exports = server;
