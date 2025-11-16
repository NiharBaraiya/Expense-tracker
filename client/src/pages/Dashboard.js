import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, Legend,
  LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar,  Tooltip,LabelList
} from 'recharts';
import PDFReportButton from '../components/PDFReportButton';
import API from "../api";


import './Dashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA00FF', '#FF6699', '#33CC99', '#FF9933', '#9966FF'];

// === Extra Budget Chart Component ===
const BudgetChart = ({ topCategories, budgetProgress }) => {
  const data = budgetProgress.map(b => ({
    category: b.category,
    spent: b.spent,
    budget: b.budget
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis />
        <ReTooltip />
        <Legend />
        <Bar dataKey="spent" fill="#8884d8" name="Spent" />
        <Bar dataKey="budget" fill="#82ca9d" name="Budget" />
      </BarChart>
    </ResponsiveContainer>
  );
};

const Dashboard = () => {
  const username = localStorage.getItem('username') || 'User';
  const navigate = useNavigate();

  // ===== State =====
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [expensesSummary, setExpensesSummary] = useState({ today:0, yesterday:0, week:0, month:0, lastMonth:0 });
  const [topCategories, setTopCategories] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [budgetProgress, setBudgetProgress] = useState([]);
  const [monthAlert, setMonthAlert] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [netSavings, setNetSavings] = useState(0);
  const [categoryGoals, setCategoryGoals] = useState({});
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [userSettings, setUserSettings] = useState({ currency:'₹', theme:'light' });
  const [debts, setDebts] = useState([]);
const [income, setIncome] = useState([]);
const [recurring, setRecurring] = useState([]);
const [savingsGoal, setSavingsGoal] = useState({ amount: 0, deadline: "" });
const [storedExpenses, setStoredExpenses] = useState([]);
const [currentSavings, setCurrentSavings] = useState(0);

const [pdfBase64, setPdfBase64] = useState(null);
  // ===== Ref to prevent duplicate alerts =====
  const didAlert = useRef(false);
  const alertMessages = useRef([]);

  const addAlertMessage = (msg) => { if(msg) alertMessages.current.push(msg); };
  const showConsolidatedAlert = () => {
    if(alertMessages.current.length > 0){
      alert(alertMessages.current.join('\n'));
      alertMessages.current = [];
    }
  };


  // ===== Load Data (from backend + localStorage fallback) =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch from backend using API with auth headers
        const [expRes, budRes, debtRes, incomeRes, recurringRes, savingsRes] = await Promise.all([
          API.get("/expenses"),
          API.get("/budgets"),
          API.get("/debts"),
          API.get("/incomes"),
          API.get("/recurring"),
          API.get("/savings")
        ]);

        const expData = expRes.data;
        const budData = budRes.data;
        const debtData = debtRes.data;
        const incomeData = incomeRes.data;
        const recurringData = recurringRes.data;
        const savingsData = savingsRes.data;
        const goal = Array.isArray(savingsData) && savingsData.length > 0 ? savingsData[0] : { amount: 0, deadline: "" };

        // Update state
        setExpenses(expData || []);
        setBudgets(budData || []);
        setDebts(debtData || []);
        setIncome(incomeData || []);
        setRecurring(recurringData ||[]);
        setRecurringExpenses(recurringData || []); // Fix: Set recurringExpenses for display
        setSavingsGoal(goal);
        
        // Clear localStorage fallback data since we got fresh data
        localStorage.removeItem("expenses");
        localStorage.removeItem("budgets");
        localStorage.removeItem("debts");
        localStorage.removeItem("income");
        localStorage.removeItem("recurring");
        localStorage.removeItem("savingsGoal");

      } catch (err) {
        console.error("⚠ Backend fetch failed:", err);
        // On error, clear any stale data instead of using localStorage fallback
        setExpenses([]);
        setBudgets([]);
        setDebts([]);
        setIncome([]);
        setRecurring([]);
        setRecurringExpenses([]); // Fix: Clear recurringExpenses on error
        setSavingsGoal({ amount: 0, deadline: "" });
      }
    };

    fetchData();
  }, []);

  // ===== Recalculate whenever expenses/budgets change =====
  useEffect(() => {
    // Use state data instead of localStorage for calculations
    const now = new Date();
    // Helper: normalize any date-like value to local midnight timestamp
    const toLocalMidnightTime = (dateLike) => {
      const d = new Date(dateLike);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    };
    // Sum values where the expense's local-day falls within [start, end] days
    const sumByDate = (start, end) => {
      const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
      const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
      return expenses
        .filter((e) => {
          const t = toLocalMidnightTime(e.date);
          return t >= startDay && t <= endDay;
        })
        .reduce((sum, e) => sum + Number(e.expenseAmount || e.amount || 0), 0);
    };

    // Dates
    const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
    const todayEnd = new Date(now); todayEnd.setHours(23,59,59,999);
    const yesterdayStart = new Date(now); yesterdayStart.setDate(now.getDate()-1); yesterdayStart.setHours(0,0,0,0);
    const yesterdayEnd = new Date(now); yesterdayEnd.setDate(now.getDate()-1); yesterdayEnd.setHours(23,59,59,999);
    const day = now.getDay();
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - (day===0?6:day-1)); weekStart.setHours(0,0,0,0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth()-1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Income & savings using state data
    const incomeTotal = income.reduce((sum, inc) => sum + Number(inc.amount || 0), 0);
    setTotalIncome(incomeTotal);

    // Calculate actual tracked savings
    const trackedSavings = incomeTotal 
                           - expenses.reduce((sum, e) => sum + Number(e.expenseAmount || e.amount || 0), 0) 
                           - debts.reduce((sum, d) => sum + Number(d.amount || 0), 0);

    setCurrentSavings(trackedSavings);

    const expensesSummaryData = {
      today: sumByDate(todayStart, todayEnd),
      yesterday: sumByDate(yesterdayStart, yesterdayEnd),
      week: sumByDate(weekStart, todayEnd),
      month: sumByDate(monthStart, todayEnd),
      lastMonth: sumByDate(lastMonthStart, lastMonthEnd),
    };

    setExpensesSummary(expensesSummaryData);
    setNetSavings(incomeTotal - expensesSummaryData.month);

    // Top categories
    const categoryTotals = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.expenseAmount || e.amount || 0);
      return acc;
    }, {});
    setTopCategories(Object.entries(categoryTotals).sort((a,b)=>b[1]-a[1]).slice(0,5));

    // Recent expenses
    setRecentExpenses([...expenses].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,20));

    // Budget progress
    const progress = budgets.map(b => {
      const budgetAmount = Number(b.amount || 0);
      const spent = expenses.filter(e => e.category===b.category)
        .reduce((sum,e)=>sum + Number(e.expenseAmount || e.amount || 0),0);
      const percentUsed = budgetAmount>0?Math.min((spent/budgetAmount)*100,100):0;
      const remaining = Math.max(budgetAmount-spent,0);

      if(percentUsed>=100) addAlertMessage(`Overspent in "${b.category}"!`);
      else if(percentUsed>=90) addAlertMessage(`Almost reaching limit in "${b.category}"!`);
      else if(percentUsed>=75) addAlertMessage(`75% of "${b.category}" used.`);

      return { category:b.category, budget:budgetAmount, spent, percentUsed, remaining };
    });
    setBudgetProgress(progress);

    // Month comparison
    const totalBudget = budgets.reduce((sum,b)=>sum + Number(b.amount||0),0);
    if(expensesSummary.month > totalBudget && totalBudget>0){
      setMonthAlert(`⚠️ This month's expenses exceed total budget!`);
      addAlertMessage(`⚠️ This month's expenses exceed total budget!`);
    } else setMonthAlert('');

    // Income & savings
    // const incomeTotal = storedIncome.reduce((sum, inc)=>sum + Number(inc.amount || 0),0);
    // setTotalIncome(incomeTotal);
    setNetSavings(incomeTotal - expensesSummary.month);

    // Recurring + Debts alerts using state data
    recurring.forEach(r=>{
      const nextDate = new Date(r.nextDue);
      if(nextDate - now < 3*24*60*60*1000){
        addAlertMessage(`Reminder: "${r.title}" of ${userSettings.currency} ${r.amount} is due on ${r.nextDue}`);
      }
    });
    debts.forEach(d=>{
      const due = new Date(d.dueDate);
      if(due - now < 3*24*60*60*1000 && !d.paid){
        addAlertMessage(`Debt/Loan "${d.title}" of ${userSettings.currency} ${d.amount} is due on ${d.dueDate}`);
      }
    });

    if(!didAlert.current){
      didAlert.current = true;
      showConsolidatedAlert();
    }
  }, [expenses, budgets, debts, income, recurring, userSettings.currency, expensesSummary.month]);

  // Note: Logout handled elsewhere (e.g., Navbar); removed unused local handler.

  const filteredExpenses = filterCategory ? recentExpenses.filter(e=>e.category===filterCategory) : recentExpenses;

  // ===== Chart Data =====
  const pieData = topCategories.map(([cat, amt]) => ({ name: cat, value: amt }));
  const monthlyTrend = recentExpenses.reduce((acc, e) => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    acc[key] = (acc[key] || 0) + Number(e.expenseAmount || e.amount || 0);
    return acc;
  }, {});
  const lineData = Object.entries(monthlyTrend).map(([month, amt]) => ({ month, amount: amt }));
  // ===== Category Colors Map =====
  const categoryColorMap = {};
  [...new Set(recentExpenses.map(e=>e.category))].forEach((cat, i)=>{
    categoryColorMap[cat] = COLORS[i % COLORS.length];
  });

  return (
    <div className={`dashboard-container ${darkMode ? 'dark-mode' : ''}`}>
<div className="dashboard-welcome">
  <div className="welcome-text">
    <h1>👋 Welcome, <span className="username">{username}</span>!</h1>
    <h2>Your personal expense & budgeting dashboard.</h2>
    <p className="date-message">
      Today is {new Date().toLocaleDateString()} – Keep up the great budgeting! & tracking your expenses. 
    </p>
  </div>
</div>

  {/* <button className="dark-mode-toggle" onClick={() => setDarkMode(!darkMode)}>
    {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
  </button> */}

  {/* ACTION BUTTONS */}
<br></br>
<br></br>
<div className="action-buttons-container">
  <div className="feature-card">
    <h3>Add Budget</h3>
    <p>Create a new budget to track your income and expenses.</p>
    <button onClick={() => navigate('/add-budget')} className="action-button">➕ Add Budget</button>
  </div>

  <div className="feature-card">
    <h3>Add Expense</h3>
    <p>Log your daily expenses to monitor spending.(Manage Expense)</p>
    <button onClick={() => navigate('/add-expense')} className="action-button">➕ Add Expense</button>
  </div>

 

  <div className="feature-card">
    <h3>Add Income</h3>
    <p>Add your income to update your financial overview.(Manage Income)</p>
    <button onClick={() => navigate('/add-income')} className="action-button">💵 Add Income</button>
  </div>

  <div className="feature-card">
    <h3>Add Debt / Loan</h3>
    <p>Track your debts and loans with repayment details.(Manage Debt/Loan)</p>
    <button onClick={() => navigate('/add-debt')} className="action-button">💳 Add  Loan</button>
  </div>

  <div className="feature-card">
    <h3>Add Recurring Expense</h3>
    <p>Set up recurring payments for subscriptions or bills.</p>
    <button onClick={() => navigate('/add-recurring')} className="action-button">🔁 Add Recurring</button>
  </div>
 <div className="feature-card">
    <h3>View Budgets</h3>
    <p>See all your budgets and their progress and update or delete and according you can see expenses also.</p>
    <br></br>
    <button onClick={() => navigate('/budgets')} className="action-button">📊 View Budgets</button>
  </div>

  <div className="feature-card">
    <h3>View Expenses</h3>
    <p>Check all your recorded expenses and update or delete them and according you can see budget also.</p>
  <br></br><br></br>
    <button onClick={() => navigate('/expenses')} className="action-button">📋 View Expenses</button>
  </div>
  <div className="feature-card">
    <h3>Set Savings Goal</h3>
    <p>Define a savings goal and track your progress and update or delete it as needed.</p>
    <br></br><br></br>
    <button onClick={() => navigate('/add-savings-goal')} className="action-button">🎯 Set Savings Goal</button>
  </div>

<div className="feature-card pdf-report-card">
  <h3>Export & Email PDF Report</h3>
  <p>Download or send a PDF report of your finances.</p>
  <br></br>
  <PDFReportButton
    expenses={expenses}
    budgets={budgets}
    income={income}
    debts={debts}
    recurring={recurring}
    savingsGoals={savingsGoal ? [savingsGoal] : []}
  />
</div>



</div>

<br></br>
  {/* EXPENSE SUMMARY */}
{/* EXPENSE SUMMARY */}
<div className="expense-summary">
  <h1 className="summary-title">💰 Expense Summary</h1>
  <div className="expense-cards-container">
    {/* Today */}
    <div className="expense-card">
      <h4>Today</h4>
      <p>{userSettings.currency}{expensesSummary.today}</p>
      {/* Add more info here if needed */}
    </div>
<br></br>
<br></br>
<br></br>
    {/* Yesterday */}
    <div className="expense-card">
      <h4>Yesterday</h4>
      <p>{userSettings.currency}{expensesSummary.yesterday}</p>
    </div>
<br></br>
<br></br>
<br></br>
    {/* This Week */}
    <div className="expense-card">
      <h4>This Week</h4>
      <p>{userSettings.currency}{expensesSummary.week}</p>
    </div>
<br></br>
<br></br>
<br></br>
    {/* This Month */}
    <div className="expense-card">
      <h4>This Month</h4>
      <p>{userSettings.currency}{expensesSummary.month}</p>
    </div>
<br></br>
<br></br>
<br></br>
    {/* Last Month */}
    <div className="expense-card">
      <h4>Last Month</h4>
      <p>{userSettings.currency}{expensesSummary.lastMonth}</p>
    </div>
    
  </div>
  <br></br>
<div className="expense-card">
      <h4>Total Income</h4>
      <p>{userSettings.currency}{totalIncome}</p>
    </div>
    <br></br>
    {/* Net Savings */}
    <div className="expense-card">
      <h4> This Month Savings</h4>
      <p>{userSettings.currency}{netSavings}</p>
    </div>
  {monthAlert && <p className="alert">{monthAlert}</p>}
  <br></br>

</div>
  <br></br>
{/* SAVINGS GOALS SECTION */}
<div className="savings-goals">
  <h3 className="expense-summary">🎯 Savings Goals</h3>
  {(() => {
    const goalAmount = Number(savingsGoal.amount || 0);
    const deadline = savingsGoal.deadline;

    // Income & Expenses
    const totalIncome = income.reduce((sum, inc) => sum + Number(inc.amount), 0);
    const totalExpense = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const currentSavings = totalIncome - totalExpense;

    // Progress
    const progress = goalAmount > 0 ? Math.min((currentSavings / goalAmount) * 100, 100) : 0;

    // Deadline & Pace
    let daysLeft = null;
    let pacePerDay = null;
    if (deadline && goalAmount > 0) {
      const diffMs = new Date(deadline) - new Date();
      daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

      const remaining = goalAmount - currentSavings;
      pacePerDay = remaining > 0 && daysLeft > 0 ? (remaining / daysLeft) : 0;
    }

    // Motivation message
    let motivationMsg = "";
    if (pacePerDay > 0 && daysLeft > 0) {
      if (currentSavings / daysLeft > pacePerDay) {
        motivationMsg = "🚀 You’re ahead of schedule, keep it up!";
      } else {
        motivationMsg = "⚡ Try saving a bit more daily to stay on track!";
      }
    }

    return (
      <div className="goal-card">
        {goalAmount > 0 ? (
          <>
            <p>
              Goal: {userSettings.currency}{goalAmount.toFixed(2)}
            </p>

            {/* Progress Bar */}
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{
                  "--progress-width": `${progress.toFixed(1)}%`,
                  backgroundColor: progress >= 100 ? "green" : "blue",
                }}
              />
            </div>

            {/* Current Savings */}
            <p>
              Current Savings: {userSettings.currency}{currentSavings.toFixed(2)} ({progress.toFixed(1)}%)
            </p>

            {/* Deadline */}
            {deadline && (
              <p className={`days-left ${daysLeft <= 7 ? "urgent" : daysLeft <= 14 ? "warning" : "safe"}`}>
                ⏳ {daysLeft} days left (Deadline: {new Date(deadline).toLocaleDateString()})
              </p>
            )}

            {/* Pace */}
            {pacePerDay !== null && pacePerDay > 0 && (
              <p>💡 Save about {userSettings.currency}{pacePerDay.toFixed(2)} per day</p>
            )}

            {/* Motivation */}
            {motivationMsg && <p className="motivation">{motivationMsg}</p>}

            {/* Status */}
            <p>
              Status:{" "}
              {progress >= 100
                ? "✅ Goal Reached!"
                : currentSavings >= goalAmount * 0.75
                ? "⚠️ Almost There"
                : "📈 On Track"}
            </p>

            {/* Over-savings */}
            {currentSavings > goalAmount && (
              <p className="over-saved">🎉 You’ve saved more than your goal!</p>
            )}
          </>
        ) : (
          <p>
            No savings goal set yet. <br /> Go to settings or savings page to add one.
          </p>
        )}
      </div>
    );
  })()}
