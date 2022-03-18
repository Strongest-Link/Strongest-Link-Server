const io = require("socket.io-client");
const http = require("http");
const ioBack = require("socket.io");

let socket;
let httpServer;
let httpServerAddr;
let ioServer;

beforeAll((done) => {
  httpServer = http.createServer().listen();
  httpServerAddr = httpServer.address();
  ioServer = ioBack(httpServer);
  done();
});

afterAll((done) => {
  ioServer.close();
  httpServer.close();
  done();
});

beforeEach((done) => {
  // Setup
  clientSocket = io.connect(`http://:${httpServerAddr.port}`, {
    "reconnection delay": 0,
    "reopen delay": 0,
    "force new connection": true,
    transports: ["websocket"]
  });
  socket.on("connect", () => {
    done();
  });
});

afterEach((done) => {
  // Cleanup
  if (socket.connected) {
    socket.disconnect();
  }
  done();
});

describe("basic socket tests", () => {
  test("should receive correct username", (done) => {
    serverSocket.on("setusername", (username) => {
      expect(username).toBe("steve");
      expect(serverSocket.username).toBe("steve");
      done();
    });
    clientSocket.emit("setusername", "steve");
  });

  test("should receive correct lobby name ", (done) => {
    serverSocket.on("joinroom", (lobbyName) => {
      expect(lobbyName).toBe("roomone");
      done();
    });
    clientSocket.emit("joinroom", "roomone");
  });

  test("should send appropriate message to a user when they join room", (done) => {
    clientSocket.on("game", (message) => {
      expect(message).toBe(`steve joined roomone`);
      done();
    });
    clientSocket.emit("setusername", "steve");
    clientSocket.emit("joinroom", "roomone");
  });
});
