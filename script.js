// 🎧 Spotify Dashboard Script (readability-focused, same colors)
console.log("🎧 Spotify Dashboard Script Loaded");

// Register datalabels once (safe repeat)
try {
  if (window.Chart && window.ChartDataLabels) {
    Chart.register(ChartDataLabels);
    console.log("✅ ChartDataLabels registered");
  }
} catch (e) {
  console.warn("⚠️ Could not register ChartDataLabels:", e);
}

// 1) Fade-in animation on page load
document.body.style.opacity = 0;
window.addEventListener("load", () => {
  document.body.style.transition = "opacity 1s ease";
  document.body.style.opacity = 1;
});

// ----- Readability helpers (NO color changes) -----
const fmtNum = (n) => {
  if (n >= 1e9) return (n/1e9).toFixed(1).replace(/\.0$/,'') + 'B';
  if (n >= 1e6) return (n/1e6).toFixed(1).replace(/\.0$/,'') + 'M';
  if (n >= 1e3) return (n/1e3).toFixed(1).replace(/\.0$/,'') + 'k';
  return String(n);
};

const niceTooltip = {
  backgroundColor: "rgba(0,0,0,0.7)",
  titleColor: "#fff",
  bodyColor: "#fff",
  borderColor: "#1db954", // same green
  borderWidth: 1,
  callbacks: {
    label: (ctx) => {
      const l = ctx.dataset?.label ? ctx.dataset.label + ': ' : '';
      const v = ctx.raw;
      return l + (typeof v === 'number' ? v.toLocaleString() : v);
    }
  }
};

const baseGrid = {
  color: "rgba(255,255,255,0.08)",
  borderDash: [4, 4],
  tickLength: 0
};

const readableLayout = { layout: { padding: { top: 8, right: 10, bottom: 4, left: 8 } } };

const lineReadability = {
  elements: {
    line: { borderWidth: 3, capStyle: 'round', joinStyle: 'round' },
    point: { radius: 4, hoverRadius: 6, hitRadius: 8, borderWidth: 2 }
  }
};

const barReadability = {
  datasets: {
    bar: {
      borderSkipped: false, borderWidth: 1.5, borderRadius: 12,
      maxBarThickness: 42, categoryPercentage: 0.7, barPercentage: 0.8
    }
  }
};

const legendReadability = {
  legend: {
    position: 'top',
    labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true, padding: 12 }
  }
};

const axisReadability = {
  scales: {
    x: { grid: { display: false }, ticks: { color: "#c7f7d2", autoSkip: true, maxRotation: 0 } },
    y: { beginAtZero: true, grid: baseGrid, ticks: { color: "#c7f7d2", callback: fmtNum } }
  }
};

const datalabelsReadable = window.ChartDataLabels ? {
  datalabels: { anchor: 'end', align: 'end', offset: -6, font: { weight: '600' } }
} : {};

// Simple element fade-in
const chartFadeIn = (id, delay = 0) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.opacity = 0;
  el.style.transform = "translateY(15px)";
  setTimeout(() => {
    el.style.transition = "opacity 1s ease, transform 1s ease";
    el.style.opacity = 1;
    el.style.transform = "translateY(0)";
  }, delay);
};

// Vertical gradient that adapts to chart size (same colors)
function makeVerticalGradient(ctx, chart, from = "rgba(29,185,84,0.45)", to = "rgba(29,185,84,0)") {
  const { chartArea } = chart || {};
  if (!chartArea) return from; // not measured yet
  const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  g.addColorStop(0, from);
  g.addColorStop(1, to);
  return g;
}

