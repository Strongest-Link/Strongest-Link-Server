const Client = require("socket.io-client");

describe("games server", () => {
    const testGame = {
        name: "test_room",
        host: "test_user",
        options: {
            category: 9,
            level: "medium",
            totalQuestions: 5
        }
    };

    let api, clientSocket = [], token, questions;

    beforeAll((done) => {
        api = app.listen(port, () => {
            console.log(`Test server running on port ${port}`);
            clientSocket = [new Client(`http://localhost:${port}`)];
            clientSocket[0].on("connect", () => {
                console.log("Client socket connected.");
                clientSocket[1] = new Client(`http://localhost:${port}`);
                clientSocket[1].on("connect", () => {
                    console.log("Second client socket connected.");
                    resetTestDB().then((msg) => {
                        console.log(msg);
                        done();
                    });
                });
            });
        });
    });

    afterAll(async () => {
        console.log("Closing client socket connections");
        clientSocket[0].close();
        clientSocket[1].close();
        console.log("Gracefully stopping test server");
        await api.close();
    });

    describe("GET /games/leaderboard", () => {
        it("returns leaderboard in descending order", (done) => {
            request(api)
            .get("/games/leaderboard")
            .expect(200)
            .expect([
                { id: 2, name: "test_user1", highscore: 3 },
                { id: 1, name: "test_user", highscore: 2 }
            ], done);
        });
    });
        
    describe("POST /games", () => {
        it("creates a game and returns game data", (done) => {
            request(api)
            .post("/games")
            .send(testGame)
            .expect(201)
            .expect(res => {
                expect(res.body).toMatchObject(testGame);
            })
            .end(done);
        });
    });

    describe("GET /games", () => {
        it("returns an array with all games", (done) => {
            request(api)
            .get("/games")
            .expect(200)
            .expect(res => {
                expect(res.body).toHaveLength(1);
                expect(res.body[0]).toMatchObject(testGame);
            })
            .end(done);
        });
    });

    describe("GET /games/:name", () => {
        it("finds and returns game object by name", (done) => {
            request(api)
            .get("/games/test_room")
            .expect(200)
            .expect(res => {
                expect(res.body).toMatchObject(testGame);
            })
            .end(done);
        });
    });

    describe("POST /games/:name", () => {
        it("joins a room by name and returns game object", (done) => {
            request(api)
            .post("/games/test_room")
            .send({ username: "test_user2" })
            .expect(200)
            .expect(res => {
                expect(res.body).toMatchObject(testGame);
                expect(res.body.players).toHaveLength(2);
                expect(res.body.players).toEqual(["test_user", "test_user2"]);
            })
            .end(done);
        });

        it("client can set username and join room via socket", (done) => {
            let counter = 0;
            for(let i = 0; i < 2; i++){
                clientSocket[i].on("game", response => {
                    expect(response).toBeTruthy();
                    counter += 1;
                    if(counter >= 2) done();
                });
            }
            clientSocket[0].emit("setusername", "test_user");
            clientSocket[1].emit("setusername", "test_user2");
            clientSocket[0].emit("joinroom", "test_room");
            clientSocket[1].emit("joinroom", "test_room");
        });
    });

    describe("start game", () => {
        it("client can start game via socket", (done) => {
            clientSocket[0].on("game", response => {
                expect(response).toMatchObject(testGame);
                expect(response.token).not.toBe(null);
                expect(response.questions).not.toBe(null);
                expect(response.active).toBe(true);
                for (let player in response.scores) {
                    expect(response.scores[player]).toEqual(0);
                }
                expect(response.currentQuestion).toEqual(0);
                token = response.token;
                questions = response.questions;
                done();
            });
            clientSocket[0].emit("startgame", {
                lobbyName: "test_room",
                roomId: 0
            });
        });
    });

    describe("making turns", () => {
        it("correct response when user makes a turn", (done) => {
            // players take turns answering questions
            // test_user2's first answer is intentionally wrong
            let counter = [0, 0];
            for(let i = 0; i < 2; i++){
                clientSocket[i].on("response", response => {
                    counter[i] += 1;
                    if(counter[i] % 2 !== i){
                        const gameEnd = counter[i] < questions.length;
                        
                        let expectedResponse = {
                            gameEnd: gameEnd ? false : true,
                            correct: counter[i] === 2 ? false : true
                        };

                        expect(response).toMatchObject(expectedResponse);
                        
                        if(gameEnd){
                            const correctAnswer = decodeURIComponent(questions[counter[i]].correct_answer);
                            clientSocket[counter[i] % 2].emit("answer", {
                                roomId: 0, lobbyName: "test_room",
                                answer: counter[i] === 1 ? "" : correctAnswer
                            });
                        } else {
                            done();
                        }
                    }
                });
            }
            clientSocket[0].emit("answer", {
                roomId: 0, lobbyName: "test_room", 
                answer: questions[0].correct_answer
            });
        });

        it("leaderboards updated after game ends", (done) => {
            request(api)
            .get("/games/leaderboard")
            .expect(200)
            .expect([
                { id: 2, name: "test_user1", highscore: 3 },
                { id: 1, name: "test_user", highscore: 3 },
                { id: 3, name: "test_user2", highscore: 1 }
            ], done);
        });
    });

    describe("GET /games/:id/restart", () => {
        it("restarts game", (done) => {
            request(api)
            .get("/games/0/restart")
            .expect(200)
            .expect(res => {
                expect(res.body.token).not.toEqual(token);
                expect(res.body.questions).not.toEqual(questions);
                for (let player in res.body.scores) {
                    expect(res.body.scores[player]).toEqual(0);
                }
                expect(res.body.currentQuestion).toEqual(0);
                expect(res.body.active).toBe(true);
            })
            .end(done);
        })
    });

    describe("DELETE /games/:id", () => {
        it("deletes game and returns status code 204", (done) => {
            request(api)
            .delete("/games/0")
            .expect(204, done);
        });
    });
});