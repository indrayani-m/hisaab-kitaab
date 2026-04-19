const CHART_COLORS = ["#FF9933", "#4B6F44", "#800000", "#D4AF37"];

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  setupLogin();
  setupSignup();
  setupSplitExpenseTool();
  setupDashboard();
});

// ================= AUTH =================

// LOGIN
function setupLogin() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(data.user));
      alert(data.message || "Login successful");
      window.location.href = "dashboard.html";
    } catch (error) {
      console.error(error);
      alert("Server error while logging in");
    }
  });
}

// SIGNUP
function setupSignup() {
  const form = document.getElementById("signupForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    try {
      const res = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Signup failed");
        return;
      }

      alert(data.message || "Signup successful");
      window.location.href = "login.html";
    } catch (error) {
      console.error(error);
      alert("Server error while signing up");
    }
  });
}

// ================= DASHBOARD =================

function setupDashboard() {
  const form = document.getElementById("transactionForm");
  if (!form) {
    renderDashboard();
    return;
  }

  const dateInput = document.getElementById("date");
  if (dateInput) {
    dateInput.value = formatDateInput(new Date());
  }

  form.addEventListener("submit", handleTransactionSubmit);

  renderDashboard();
}

// ADD TRANSACTION
async function handleTransactionSubmit(e) {
  e.preventDefault();

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  if (!currentUser || !currentUser.id) {
    alert("Please login again");
    window.location.href = "login.html";
    return;
  }

  const title = document.getElementById("title").value.trim();
  const amount = Number(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;

  if (!title || !amount || !date) {
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/transactions/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: currentUser.id,
        title,
        amount,
        type,
        category,
        date
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to add transaction");
      return;
    }

    e.target.reset();

    const dateInput = document.getElementById("date");
    if (dateInput) {
      dateInput.value = formatDateInput(new Date());
    }

    renderDashboard();
  } catch (error) {
    console.error(error);
    alert("Server error while adding transaction");
  }
}


