# Hisaab Kitaab

Hisaab Kitaab is a modern expense tracker web app built to help users manage daily spending, monitor income and expenses, and understand their money habits through a clean dashboard experience.

It includes a polished frontend built with HTML, CSS, and Vanilla JavaScript, along with a Node.js + Express + MySQL backend for authentication and transaction storage.

## Features

- User signup and login with hashed passwords using `bcrypt`
- MySQL-backed user and transaction storage
- Responsive fintech-style dashboard UI
- Add income and expense transactions
- Delete transactions from the dashboard
- Summary cards for balance, income, and expense
- Smart spending insights based on categories
- Interactive canvas-based expense chart
- Expense split tool for dividing a bill among multiple people
- Local UI enhancements like hover effects, smooth transitions, and card-based layout

## Tech Stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript

### Backend

- Node.js
- Express.js
- MySQL
- bcrypt
- cors

## Demo

[Watch the full demo video here!](https://drive.google.com/drive/folders/1uZpsKjoDbTcekoykEb4CUclZorMcJrYX?usp=sharing)



## Project Structure

```bash
Hisaab-Kitaab/
├── index.html
├── login.html
├── signup.html
├── dashboard.html
├── style.css
├── script.js
├── hklogo.png
├── README.md
└── backend/
    ├── server.js
    ├── db.js
    ├── package.json
    └── routes/
        ├── auth.js
        └── transactions.js
```

## Screens

- Welcome page
- Login page
- Signup page
- Dashboard with:
  - summary cards
  - add transaction form
  - expense split tool
  - expense chart
  - transaction history

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/hisaab-kitaab.git
cd hisaab-kitaab
```

### 2. Set up MySQL database

Create a database:

```sql
CREATE DATABASE hisaab_kitaab;
```

Create the `users` table:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255)
);
```

Create the `transactions` table:

```sql
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
```

### 3. Configure backend database connection

Update `backend/db.js` with your MySQL credentials:

```js
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "your_password",
  database: "hisaab_kitaab"
});
```

### 4. Install backend dependencies

```bash
cd backend
npm install
```

### 5. Start the backend server

```bash
node server.js
```

The server will run at:

```bash
http://localhost:3000
MySQL connected
```

### 6. Run the frontend

Open the frontend files in your browser, or use a local server extension such as Live Server for best results.

## API Endpoints

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`

### Transactions

- `POST /api/transactions/add`
- `GET /api/transactions/:user_id`
- `DELETE /api/transactions/:id`

## Dashboard Highlights

### Summary Cards

Shows:

- Balance
- Total income
- Total expense

### Insight Section

Displays smart messages like:

- `You spent ₹1200 on Food this week.`
- `You spend most on Travel.`

### Category Chart

- Custom-built using HTML canvas
- No chart libraries used
- Interactive hover behavior

### Split Expense Tool

Users can:

- enter total amount
- enter number of people
- calculate equal contribution instantly

## Security Notes

- Passwords are hashed before saving to the database using `bcrypt`
- Login validates hashed passwords securely
- Raw passwords are never stored in MySQL

## Future Improvements

- Edit transactions
- Filter by date and category
- Monthly reports
- Download expense reports
- User profile settings
- JWT-based authentication

## Author

Indrayani Mude

## License

This project is open for learning, portfolio, and academic use.
## 📜 License
This project is licensed under the MIT License.
