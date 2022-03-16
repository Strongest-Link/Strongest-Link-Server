const gameController = require("../../../controller/gameController");
const Game = require("../../../models/Game");

const mockSend = jest.fn();
const mockJson = jest.fn();
const mockStatus = jest.fn(code => ({
    send: mockSend, json: mockJson
}));
const mockRes = { status: mockStatus };

describe("game controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("leaderboard", () => {
        const mockLeaderboardData = [{}, {}, {}, {}];

        it("returns leaderboard data with status 200", async () => {
            jest.spyOn(Game, "leaderboard", "get").mockResolvedValueOnce(mockLeaderboardData);
            await gameController.leaderboard(null, mockRes);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(mockLeaderboardData);
        });

        it("returns error with status 500 on failed request", async () => {
            jest.spyOn(Game, "leaderboard", "get").mockRejectedValueOnce(new Error());
            await gameController.leaderboard(null, mockRes);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith(new Error());
        });
    });

    describe("index", () => {
        const mockGamesData = [{}, {}, {}, {}];

        it("returns games data with status 200", async () => {
            jest.spyOn(Game, "all", "get").mockResolvedValueOnce(mockGamesData);
            await gameController.index(null, mockRes);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(mockGamesData);
        });

        it("returns error with status 500 on failed request", async () => {
            jest.spyOn(Game, "all", "get").mockRejectedValueOnce(new Error());
            await gameController.index(null, mockRes);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith(new Error());
        });
    });

    describe("create", () => {
        const mockReq = {
            body: {
                name: "test_room",
                host: "test_user",
                options: {}
            }
        };

        it("returns game data with status 201", async () => {
            jest.spyOn(Game, "createGame")
            .mockImplementationOnce((name, host, options) => {
                return new Promise((resolve, reject) => {
                    resolve({ name, host, options })
                });
            });
            await gameController.create(mockReq, mockRes);
            expect(Game.createGame).toHaveBeenCalledWith(mockReq.body.name, mockReq.body.host, mockReq.body.options);
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith(mockReq.body);
        });

        it("returns error with status 500 on failed request", async () => {
            jest.spyOn(Game, "createGame").mockRejectedValueOnce(new Error());
            await gameController.create(mockReq, mockRes);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith(new Error());
        });
    });

    describe("join", () => {
        const mockReq = {
            body: { username: "test_user" },
            params: { id: 0 }
        };

        const mockGame = new Game({players: ["test_host"]});

        it("returns game data with status 200", async () => {
            jest.spyOn(Game, "findById").mockResolvedValueOnce(mockGame);
            jest.spyOn(Game.prototype, "joinGame").mockResolvedValueOnce(mockGame);
            await gameController.join(mockReq, mockRes);
            expect(Game.findById).toHaveBeenCalledWith(0);
            expect(mockGame.joinGame).toHaveBeenCalledWith("test_user");
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(mockGame);
        });

        it("returns error with status 404 if game doesn't exist", async () => {
            jest.spyOn(Game, "findById").mockRejectedValueOnce(new Error());
            await gameController.join(mockReq, mockRes);
            expect(Game.findById).toHaveBeenCalledWith(0);
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith(new Error());
        });

        it("returns error with status 500 if game exists but can't be joined", async () => {
            jest.spyOn(Game, "findById").mockResolvedValueOnce(mockGame);
            jest.spyOn(Game.prototype, "joinGame").mockRejectedValueOnce(new Error());
            await gameController.join(mockReq, mockRes);
            expect(Game.findById).toHaveBeenCalledWith(0);
            expect(mockGame.joinGame).toHaveBeenCalledWith("test_user");
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith(new Error());
        });
    });

    describe("restart", () => {
        const mockReq = {
            params: { id: 0 }
        };

        const mockGame = new Game({});

        it("returns game data with status 200", async () => {
            jest.spyOn(Game, "findById").mockResolvedValueOnce(mockGame);
            jest.spyOn(Game.prototype, "startGame").mockImplementationOnce(jest.fn);
            await gameController.restart(mockReq, mockRes);
            expect(Game.findById).toHaveBeenCalledWith(0);
            expect(mockGame.startGame).toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(mockGame);
        });

        it("returns error with status 404 if game doesn't exist", async () => {
            jest.spyOn(Game, "findById").mockRejectedValueOnce(new Error());
            await gameController.restart(mockReq, mockRes);
            expect(Game.findById).toHaveBeenCalledWith(0);
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith(new Error());
        });

        it("returns error with status 500 if game exists but can't be restarted", async () => {
            jest.spyOn(Game, "findById").mockResolvedValueOnce(mockGame);
            jest.spyOn(Game.prototype, "startGame").mockRejectedValueOnce(new Error());
            await gameController.restart(mockReq, mockRes);
            expect(Game.findById).toHaveBeenCalledWith(0);
            expect(mockGame.startGame).toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith(new Error());
        });
    });

    describe("delete", () => {
        const mockReq = {
            params: { id: 0 }
        };

        const mockGame = new Game({});

        it("returns with status 204", async () => {
            jest.spyOn(Game, "findById").mockResolvedValueOnce(mockGame);
            jest.spyOn(Game.prototype, "delete").mockImplementationOnce(jest.fn);
            await gameController.deleteGame(mockReq, mockRes);
            expect(Game.findById).toHaveBeenCalledWith(0);
            expect(mockGame.delete).toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(204);
            expect(mockSend).toHaveBeenCalled();
        });

        it("returns error with status 404 if game doesn't exist", async () => {
            jest.spyOn(Game, "findById").mockRejectedValueOnce(new Error());
            await gameController.deleteGame(mockReq, mockRes);
            expect(Game.findById).toHaveBeenCalledWith(0);
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith(new Error());
        });

        it("returns error with status 500 if game exists but can't be deleted", async () => {
            jest.spyOn(Game, "findById").mockResolvedValueOnce(mockGame);
            jest.spyOn(Game.prototype, "delete").mockRejectedValueOnce(new Error());
            await gameController.deleteGame(mockReq, mockRes);
            expect(Game.findById).toHaveBeenCalledWith(0);
            expect(mockGame.delete).toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith(new Error());
        });
    });
});