</div>



<br /><br />

{/* Budget Progress & Category Goals */}
<div className="budget-progress">
  <h3 className="expense-summary">📊 Budget Progress & Category Goals</h3>
  {budgetProgress.length > 0 ? budgetProgress.map((b, i) => {
    const spent = expenses
      .filter(
        exp =>
          exp.category?.trim().toLowerCase() === b.category.trim().toLowerCase()
      )
      .reduce((sum, exp) => sum + Number(exp.amount || exp.expenseAmount || 0), 0);

    const budget = Number(b.budget || 0);
    const remaining = budget - spent;
    const percentUsed = budget > 0 ? (spent / budget) * 100 : 0;

    const isOverGoal = categoryGoals[b.category] && remaining < categoryGoals[b.category];

    // Color coding
    let barColor = "green";
    if (isOverGoal) barColor = "red";
    else if (percentUsed >= 90) barColor = "blue";

    return (
      <div key={i} className="budget-card">
        <strong>{b.category}</strong>

        {/* Progress Bar */}
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{
              "--progress-width": `${Math.min(percentUsed, 100).toFixed(1)}%`,
              backgroundColor: barColor,
            }}
          />
        </div>

        {/* Details */}
        <p>
          Spent: {userSettings.currency} {spent.toFixed(2)} /{" "}
          {userSettings.currency} {budget.toFixed(2)} ({percentUsed.toFixed(1)}%)<br />
          Remaining: {userSettings.currency} {remaining.toFixed(2)}<br />
          {categoryGoals[b.category] && (
            <small>
              Category Goal: {userSettings.currency} {categoryGoals[b.category].toFixed(2)}
            </small>
          )}
        </p>
      </div>
    );
  }) : (
    <p>No budgets to display.</p>
  )}
