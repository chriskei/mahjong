CREATE DATABASE mahjong;
USE mahjong;

-- ------------------------------------------------------------

CREATE TABLE earnings (
  date VARCHAR(19),
  roundNum INT,
  momEarnings FLOAT NOT NULL,
  dadEarnings FLOAT NOT NULL,
  tiffEarnings FLOAT NOT NULL,
  chrisEarnings FLOAT NOT NULL,
  PRIMARY KEY (date, roundNum)
);

CREATE TABLE stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(5) NOT NULL,
  quality VARCHAR(1) NOT NULL
);

-- ------------------------------------------------------------

DELIMITER $$
CREATE PROCEDURE addEarnings (
	momEarnings FLOAT, 
    dadEarnings FLOAT, 
    tiffEarnings FLOAT, 
    chrisEarnings FLOAT
)
BEGIN
	DECLARE roundNum INT;
    SET roundNum = (SELECT COUNT(*) FROM earnings);
	INSERT INTO earnings VALUES (
		NOW() - INTERVAL 5 HOUR,
        roundNum,
        momEarnings,
        dadEarnings,
        tiffEarnings,
        chrisEarnings
    );
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE addStats (
	name VARCHAR(5),
    quality VARCHAR(1)
)
BEGIN
	INSERT INTO stats (name, quality) VALUES (
		name,
        quality
    );
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE readEarnings ()
BEGIN
	SELECT * FROM earnings;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE readStats ()
BEGIN
	SELECT * FROM stats;
END $$
DELIMITER ;

-- SET SQL_SAFE_UPDATES = 0;
