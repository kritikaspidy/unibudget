// Fetch budget data
async function fetchBudgetData() {
    const response = await fetch('/api/budget');
    const data = await response.json();
    return data;
}

// Update budget data
async function updateBudgetData(data) {
    const response = await fetch('/api/budget', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
}

// Calculate Budget
async function calculateBudget() {
    const monthlyIncome = parseFloat(document.getElementById('monthlyIncome').value);
    const monthlyExpenses = parseFloat(document.getElementById('monthlyExpenses').value);
    const savingGoal = parseFloat(document.getElementById('savingGoal').value);
    
    const updatedData = {
        monthlyIncome,
        monthlyExpenses,
        savingGoal,
        expenses: [],  // Empty array as expenses are not yet added
    };

    const result = await updateBudgetData(updatedData);
    if (result.success) {
        const data = await fetchBudgetData();
        displayBudgetData(data);
    }
}

// Display Budget Data
function displayBudgetData(data) {
    const recommendedLimit = data.monthlyIncome - data.monthlyExpenses;
    document.getElementById('recommendedLimit').textContent = `$${recommendedLimit.toFixed(2)}`;
    document.getElementById('savingProgress').textContent = calculateSavingProgress(data.expenses, data.savingGoal);
    // Display expenses
    const expenseList = document.getElementById('expenseList');
    expenseList.innerHTML = '';
    data.expenses.forEach(expense => {
        const li = document.createElement('li');
        li.textContent = `${expense.category}: $${expense.amount.toFixed(2)}`;
        expenseList.appendChild(li);
    });
}

// Calculate Saving Progress
function calculateSavingProgress(expenses, savingGoal) {
    const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    const progress = ((totalExpenses / savingGoal) * 100).toFixed(2);
    return `${progress}%`;
}

// Add Expense
async function addExpense() {
    const category = document.getElementById('expenseCategory').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    
    const data = await fetchBudgetData();
    data.expenses.push({ category, amount });
    
    const result = await updateBudgetData(data);
    if (result.success) {
        displayBudgetData(data);
    }
}

// Set Saving Goal
async function setSavingGoal() {
    const savingGoal = parseFloat(document.getElementById('savingGoal').value);
    
    const data = await fetchBudgetData();
    data.savingGoal = savingGoal;
    
    const result = await updateBudgetData(data);
    if (result.success) {
        displayBudgetData(data);
    }
}

// Initial fetch and display
document.addEventListener('DOMContentLoaded', async () => {
    const data = await fetchBudgetData();
    displayBudgetData(data);
});