</div>

<br></br>

{/* <BudgetChart
  topCategories={topCategories}
  budgetProgress={budgetProgress}
/> */}
{/* OVERALL INCOME VS EXPENSE VS SAVINGS */}
<div className="overall-summary">
  <h3 className="expense-summary">💰 Overall Income vs Expense vs Savings</h3>

  {income.length > 0 || expenses.length > 0 ? (
    <ResponsiveContainer width="97%" height={450}>
      <BarChart  className="overall-summary"
        data={[
          { name: "Income", value: totalIncome, color: "#22C55E" },
          {
            name: "Expense",
            value: Math.max(expensesSummary.month, 0.1),
            color: "#EF4444",
          },
          { name: "Savings", value: netSavings, color: "#3B82F6" },
        ]}
        margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          formatter={(value) =>
            `${userSettings.currency}${value.toLocaleString()}`
          }
        />
        <Legend />

        {/* Animated Bars */}
        <Bar
          dataKey="value"
          radius={[8, 8, 8, 8]}
          isAnimationActive={true}
          animationDuration={1500}
          onClick={(data, index) => {
            const category = data.name;
            const details =
              category === "Income"
                ? income
                : category === "Expense"
                ? expenses
                : netSavings;
            alert(
              `Detailed breakdown for ${category}:\n` +
                JSON.stringify(details, null, 2)
            );
          }}
        >
          {["Income", "Expense", "Savings"].map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={["#22C55E", "#EF4444", "#3B82F6"][index]}
            />
          ))}
          {/* Percentage Labels on top of bars */}
          <LabelList
            dataKey="value"
            position="top"
            formatter={(value) => {
              const total =
                totalIncome +
                Math.max(expensesSummary.month, 0.1) +
                netSavings;
              const percent = ((value / total) * 100).toFixed(1);
              return `${percent}%`;
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  ) : (
    <p>No overall data available.</p>
  )}
