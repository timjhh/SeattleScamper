INSERT or IGNORE INTO team (id, username, team_name, score, hashed_password) VALUES
   -- remove these before starting the game, create users through api
   (0, 'timjhh', 'timjhh', 0,'$2b$12$8vFV2m/UVBt6zt5w6aa4zud5zjkbGxKbYxj.bXYALPjqgyLiijSe6');

INSERT or IGNORE INTO game (active, day, 'start', 'end', 'day_start', 'day_end', passive_income_enabled, multiplier) VALUES (true, 1, '2025-03-20T08:00:05+01:00', '2025-03-22T19:00:05+01:00', '08:00:05.000', '19:00:05.000', true, 1);