// DELETE TRANSACTION
async function deleteTransaction(id) {
  try {
    const res = await fetch(`http://localhost:3000/api/transactions/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to delete transaction");
      return;
    }

    renderDashboard();
  } catch (error) {
    console.error(error);
    alert("Server error while deleting transaction");
  }
}

// GET DATA
async function getTransactions() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  if (!currentUser || !currentUser.id) {
    return [];
  }

  try {
    const res = await fetch(`http://localhost:3000/api/transactions/${currentUser.id}`);
    if (!res.ok) {
      return [];
    }

    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

// RENDER ALL
async function renderDashboard() {
  const data = await getTransactions();
  renderSummary(data);
  renderInsights(data);
  renderTable(data);
  renderChart(data);
}

// ================= SUMMARY =================

function renderSummary(data) {
  const balanceEl = document.getElementById("balanceValue");
  const incomeEl = document.getElementById("incomeValue");
  const expenseEl = document.getElementById("expenseValue");

  if (!balanceEl || !incomeEl || !expenseEl) return;

  const income = data
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expense = data
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expense;

  incomeEl.textContent = `₹${income.toFixed(2)}`;
  expenseEl.textContent = `₹${expense.toFixed(2)}`;
  balanceEl.textContent = `₹${balance.toFixed(2)}`;
}

// ================= INSIGHTS =================

function renderInsights(data) {
  const headline = document.getElementById("insightHeadline");
  const subline = document.getElementById("insightSubline");

  if (!headline || !subline) return;

  const expenses = data.filter((t) => t.type === "expense");

  if (!expenses.length) {
    headline.textContent = "Your weekly pattern will appear here.";
    subline.textContent = "Add a few transactions to unlock category-based insights.";
    return;
  }

  const weeklyExpenses = expenses.filter((t) => isWithinLast7Days(t.date));
  const weeklyGrouped = {};
  weeklyExpenses.forEach((t) => {
    weeklyGrouped[t.category] = (weeklyGrouped[t.category] || 0) + t.amount;
  });

  const overallGrouped = {};
  expenses.forEach((t) => {
    overallGrouped[t.category] = (overallGrouped[t.category] || 0) + t.amount;
  });

  const weeklyEntries = Object.entries(weeklyGrouped);
  const overallEntries = Object.entries(overallGrouped).sort((a, b) => b[1] - a[1]);

  if (weeklyEntries.length) {
    const [topWeeklyCategory, topWeeklyAmount] = weeklyEntries.sort((a, b) => b[1] - a[1])[0];
    headline.textContent = `You spent ₹${topWeeklyAmount.toFixed(2)} on ${topWeeklyCategory} this week.`;
  } else {
    headline.textContent = "No expenses recorded in the last 7 days.";
  }

  if (overallEntries.length) {
    subline.textContent = `You spend most on ${overallEntries[0][0]}.`;
  } else {
    subline.textContent = "Add a few transactions to unlock category-based insights.";
  }
}

// ================= TABLE =================

function renderTable(data) {
  const tbody = document.getElementById("transactionTableBody");
  const emptyState = document.getElementById("tableEmpty");

  if (!tbody) return;

  if (!data.length) {
    tbody.innerHTML = "";
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  if (emptyState) emptyState.style.display = "none";

  tbody.innerHTML = data.map((t) => `
    <tr>
      <td>${escapeHtml(t.title)}</td>
      <td>${escapeHtml(t.category)}</td>
      <td>${escapeHtml(t.type)}</td>
      <td>₹${Number(t.amount).toFixed(2)}</td>
      <td>${escapeHtml(t.date)}</td>
      <td>
        <button class="btn btn--ghost delete-btn" type="button" onclick="deleteTransaction('${t.id}')">
          Delete
        </button>
      </td>
    </tr>
  `).join("");
}

// ================= SPLIT TOOL =================

function setupSplitExpenseTool() {
  const form = document.getElementById("splitExpenseForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const amount = Number(document.getElementById("splitAmount").value);
    const people = Number(document.getElementById("splitPeople").value);
    const result = document.getElementById("splitResult");

    if (!result) return;

    if (!amount || !people || people <= 0) {
      result.textContent = "Please enter valid values.";
      result.classList.add("is-visible");
      return;
    }

    const perPerson = amount / people;
    result.textContent = `Each person pays ₹${perPerson.toFixed(2)}`;
    result.classList.add("is-visible");
  });
}

// ================= CHART =================

function renderChart(data) {
  const canvas = document.getElementById("expenseChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const centerText = document.getElementById("chartCenterText");
  const legend = document.getElementById("chartLegend");
  const insight = document.getElementById("chartInsight");
  const emptyState = document.getElementById("chartEmpty");

  const expenses = data.filter((t) => t.type === "expense");

  if (!expenses.length) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (centerText) centerText.textContent = "₹0.00";
    if (legend) legend.innerHTML = "";
    if (insight) insight.textContent = "No data yet";
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  if (emptyState) emptyState.style.display = "none";

  const grouped = {};
  expenses.forEach((t) => {
    grouped[t.category] = (grouped[t.category] || 0) + t.amount;
  });

  const entries = Object.entries(grouped);
  const total = entries.reduce((sum, [, val]) => sum + val, 0);

  const centerX = 160;
  const centerY = 160;
  const outerRadius = 120;
  const innerRadius = 58;

  let hoveredIndex = -1;

  function drawChart(progress = 1) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let startAngle = -Math.PI / 2;

    entries.forEach(([category, amount], i) => {
      const fullSlice = (amount / total) * 2 * Math.PI;
      const visibleSlice = fullSlice * progress;
      const endAngle = startAngle + visibleSlice;

      const midAngle = startAngle + visibleSlice / 2;
      const offset = i === hoveredIndex ? 10 : 0;
      const offsetX = Math.cos(midAngle) * offset;
      const offsetY = Math.sin(midAngle) * offset;

      ctx.beginPath();
      ctx.arc(centerX + offsetX, centerY + offsetY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX + offsetX, centerY + offsetY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = CHART_COLORS[i % CHART_COLORS.length];
      ctx.fill();

      ctx.strokeStyle = "#fff";
      ctx.lineWidth = i === hoveredIndex ? 4 : 2;
      ctx.stroke();

      startAngle += fullSlice;
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius - 2, 0, Math.PI * 2);
    ctx.fillStyle = "#FFF9EF";
    ctx.fill();

    if (centerText) {
      if (hoveredIndex >= 0) {
        const [category, amount] = entries[hoveredIndex];
        const percent = ((amount / total) * 100).toFixed(1);
        centerText.textContent = `${category}: ${percent}%`;
      } else {
        centerText.textContent = `₹${total.toFixed(2)}`;
      }
    }
  }

  let progress = 0;
  function animate() {
    progress += 0.04;
    if (progress > 1) progress = 1;

    drawChart(progress);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  animate();

  if (legend) {
    legend.innerHTML = entries
      .map(([c, a], i) => `
        <div class="legend-item">
          <strong>
            <span class="legend-dot legend-dot--${i % CHART_COLORS.length}"></span>
            ${escapeHtml(c)}
          </strong>
          <span>${(a / total * 100).toFixed(1)}%</span>
        </div>
      `)
      .join("");
  }

  if (insight) {
    const [top] = [...entries].sort((a, b) => b[1] - a[1]);
    const percent = ((top[1] / total) * 100).toFixed(0);
    insight.textContent = `You spend most on ${top[0]} (${percent}%)`;
  }

  canvas.onmousemove = function (e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < innerRadius || distance > outerRadius) {
      hoveredIndex = -1;
      canvas.style.cursor = "default";
      drawChart();
      return;
    }

    let angle = Math.atan2(dy, dx);
    if (angle < -Math.PI / 2) {
      angle += Math.PI * 2;
    }

    let startAngle = -Math.PI / 2;
    hoveredIndex = -1;

    entries.forEach(([category, amount], i) => {
      const slice = (amount / total) * 2 * Math.PI;
      const endAngle = startAngle + slice;

      if (angle >= startAngle && angle < endAngle) {
        hoveredIndex = i;
      }

      startAngle = endAngle;
    });

    canvas.style.cursor = hoveredIndex >= 0 ? "pointer" : "default";
    drawChart();
  };

  canvas.onmouseleave = function () {
    hoveredIndex = -1;
    canvas.style.cursor = "default";
    drawChart();
  };
}

// ================= HELPERS =================

function isWithinLast7Days(dateString) {
  const transactionDate = new Date(dateString);
  const today = new Date();
  const diff = today - transactionDate;
  return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
}

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function goBack(page) {
  window.location.href = page;
}