</div>

<br></br>
<br></br>
{/* EXPENSE CHARTS SECTION */}
<div className="expense-charts-container">
  {/* EXPENSE PIE CHART */}
  <div className="chart-card">
    <h3 className="expense-summary">📊 Expenses by Category</h3>
    {pieData.length > 0 ? (
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            outerRadius={130}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            isAnimationActive={true}
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`hsl(${(index * 137.5) % 360}, 65%, 55%)`} // dynamic colors
                cursor="pointer"
                onClick={() => setFilterCategory(entry.name)}
              />
            ))}
          </Pie>
          <ReTooltip
            formatter={(value, name) => [`${userSettings.currency}${value}`, name]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    ) : (
      <p>No expenses to show.</p>
    )}
    
  </div>

  {/* MONTHLY EXPENSE PIE CHART */}
 <div className="chart-card">
    <h3 className="expense-summary">🥧 Monthly Expense Distribution</h3>
    {lineData.length > 0 ? (
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={lineData}
            dataKey="amount"
            nameKey="month"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label
            isAnimationActive={true}
          >
            {lineData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`}
              />
            ))}
          </Pie>
          <ReTooltip
            formatter={(value) => `${userSettings.currency}${value}`}
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: "10px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    ) : (
      <p>No monthly expense data available.</p>
    )}
</div>
</div>
<br></br>
<br></br>

{/* DEBTS */}
<div className="debts">
  <h3>💳 Debts & Loans</h3>
  {debts.length > 0 ? (
    <div className="debts-table-container">
      {/* Debts Table */}
      <table className="debts-table">
        <thead className='recent-transactions th, .recent-transactions td'>
          <tr>
            <th>Title</th>
            <th>Amount</th>
            <th>Due Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {debts.map((d, i) => (
            <tr key={i}>
              <td>{d.title}</td>
              <td>{userSettings.currency}{d.amount}</td>
              <td>{d.dueDate}</td>
              <td>
                {d.paid ? (
                  <span className="paid">Paid</span>
                ) : (
                  <span className="remaining">
                    Remaining: {userSettings.currency}{d.remaining || d.amount}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
<br></br>
      {/* Payments Breakdown
      {debts.map((d, i) =>
        d.payments && d.payments.length > 0 ? (
          <div key={i} className="payment-breakdown">
            <strong>{d.title} Payments:</strong>
            <ul>
              {d.payments.map((p, j) => (
                <li key={j}>
                  Paid {userSettings.currency}{p.amount} on {p.date}
                </li>
              ))}
            </ul>
          </div>
        ) : null
      )} */}
    </div>
  ) : (
    <p>No debts/loans recorded.</p>
  )}
</div>
<br></br>
{/* RECURRING EXPENSES */}
<div className='recurring-expenses'> 
  <h3>🔁 Recurring Expenses</h3>
  {recurringExpenses.filter(r => r.type === "expense").length > 0 ? (
    <table>
      <thead className='recent-transactions th, .recent-transactions td'>
        <tr>
          <th>Title</th>
          <th>Amount</th>
          <th>Frequency</th>
          <th>Next Due</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {recurringExpenses.filter(r => r.type === "expense").map((r, i) => {
          // Determine if auto-added today
          const today = new Date().toISOString().split("T")[0];
          const nextDueDate = new Date(r.nextDue).toISOString().split("T")[0];
          const isOverdue = nextDueDate < today;
          const isDueToday = nextDueDate === today;

          return (
            <tr key={i}>
              <td>{r.title}</td>
              <td>{userSettings.currency}{r.amount}</td>
              <td>{r.frequency || "Monthly"}</td>
              <td>{nextDueDate}</td>
              <td>
                {isOverdue ? (
                  <span style={{color: 'red'}}>⚠ Overdue</span>
                ) : isDueToday ? (
                  <span style={{color: 'orange'}}>⏰ Due Today</span>
                ) : (
                  <span style={{color: 'green'}}>✓ Scheduled</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  ) : (
    <p>No recurring expenses.</p>
  )}
</div>

{/* RECURRING INCOME */}
<div className='recurring-expenses'> 
  <h3>💰 Recurring Income</h3>
  {recurringExpenses.filter(r => r.type === "income").length > 0 ? (
    <table>
      <thead className='recent-transactions th, .recent-transactions td'>
        <tr>
          <th>Title</th>
          <th>Amount</th>
          <th>Frequency</th>
          <th>Next Due</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {recurringExpenses.filter(r => r.type === "income").map((r, i) => {
          // Determine if auto-added today
          const today = new Date().toISOString().split("T")[0];
          const nextDueDate = new Date(r.nextDue).toISOString().split("T")[0];
          const isOverdue = nextDueDate < today;
          const isDueToday = nextDueDate === today;

          return (
            <tr key={i}>
              <td>{r.title}</td>
              <td>{userSettings.currency}{r.amount}</td>
              <td>{r.frequency || "Monthly"}</td>
              <td>{nextDueDate}</td>
              <td>
                {isOverdue ? (
                  <span style={{color: 'red'}}>⚠ Overdue</span>
                ) : isDueToday ? (
                  <span style={{color: 'orange'}}>⏰ Due Today</span>
                ) : (
                  <span style={{color: 'green'}}>✓ Scheduled</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  ) : (
    <p>No recurring income.</p>
  )}
</div>

     {/* Recent Transactions */}
      <div className="expense-summary">
        <h3>🕒 Recent Transactions</h3>
        <br></br>
        <label className="recent-transactions select" >
          Filter by Category: 
          <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)}>
            <option value=''>All</option>
            {topCategories.map(([cat],i)=><option key={i} value={cat}>{cat}</option>)}
          </select>
        </label>
        <br></br>
        <br></br>
        {filteredExpenses.length>0 ? (
          <table border="1" cellPadding="5" className='recent-transactions table'>
            <thead className='recent-transactions th, .recent-transactions td'>
              <tr>
                <th>Date</th><th>Category</th><th>Description</th><th>Amount</th>
              </tr>
            </thead>
            <tbody className='recent-transactions td'>
              {filteredExpenses.map((e,i)=>(<tr key={i}>
                <td>{new Date(e.date).toLocaleDateString()}</td>
                <td className='.recent-transactions .category'>{e.category}</td>
                <td>{e.title || e.description || '-'}</td>
                <td>{userSettings.currency} {Number(e.expenseAmount || e.amount || 0).toFixed(2)}</td>
              </tr>))}
            </tbody>
          </table>
        ) : <p>No recent transactions.</p>}
      </div>

<br></br>
<br></br>
    </div>
  );
};

export default Dashboard;
