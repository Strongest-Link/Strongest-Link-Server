TRUNCATE highscores RESTART IDENTITY;

INSERT INTO highscores (name, highscore) VALUES 
('test_user', 2),
('test_user1', 3);
