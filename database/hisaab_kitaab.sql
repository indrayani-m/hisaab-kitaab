CREATE DATABASE hisaab_kitaab;
USE hisaab_kitaab;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255)
);

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title VARCHAR(100),
  amount FLOAT,
  type VARCHAR(20),
  category VARCHAR(50),
  date DATE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

select * from transactions;
select * from users;


