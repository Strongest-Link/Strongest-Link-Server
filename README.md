# Strongest-Link-Server

<!-- badges -->
[![ISC license](https://img.shields.io/badge/License-ISC-blue.svg)](https://www.isc.org/licenses/)
[![GitHub latest commit](https://img.shields.io/github/last-commit/Strongest-Link/Strongest-Link-Server.svg)](https://github.com/Strongest-Link/Strongest-Link-Server/commit/)
[![GitHub forks](https://img.shields.io/github/forks/Strongest-Link/Strongest-Link-Server.svg)](https://github.com/Strongest-Link/Strongest-Link-Server)

Server-side repo for the Strongest Link group project. Main project repo can be found [here](https://github.com/Strongest-Link/Strongest-Link).

## Installation & Usage

1. Clone the repo `git clone https://github.com/Strongest-Link/Strongest-Link-Server.git`
2. Enter the directory `cd Strongest-Link-Server`
3. Install dependencies `npm install`
   
* `npm start` to run the server (localhost port will be logged to console on startup).
* `npm run dev` to run the server with [`nodemon`](https://github.com/remy/nodemon).
* `npm unitTest` to run unit tests.
* `npm run coverage` to check unit test coverage.

### Deploy

The server side is currently deployed at http://strongest-link.herokuapp.com/

## Project Goal

Build a multiplayer quiz game website where users can make lobbies and take turns answering trivia questions.

### Other requirements

* Users should be able to choose the level and topic for their quiz game.
* User scores should be stored in a database at the end of the game.
* Leaderboard where users can see high scores.

## Changelog

* Added function to update game options on the model.
* Changed game logic to send scores to the DB automatically after the last turn is played.
* Change game logic to end the game when there are no more questions.
* Made returned status codes on the controller more accurate.
* Removed redundant create room socket event.
* Created documentation for the API.
* Show route changed to use the room name instead of room ID.

## Fixed Bugs

- [x] Game model not exported in `./models/Game.js`.
- [x] `undefined` error in `Game.prototype.makeTurn` function.
- [x] Player scores not initialized to 0.
- [x] Game doesn't end when last question is played.
- [x] `TypeError` when deleting a game.
- [x] Turns can be made on games that aren't running.
- [x] HTML encoded characters appear in the questions/answers.
- [x] Unresolved Promise when trying to join a game.
- [x] Show route `GET /games/:id` returns an error.
- [x] Changes made to games don't persist.
- [x] Joining a room emits the same socket event as starting a game.

## Pitfalls & Discoveries

* Originally special characters in the response data from the Open Trivia DB were encoded using HTML ampersand encoding which there was no straight-forward way to decode in JavaScript. We found out that the Open Trivia API has a parameter to specify the encoding of the response data from a selection. RFC 3986 URI encoding was chosen as it can be easily decoded using the built-in `decodeURIComponent()` function.
* We ran into an issue where changes made to game instances via its methods did not persist and thus weren't reflected when subsequently calling `Game.all`. It turns out that 

## Remaining Bugs

- [ ] Any errors encountered when starting a game causes the server to crash.
- [ ] Some errors encountered when making a turn cause the server to crash.
- [ ] Users can choose the same nickname leading to potentially confusing scoreboards.

## Improvements & Future Features

* Round based games so that each player receives the same amount of questions per game.
* A chat so that players can talk to each other during the game.
* User accounts so that players can login and keep track of their games and scores.

## License

* [ISC License](https://www.isc.org/licenses/)
