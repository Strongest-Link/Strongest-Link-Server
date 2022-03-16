const axios = require("axios");
const db = require("../dbConfig");
const gamesData = [];

class Game {
  constructor(data) {
    for (let key in data) {
      // change this later
      this[key] = data[key];
    }
  }

  static get all() {
    return new Promise((resolve, reject) => {
      try {
        resolve(gamesData);
      } catch (err) {
        reject(err);
      }
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      try {
        const game = gamesData.find((game) => game.id == id);
        if (!game) throw new Error("Game not found.");
        resolve(game);
      } catch (err) {
        reject(err);
      }
    });
  }

  static get leaderboard() {
    return new Promise(async (resolve, reject) => {
      try {
        // db request to get scores
        const highscores = await db.query(
          "SELECT * FROM highscores ORDER BY highscore DESC"
        );
        if (!highscores) throw new Error("Could not get highscores.");
        resolve(highscores.rows);
      } catch (err) {
        reject(err);
      }
    });
  }

  static createGame(name, host, options) {
    return new Promise((resolve, reject) => {
      try {
        const nameExists = !!gamesData.find((game) => game.name === name);
        if (nameExists) throw new Error("Sorry that room name is taken.");

        const maxId = Math.max(...gamesData.map((game) => game.id));
        const newId = maxId < 0 ? 0 : maxId + 1;

        const newGame = {
          id: newId,
          name,
          options,
          host,
          players: [host],
          questions: null,
          token: null,
          currentQuestion: 0,
          scores: {},
          active: false
        };

        const response = new Game(newGame);
        gamesData.push(response);
        resolve(response);
      } catch (err) {
        reject(err);
      }
    });
  }

  updateOptions(newOptions) {
    this.options = newOptions;
  }

  getToken() {
    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await axios.get(
          "https://opentdb.com/api_token.php?command=request"
        );
        if (data.response_code !== 0)
          throw new Error("Couldn't generate session token.");
        resolve(data.token);
      } catch (err) {
        reject(err);
      }
    });
  }

  getQuestions(amount) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.token)
          throw new Error("Couldn't get trivia data (missing token).");
        const { data } = await axios.get(
          `https://opentdb.com/api.php?amount=${amount}&category=${this.options.category}&difficulty=${this.options.level}&type=multiple&token=${this.token}&encode=url3986`
        );
        if (data.response_code !== 0)
          throw new Error("Couldn't get trivia data.");
        resolve(data.results);
      } catch (err) {
        reject(err);
      }
    });
  }

  startGame() {
    return new Promise(async (resolve, reject) => {
      try {
        // trivia api request
        this.token = await this.getToken();
        this.questions = await this.getQuestions(
          this.options.totalQuestions
        );
        
        this.players.forEach(player => {
          this.scores[player] = 0;
        });
        this.currentQuestion = 0;
        this.active = true;
        resolve(this);
      } catch (err) {
        reject(err);
      }
    });
  }

  joinGame(user) {
    return new Promise(async (resolve, reject) => {
      try {
        this.players.push(user);
        resolve(this);
      } catch (err) {
        reject(err);
      }
    });
  }

  makeTurn(user, answer) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.active) throw new Error("Game is no longer in progress.");
        if (this.players[this.currentQuestion % this.players.length] !== user) throw new Error("It's not your turn.");
        let correct = false;
        let gameEnd = false;
        const question = this.questions[this.currentQuestion];
        if (decodeURIComponent(question.correct_answer) === answer) {
          this.scores[user] += 1;
          correct = true;
        }
        if (this.currentQuestion >= this.options.totalQuestions - 1) gameEnd = true;
        if (gameEnd) {
          this.active = false;
        } else {
          this.currentQuestion += 1;
        }
        resolve({ gameEnd, correct });
      } catch (err) {
        reject(err);
      }
    });
  }

  updateScores() {
    return new Promise(async (resolve, reject) => {
      try {
        const highscores = await db.query("SELECT * FROM highscores");
        for (const user in this.scores) {
          const score = this.scores[user];
          if (score > 0) {
            const userRow = highscores.rows.find((row) => row.name === user);
            if (userRow) {
              if (score > userRow.highscore) {
                await db.query(
                  "UPDATE highscores SET highscore=$1 WHERE name=$2",
                  [score, user]
                );
              }
            } else {
              await db.query(
                "INSERT INTO highscores (name, highscore) VALUES ($1, $2)",
                [user, score]
              );
            }
          }
        }
        resolve("Leaderboards updated.");
      } catch (err) {
        reject(err);
      }
    });
  }

  delete() {
    return new Promise((resolve, reject) => {
      try {
        const index = gamesData.findIndex((game) => game.id === this.id);
        if (index < 0) throw new Error("Game no longer exists.");
        gamesData.splice(index, 1);
        resolve("Game successfully deleted.");
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = Game;
