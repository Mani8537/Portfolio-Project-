/* ── State ── */
let currentItem     = "Tomato";
let currentCategory = "Vegetables";
let currentPincode  = "500001";
let currentPlatform = "Blinkit";
let trendChart      = null;

const PLATFORM_COLORS = {
  Blinkit:   "#EF9F27",
  BigBasket: "#639922",
  JioMart:   "#378ADD",
};

/* ── Bootstrap ── */
window.addEventListener("DOMContentLoaded", () => {
  loadStats();
  loadCategories();
  loadCheapest();
});

/* ── Stats ── */
async function loadStats() {
  const d = await fetch("/api/stats").then(r => r.json());
  document.getElementById("stat-items").textContent     = d.total_items;
  document.getElementById("stat-platforms").textContent = d.platforms;
  document.getElementById("stat-pincodes").textContent  = d.pincodes_covered;
  const ts = d.last_update ? d.last_update.slice(0, 16) : "—";
  document.getElementById("stat-updated").textContent   = ts;
}

/* ── Categories & items ── */
async function loadCategories() {
  const cats = await fetch("/api/categories").then(r => r.json());
  const sel  = document.getElementById("category-select");
  sel.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join("");
  currentCategory = cats[0];
  await loadItems();
}

async function loadItems() {
  currentCategory = document.getElementById("category-select").value;
  const items = await fetch(`/api/items?category=${currentCategory}`).then(r => r.json());
  const sel   = document.getElementById("item-select");
  sel.innerHTML = items.map(i => `<option value="${i}">${i}</option>`).join("");
  currentItem   = items[0];
  await loadCompare();
  await loadCheapest();
}

async function loadCompare() {
  currentItem = document.getElementById("item-select").value;
  const data  = await fetch(`/api/compare?item=${encodeURIComponent(currentItem)}&pincode=${currentPincode}`)
                  .then(r => r.json());
  renderCompare(data);
  buildPlatformTabs(data);
  await loadTrend();
}

/* ── Compare cards ── */
function renderCompare(data) {
  const el = document.getElementById("compare-results");
  if (!data.length) { el.innerHTML = `<div class="empty-msg">No data found.</div>`; return; }

  const minPrice = data[0].price;
  el.innerHTML = data.map((d, i) => {
    const isCheapest = i === 0;
    const savings    = i > 0 ? `Save ₹${(d.price - minPrice).toFixed(0)} vs ${data[0].platform}` : "";
    const cls        = i === 0 ? "cheapest" : i === 1 ? "mid" : "expensive";
    return `
      <div class="compare-card ${cls}">
        <div class="cc-platform ${d.platform}">${d.platform}</div>
        <div class="cc-price">₹${d.price}</div>
        <div class="cc-unit">${d.unit}</div>
        ${isCheapest ? `<span class="cc-badge badge-best">Best</span>` : ""}
        ${savings ? `<div class="badge-save">${savings}</div>` : ""}
      </div>`;
  }).join("");
}

/* ── Platform tabs ── */
function buildPlatformTabs(data) {
  const el = document.getElementById("platform-tabs");
  const platforms = data.map(d => d.platform);
  if (!platforms.includes(currentPlatform)) currentPlatform = platforms[0];
  el.innerHTML = platforms.map(p =>
    `<button class="ptab ${p === currentPlatform ? 'active' : ''}" onclick="switchPlatform('${p}')">${p}</button>`
  ).join("");
}

function switchPlatform(p) {
  currentPlatform = p;
  document.querySelectorAll(".ptab").forEach(b => b.classList.toggle("active", b.textContent === p));
  loadTrend();
}

/* ── Trend chart ── */
async function loadTrend() {
  const data = await fetch(
    `/api/history?item=${encodeURIComponent(currentItem)}&platform=${currentPlatform}&pincode=${currentPincode}`
  ).then(r => r.json());

  const labels = data.map(d => {
    const dt = new Date(d.day);
    return dt.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  });
  const prices = data.map(d => d.price);
  const color  = PLATFORM_COLORS[currentPlatform] || "#378ADD";

  if (trendChart) trendChart.destroy();
  const ctx = document.getElementById("trend-chart").getContext("2d");
  trendChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: `${currentItem} — ${currentPlatform}`,
        data: prices,
        borderColor: color,
        backgroundColor: color + "18",
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: color,
        tension: 0.35,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ₹${ctx.parsed.y}`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, color: "#888" } },
        y: {
          grid: { color: "#f0ede6" },
          ticks: {
            font: { size: 11 },
            color: "#888",
            callback: v => "₹" + v
          }
        }
      }
    }
  });
}

/* ── Cheapest list ── */
async function loadCheapest() {
  const data = await fetch(
    `/api/cheapest?pincode=${currentPincode}&category=${currentCategory}`
  ).then(r => r.json());

  const el = document.getElementById("cheapest-results");
  if (!data.length) { el.innerHTML = `<div class="empty-msg">No data found.</div>`; return; }

  el.innerHTML = data.map(d => `
    <div class="cheapest-row">
      <span class="cr-item">${d.item}</span>
      <div class="cr-right">
        <span class="cr-platform plt-${d.platform}">${d.platform}</span>
        <span class="cr-price">₹${d.price}<span style="font-size:10px;font-weight:400;color:#888"> /${d.unit}</span></span>
      </div>
    </div>`
  ).join("");
}

/* ── Pincode change ── */
function onPincodeChange() {
  currentPincode = document.getElementById("pincode-select").value;
  loadCompare();
  loadCheapest();
}

/* ── Refresh ── */
async function refreshPrices() {
  const btn = document.getElementById("refresh-btn");
  btn.innerHTML = '<span class="spinning">↻</span> Refreshing…';
  btn.disabled  = true;
  await fetch("/api/refresh");
  await Promise.all([loadStats(), loadCompare(), loadCheapest()]);
  btn.innerHTML = "↻ Refresh prices";
  btn.disabled  = false;
}
