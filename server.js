const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

const pool = new Pool({
    user: 'your_username',  // replace with your PostgreSQL username
    host: 'localhost',
    database: 'unibudget',
    password: 'your_password',  // replace with your PostgreSQL password
    port: 5432,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Endpoint to get budget data
app.get('/api/budget', async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM budget ORDER BY id DESC LIMIT 1');
    const budgetData = rows[0];
    const expenses = await pool.query('SELECT * FROM expenses WHERE budgetId = $1', [budgetData.id]);
    budgetData.expenses = expenses.rows;
    res.json(budgetData);
});

// Endpoint to update budget data
app.post('/api/budget', async (req, res) => {
    const { monthlyIncome, monthlyExpenses, savingGoal, expenses } = req.body;

    // Insert into budget table
    const budgetResult = await pool.query('INSERT INTO budget(monthlyIncome, monthlyExpenses, savingGoal) VALUES($1, $2, $3) RETURNING id', [monthlyIncome, monthlyExpenses, savingGoal]);
    const budgetId = budgetResult.rows[0].id;

    // Insert into expenses table
    for (const expense of expenses) {
        await pool.query('INSERT INTO expenses(budgetId, category, amount) VALUES($1, $2, $3)', [budgetId, expense.category, expense.amount]);
    }

    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