// ---- Fetch data and render charts ----
fetch("/api/data")
  .then((res) => res.json())
  .then((data) => {
    console.log("✅ Data from backend:", data);

    const {
      weeklyListening = [12, 14, 13, 16, 18, 22, 24],
      freeToPremium = [], // kept for future use
      campaignData = {},
      regions = {},
    } = data;

    // Weekly Listening (line)
    const listeningCanvas = document.getElementById("listeningChart");
    if (listeningCanvas) {
      let listeningChart;
      const buildListening = () => {
        const ctx = listeningCanvas.getContext("2d");
        listeningChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [{
              label: "Listening Time (min)",
              data: weeklyListening,
              borderColor: "#1db954",
              backgroundColor: (a) => makeVerticalGradient(a.chart.ctx, a.chart, "rgba(29,185,84,0.45)", "rgba(29,185,84,0)"),
              borderWidth: 2.5,
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: "#1db954",
              pointBorderColor: "#0f3220",
              fill: true,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            ...readableLayout,
            ...legendReadability,
            ...axisReadability,
            ...lineReadability,
            plugins: {
              legend: legendReadability.legend,
              title: { display: true, text: "Weekly Listening Momentum", color: "#fff", font: { size: 14, weight: 600 } },
              tooltip: niceTooltip,
              ...(window.ChartDataLabels ? { datalabels: { display: false } } : {})
            }
          },
        });
      };
      buildListening();
      listeningCanvas.addEventListener("resize", () => listeningChart?.update());
      chartFadeIn("listeningChart", 100);
    }

    // Conversion (bar)
    const conversionCanvas = document.getElementById("conversionChart");
    if (conversionCanvas) {
      const vA = campaignData.versionA?.conversions ?? 0;
      const vB = campaignData.versionB?.conversions ?? 0;

      new Chart(conversionCanvas, {
        type: "bar",
        data: {
          labels: ["Version A", "Version B"],
          datasets: [{
            label: "Conversions",
            data: [vA, vB],
            backgroundColor: ["rgba(85,85,85,0.75)", "rgba(29,185,84,0.85)"],
            borderColor: ["#555", "#1db954"],
            borderWidth: 1.5,
            borderRadius: 12,
            hoverBackgroundColor: ["#777", "#28f077"],
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          ...readableLayout,
          ...axisReadability,
          plugins: {
            title: { display: true, text: "A/B Campaign Performance", color: "#fff", font: { size: 14, weight: 600 } },
            legend: legendReadability.legend,
            tooltip: niceTooltip,
            ...datalabelsReadable
          },
          ...barReadability
        },
      });
      chartFadeIn("conversionChart", 300);
    }

    // A/B share (doughnut)
    const abCanvas = document.getElementById("abChart");
    if (abCanvas) {
      const vA = campaignData.versionA?.conversions ?? 0;
      const vB = campaignData.versionB?.conversions ?? 0;

      new Chart(abCanvas, {
        type: "doughnut",
        data: {
          labels: ["Version A", "Version B"],
          datasets: [{
            data: [vA, vB],
            backgroundColor: ["#1db954", "#84e684"],
            hoverBackgroundColor: ["#1ed760", "#a4ffb0"],
            borderWidth: 3,
            borderColor: "#0d1210",
            hoverOffset: 6,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "58%",
          spacing: 2,
          rotation: -90,
          plugins: {
            title: { display: true, text: "Campaign Conversion Share", color: "#fff", font: { size: 14, weight: 600 } },
            legend: { position: "bottom", labels: { color: "#eafff5", usePointStyle: true, padding: 12 } },
            // To show % labels inside, uncomment below (colors unchanged):
            // datalabels: {
            //   color: "#fff",
            //   font: { weight: 700 },
            //   formatter: (value, ctx) => {
            //     const arr = ctx.chart.data.datasets[0].data;
            //     const total = arr.reduce((a,b)=>a+b,0) || 1;
            //     return Math.round((value/total)*100) + "%";
            //   }
            // }
          },
        },
      });
      chartFadeIn("abChart", 500);
    }

    // Regions (horizontal bar)
    const regionCanvas = document.getElementById("regionChart");
    if (regionCanvas && regions && Object.keys(regions).length > 0) {
      new Chart(regionCanvas, {
        type: "bar",
        data: {
          labels: Object.keys(regions),
          datasets: [{
            label: "Growth (%)",
            data: Object.values(regions),
            backgroundColor: ["#1db954", "#1ed760", "#9fffb0", "#68ff9f", "#2fd479"],
            borderColor: "#0b2e1a",
            borderWidth: 1.2,
            borderRadius: 10,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: "y",
          ...readableLayout,
          plugins: {
            title: { display: true, text: "🌍 Fastest-Growing Audiobook Markets", color: "#fff", font: { size: 16, weight: 600 } },
            legend: { display: false },
            ...datalabelsReadable
          },
          scales: {
            x: { beginAtZero: true, max: 40, ticks: { color: "#c7f7d2", stepSize: 5, callback: (v)=>v }, grid: baseGrid },
            y: { ticks: { color: "#e6fff3" }, grid: { display: false } }
          },
          ...barReadability
        },
      });
      chartFadeIn("regionChart", 700);
    }

    // Growth (lines)
    const growthCanvas = document.getElementById("growthChart");
    if (growthCanvas) {
      let growthChart;
      const buildGrowth = () => {
        const ctx = growthCanvas.getContext("2d");
        growthChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: ["2023", "2024", "2025"],
            datasets: [
              {
                label: "Audiobook Listeners (YoY % Growth)",
                data: [100, 136, 185],
                borderColor: "#1db954",
                backgroundColor: (a) =>
                  makeVerticalGradient(a.chart.ctx, a.chart, "rgba(132, 230, 132, 0.45)", "rgba(15, 46, 25, 0)"),
                borderWidth: 3,
                fill: true,
                tension: 0.35,
                pointRadius: 4,
                pointHoverRadius: 6,
              },
              {
                label: "Listening Hours (YoY % Growth)",
                data: [100, 137, 187],
                borderColor: "#84e684",
                backgroundColor: "rgba(132, 230, 132, 0.1)",
                borderWidth: 2,
                fill: false,
                tension: 0.35,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            ...readableLayout,
            ...legendReadability,
            ...axisReadability,
            ...lineReadability,
            plugins: {
              legend: legendReadability.legend,
              title: { display: true, text: "Audiobook Listener Growth Over Time (2023–2025)", color: "#fff", font: { size: 14, weight: 600 } },
              tooltip: niceTooltip,
              ...(window.ChartDataLabels ? { datalabels: { display: false } } : {})
            }
          },
        });
      };
      buildGrowth();
      growthCanvas.addEventListener("resize", () => growthChart?.update());
      chartFadeIn("growthChart", 900);
    }
  })
  .catch((err) => {
    console.error("❌ Error fetching /api/data:", err);
  });

// ---- AI Insight Section ----
document.getElementById("generate")?.addEventListener("click", async () => {
  const prompt = document.getElementById("prompt")?.value || "";
  const responseBox = document.getElementById("response");
  if (!responseBox) return;

  responseBox.textContent = "✨ Thinking...";
  responseBox.style.color = "#999";

  try {
    const res = await fetch("/api/insight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt }),
    });
    const data = await res.json();
    responseBox.textContent = data.reply ?? "No reply.";
    responseBox.style.color = "#a0e4af";
  } catch (error) {
    console.error("❌ /api/insight error:", error);
    responseBox.textContent = "⚠️ Error generating insight.";
    responseBox.style.color = "#ff7777";
  }
});

document.getElementById("clearBtn")?.addEventListener("click", () => {
  const promptEl = document.getElementById("prompt");
  const responseEl = document.getElementById("response");
  if (promptEl) promptEl.value = "";
  if (responseEl) responseEl.textContent = "";
});

// Reveal-on-scroll
const reveals = document.querySelectorAll(".reveal");
const revealOnScroll = () => {
  for (const el of reveals) {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      el.classList.add("visible");
    }
  }
};
window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

// Optional: export & refresh
document.getElementById("exportBtn")?.addEventListener("click", () => {
  const cv = document.getElementById("listeningChart");
  if (!cv) return;
  const url = cv.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = "chart-listening.png";
  a.click();
});

document.getElementById("refreshBtn")?.addEventListener("click", () => {
  const responseEl = document.getElementById("response");
  if (responseEl) {
    responseEl.textContent = "Refreshed data (demo).";
    setTimeout(() => (responseEl.textContent = ""), 2000);
  }
});

  /* ===== Export & Refresh wiring ===== */

// Export: download each chart canvas as a PNG
(function setupExport() {
  const btn = document.getElementById('btnExport');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const canvases = Array.from(document.querySelectorAll('.plot > canvas'));

    if (!canvases.length) {
      alert('No charts to export yet. Try again after the charts render.');
      return;
    }

    canvases.forEach((canvas, i) => {
      // Use card title as filename when available
      const title =
        canvas.closest('.card')?.querySelector('h2')?.textContent?.trim() ||
        `chart-${i + 1}`;

      // Ensure the canvas has something drawn (height/width > 0)
      const hasSize = canvas.width > 0 && canvas.height > 0;
      if (!hasSize) {
        console.warn(`Skipping export: empty canvas (${title})`);
        return;
      }

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png'); // no cross-origin images used, so safe
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.png`;

      // Space out clicks slightly to avoid popup blockers
      document.body.appendChild(link);
      setTimeout(() => {
        link.click();
        link.remove();
      }, i * 200);
    });
  });
})();

// Refresh: simple page reload
(function setupRefresh() {
  const btn = document.getElementById('btnRefresh');
  if (!btn) return;
  btn.addEventListener('click', () => {
    // If you’re pulling data from /api/data, this grabs fresh data quickly
    location.reload();
  });
})();