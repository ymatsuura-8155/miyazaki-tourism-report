/**
 * 宮崎市観光統計 インタラクティブWEBレポート
 * Style: Monad — Editorial Tech Journal on Warm Parchment
 */

document.addEventListener("DOMContentLoaded", () => {
  if (typeof MIYAZAKI_TOURISM_DATA === "undefined") {
    console.error("Tourism data not loaded!");
    return;
  }

  const { years, history_timeline } = MIYAZAKI_TOURISM_DATA;
  let currentYearIndex = 0; // Default to first year (平成25年 / 2013)
  let isPlaying = false;
  let playInterval = null;
  let playSpeed = 1500; // ms per year (1.0x default)

  // Chart instances
  let macroChartInstance = null;
  let monthlyChartInstance = null;
  let inboundChartInstance = null;
  let facilityChartInstance = null;
  let spendingChartInstance = null;
  let compareChartInstance = null;

  // DOM Elements
  const slider = document.getElementById("timelineSlider");
  const playBtn = document.getElementById("playBtn");
  const yearDisplayJp = document.getElementById("yearDisplayJp");
  const yearDisplayAd = document.getElementById("yearDisplayAd");
  const yearThemeChip = document.getElementById("yearThemeChip");
  const sliderTicksContainer = document.getElementById("sliderTicks");

  // KPI Elements
  const kpiVisitorsVal = document.getElementById("kpiVisitorsVal");
  const kpiVisitorsYoy = document.getElementById("kpiVisitorsYoy");
  const kpiVisitorsSub = document.getElementById("kpiVisitorsSub");
  const barVisitorsOutside = document.getElementById("barVisitorsOutside");
  const barVisitorsInside = document.getElementById("barVisitorsInside");

  const kpiStaysVal = document.getElementById("kpiStaysVal");
  const kpiStaysYoy = document.getElementById("kpiStaysYoy");
  const kpiStaysSub = document.getElementById("kpiStaysSub");
  const barStaysMiyazaki = document.getElementById("barStaysMiyazaki");
  const barStaysAoshima = document.getElementById("barStaysAoshima");

  const kpiInboundVal = document.getElementById("kpiInboundVal");
  const kpiInboundYoy = document.getElementById("kpiInboundYoy");
  const kpiInboundSub = document.getElementById("kpiInboundSub");

  const kpiSpendingVal = document.getElementById("kpiSpendingVal");
  const kpiSpendingYoy = document.getElementById("kpiSpendingYoy");
  const kpiSpendingSub = document.getElementById("kpiSpendingSub");

  // Narrative Elements
  const narrativeYearTitle = document.getElementById("narrativeYearTitle");
  const narrativeBody = document.getElementById("narrativeBody");
  const positiveFactorsList = document.getElementById("positiveFactorsList");
  const negativeFactorsList = document.getElementById("negativeFactorsList");

  // Navigation Links
  const navLinks = document.querySelectorAll(".nav-link");
  const sectionIds = {
    dashboard: "sectionDashboard",
    compare: "sectionCompare",
    macro: "sectionMacro",
    timeline: "sectionTimeline",
    table: "sectionTable"
  };

  // ==========================================================================
  // Slider & Ticks Setup
  // ==========================================================================
  slider.min = 0;
  slider.max = years.length - 1;
  slider.value = currentYearIndex;

  sliderTicksContainer.innerHTML = "";
  years.forEach((item, idx) => {
    const node = document.createElement("div");
    node.className = `tick-node ${idx === currentYearIndex ? "active" : ""}`;
    const shortYear = item.year_jp.replace("平成", "H").replace("令和", "R");
    node.innerHTML = `
      <div class="tick-dot"></div>
      <span>${shortYear}</span>
    `;
    node.addEventListener("click", () => {
      if (isPlaying) stopPlayback();
      setYearIndex(idx);
    });
    sliderTicksContainer.appendChild(node);
  });

  slider.addEventListener("input", (e) => {
    if (isPlaying) stopPlayback();
    setYearIndex(parseInt(e.target.value, 10));
  });

  function updateSliderFill() {
    const pct = (currentYearIndex / (years.length - 1)) * 100;
    slider.style.background = `linear-gradient(to right, #2b59d1 0%, #2b59d1 ${pct}%, #cecac8 ${pct}%, #cecac8 100%)`;
  }

  // ==========================================================================
  // Playback Control (Brutalist Time-Lapse)
  // ==========================================================================
  function togglePlayback() {
    if (isPlaying) stopPlayback();
    else startPlayback();
  }

  function startPlayback() {
    isPlaying = true;
    playBtn.innerHTML = "❚❚";
    playBtn.classList.add("playing");
    playBtn.title = "一時停止";

    if (playInterval) {
      clearInterval(playInterval);
      playInterval = null;
    }

    playInterval = setInterval(() => {
      if (!isPlaying) return;
      if (currentYearIndex < years.length - 1) {
        setYearIndex(currentYearIndex + 1);
      } else {
        // Loop back to beginning when reaching the end
        setYearIndex(0);
      }
    }, playSpeed);
  }

  function stopPlayback() {
    isPlaying = false;
    playBtn.innerHTML = "▶";
    playBtn.classList.remove("playing");
    playBtn.title = "アニメーション自動再生";
    if (playInterval) {
      clearInterval(playInterval);
      playInterval = null;
    }
  }

  playBtn.addEventListener("click", togglePlayback);

  document.querySelectorAll(".btn-speed-item").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".btn-speed-item").forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      playSpeed = parseInt(e.target.dataset.speed, 10);
      if (isPlaying) {
        clearInterval(playInterval);
        startPlayback();
      }
    });
  });

  // ==========================================================================
  // Set Year Index & Trigger Dynamic Rolling Animation
  // ==========================================================================
  function setYearIndex(idx) {
    currentYearIndex = idx;
    slider.value = idx;
    updateSliderFill();

    const nodes = sliderTicksContainer.querySelectorAll(".tick-node");
    nodes.forEach((t, i) => {
      if (i === idx) t.classList.add("active");
      else t.classList.remove("active");
    });

    const data = years[idx];

    yearDisplayJp.textContent = data.year_jp;
    yearDisplayAd.textContent = `(${data.year_ad})`;
    yearThemeChip.textContent = data.theme;

    updateKPIs(data);
    updateNarrative(data);
    updateCharts(data, idx);
  }

  // Smooth Counter Animation
  function animateValue(element, start, end, duration = 450, formatter = (v) => v.toLocaleString()) {
    const range = end - start;
    if (range === 0) {
      element.textContent = formatter(end);
      return;
    }
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = start + range * ease;
      element.textContent = formatter(Math.round(current));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = formatter(end);
      }
    }
    requestAnimationFrame(step);
  }

  function updateKPIs(data) {
    const prevVisitors = parseInt(kpiVisitorsVal.textContent.replace(/,/g, ""), 10) || data.visitors.total;
    animateValue(kpiVisitorsVal, prevVisitors, data.visitors.total);
    setYoyTag(kpiVisitorsYoy, data.visitors.yoy);
    kpiVisitorsSub.textContent = `県外: ${data.visitors.outside.toLocaleString()}千人 / 県内: ${data.visitors.inside.toLocaleString()}千人`;

    const totalVisitors = data.visitors.total;
    barVisitorsOutside.style.width = `${(data.visitors.outside / totalVisitors) * 100}%`;
    barVisitorsInside.style.width = `${(data.visitors.inside / totalVisitors) * 100}%`;

    const prevStays = parseInt(kpiStaysVal.textContent.replace(/,/g, ""), 10) || data.stays.total;
    animateValue(kpiStaysVal, prevStays, data.stays.total);
    setYoyTag(kpiStaysYoy, data.stays.yoy);
    kpiStaysSub.textContent = `宮崎地区: ${data.stays.miyazaki.toLocaleString()}千人 / 青島地区: ${data.stays.aoshima.toLocaleString()}千人`;

    const totalStays = data.stays.total;
    barStaysMiyazaki.style.width = `${(data.stays.miyazaki / totalStays) * 100}%`;
    barStaysAoshima.style.width = `${(data.stays.aoshima / totalStays) * 100}%`;

    const prevInbound = parseInt(kpiInboundVal.textContent.replace(/,/g, ""), 10) || data.inbound.total;
    animateValue(kpiInboundVal, prevInbound, data.inbound.total);
    setYoyTag(kpiInboundYoy, data.inbound.yoy);
    const topCountry = Object.keys(data.inbound.top_countries)[0] || "韓国";
    const topCount = data.inbound.top_countries[topCountry] || 0;
    kpiInboundSub.textContent = `首位市場: ${topCountry} (${topCount.toLocaleString()}人)`;

    const prevSpending = parseFloat(kpiSpendingVal.textContent.replace(/,/g, "")) || data.spending.total_oku;
    animateValue(kpiSpendingVal, prevSpending, data.spending.total_oku, 450, (v) => v.toFixed(1));
    const spendingYoy = currentYearIndex > 0 ? (data.spending.total_oku / years[currentYearIndex - 1].spending.total_oku) * 100 : 100;
    setYoyTag(kpiSpendingYoy, spendingYoy);
    kpiSpendingSub.textContent = `1人当宿泊: ¥${data.spending.per_stay.toLocaleString()} / 日帰り: ¥${data.spending.per_day.toLocaleString()}`;
  }

  function setYoyTag(element, yoy) {
    if (!yoy || yoy === 100) {
      element.className = "yoy-tag";
      element.textContent = "±0%";
      return;
    }
    const diff = (yoy - 100).toFixed(1);
    if (diff > 0) {
      element.className = "yoy-tag positive";
      element.textContent = `+${diff}%`;
    } else {
      element.className = "yoy-tag negative";
      element.textContent = `${diff}%`;
    }
  }

  function updateNarrative(data) {
    narrativeYearTitle.textContent = `${data.year_jp} (${data.year_ad}) 観光動向ハイライト：${data.theme}`;
    narrativeBody.textContent = data.highlights;

    positiveFactorsList.innerHTML = "";
    data.positive_factors.forEach((f) => {
      const li = document.createElement("li");
      li.textContent = f;
      positiveFactorsList.appendChild(li);
    });

    negativeFactorsList.innerHTML = "";
    data.negative_factors.forEach((f) => {
      const li = document.createElement("li");
      li.textContent = f;
      negativeFactorsList.appendChild(li);
    });
  }

  // ==========================================================================
  // Chart.js (Monad Editorial Tech Journal Aesthetic)
  // ==========================================================================
  function initCharts() {
    if (typeof Chart === "undefined") {
      console.warn("Chart.js not available");
      return;
    }

    // Monad Defaults: Warm Parchment canvas, Graphite text, Ash hairline borders, JetBrains Mono font
    Chart.defaults.color = "#4e4d4d";
    Chart.defaults.borderColor = "#cecac8";
    Chart.defaults.font.family = "'JetBrains Mono', monospace";

    // 1. Long-Term Trajectory (Macro Trend)
    const ctxMacro = document.getElementById("chartMacro").getContext("2d");
    const labels = years.map((y) => y.year_jp.replace("平成", "H").replace("令和", "R"));
    const visitorsData = years.map((y) => y.visitors.total);
    const staysData = years.map((y) => y.stays.total);

    macroChartInstance = new Chart(ctxMacro, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "観光入込客数 (千人)",
            data: visitorsData,
            borderColor: "#2b59d1",
            backgroundColor: "rgba(43, 89, 209, 0.07)",
            borderWidth: 2,
            fill: true,
            tension: 0.15,
            pointBackgroundColor: labels.map((_, i) => (i === currentYearIndex ? "#2b59d1" : "#f6f3f1")),
            pointBorderColor: labels.map((_, i) => (i === currentYearIndex ? "#2b59d1" : "#242424")),
            pointRadius: labels.map((_, i) => (i === currentYearIndex ? 7 : 3.5)),
            pointHoverRadius: 8,
            yAxisID: "y"
          },
          {
            label: "延べ宿泊客数 (千人)",
            data: staysData,
            borderColor: "#242424",
            borderDash: [3, 3],
            borderWidth: 1.8,
            fill: false,
            tension: 0.15,
            pointBackgroundColor: labels.map((_, i) => (i === currentYearIndex ? "#2b59d1" : "#797776")),
            pointRadius: labels.map((_, i) => (i === currentYearIndex ? 5 : 2.5)),
            yAxisID: "y1"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            position: "top",
            labels: {
              boxWidth: 12,
              font: { family: "'JetBrains Mono', monospace", size: 11, weight: 500 }
            }
          },
          tooltip: {
            backgroundColor: "#242424",
            borderColor: "#cecac8",
            borderWidth: 1,
            titleFont: { family: "'Newsreader', Georgia, serif", size: 14, weight: 400 },
            bodyFont: { family: "'JetBrains Mono', monospace", size: 12 },
            titleColor: "#f6f3f1",
            bodyColor: "#cfdaf5",
            padding: 12,
            cornerRadius: 6
          }
        },
        scales: {
          y: {
            type: "linear",
            position: "left",
            title: { display: true, text: "入込客数 (千人)", font: { size: 11, family: "'JetBrains Mono', monospace" } },
            grid: { color: "#cecac8" }
          },
          y1: {
            type: "linear",
            position: "right",
            title: { display: true, text: "宿泊客数 (千人)", font: { size: 11, family: "'JetBrains Mono', monospace" } },
            grid: { drawOnChartArea: false }
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: "'JetBrains Mono', monospace", size: 11 } }
          }
        }
      }
    });

    // 2. Inbound Market Share (Doughnut)
    const ctxInbound = document.getElementById("chartInbound").getContext("2d");
    const currentInbound = years[currentYearIndex].inbound.top_countries;
    inboundChartInstance = new Chart(ctxInbound, {
      type: "doughnut",
      data: {
        labels: Object.keys(currentInbound),
        datasets: [
          {
            data: Object.values(currentInbound),
            backgroundColor: ["#2b59d1", "#cfdaf5", "#ff9473", "#a0b5eb", "#a7fccd", "#ecda98"],
            borderWidth: 2,
            borderColor: "#f6f3f1"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              boxWidth: 12,
              font: { family: "'JetBrains Mono', monospace", size: 11 },
              padding: 10
            }
          },
          tooltip: {
            backgroundColor: "#242424",
            borderColor: "#cecac8",
            borderWidth: 1,
            titleColor: "#f6f3f1",
            bodyColor: "#cfdaf5",
            cornerRadius: 6
          }
        },
        cutout: "70%"
      }
    });

    // 3. Monthly Rhythm (Jan-Dec)
    const ctxMonthly = document.getElementById("chartMonthly").getContext("2d");
    monthlyChartInstance = new Chart(ctxMonthly, {
      type: "bar",
      data: {
        labels: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
        datasets: [
          {
            label: "月別入込客数 (千人)",
            data: years[currentYearIndex].monthly_visitors,
            backgroundColor: "#2b59d1",
            borderRadius: 4,
            yAxisID: "y"
          },
          {
            type: "line",
            label: "月別宿泊客数 (千人)",
            data: years[currentYearIndex].monthly_stays,
            borderColor: "#242424",
            backgroundColor: "#242424",
            borderWidth: 1.8,
            tension: 0.15,
            pointRadius: 3,
            yAxisID: "y1"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top", labels: { boxWidth: 12, font: { size: 11, family: "'JetBrains Mono', monospace" } } },
          tooltip: { backgroundColor: "#242424", borderColor: "#cecac8", borderWidth: 1, titleColor: "#f6f3f1", bodyColor: "#cfdaf5", cornerRadius: 6 }
        },
        scales: {
          y: { position: "left", grid: { color: "#cecac8" }, title: { display: true, text: "千人", font: { size: 10 } } },
          y1: { position: "right", grid: { drawOnChartArea: false } },
          x: { grid: { display: false } }
        }
      }
    });

    // 4. Key Facility Attendance (Horizontal Bar)
    const ctxFacility = document.getElementById("chartFacility").getContext("2d");
    const currentFacilities = years[currentYearIndex].facilities;
    facilityChartInstance = new Chart(ctxFacility, {
      type: "bar",
      data: {
        labels: Object.keys(currentFacilities),
        datasets: [
          {
            label: "年間来場者数 (人)",
            data: Object.values(currentFacilities),
            backgroundColor: ["#2b59d1", "#426fe4", "#658cf0", "#8faae6", "#cfdaf5", "#a0b5eb"],
            borderRadius: 4
          }
        ]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: "#242424", borderColor: "#cecac8", borderWidth: 1, titleColor: "#f6f3f1", bodyColor: "#cfdaf5", cornerRadius: 6 } },
        scales: {
          x: { grid: { color: "#cecac8" } },
          y: { grid: { display: false } }
        }
      }
    });

    // 5. Spending Breakdown (Doughnut)
    const ctxSpending = document.getElementById("chartSpending").getContext("2d");
    const currSpend = years[currentYearIndex].spending;
    spendingChartInstance = new Chart(ctxSpending, {
      type: "doughnut",
      data: {
        labels: ["宿泊費", "みやげ品費", "交通費", "飲食・雑費"],
        datasets: [
          {
            data: [currSpend.stay_total_oku, currSpend.souvenir_oku, currSpend.transport_oku, currSpend.other_oku],
            backgroundColor: ["#2b59d1", "#242424", "#a0b5eb", "#cfdaf5"],
            borderWidth: 2,
            borderColor: "#f6f3f1"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "right", labels: { boxWidth: 12, font: { size: 11, family: "'JetBrains Mono', monospace" } } },
          tooltip: { backgroundColor: "#242424", borderColor: "#cecac8", borderWidth: 1, titleColor: "#f6f3f1", bodyColor: "#cfdaf5", cornerRadius: 6 }
        },
        cutout: "70%"
      }
    });
  }

  function updateCharts(data, idx) {
    if (!macroChartInstance) return;

    // Macro Chart highlight
    macroChartInstance.data.datasets[0].pointBackgroundColor = years.map((_, i) => (i === idx ? "#2b59d1" : "#f6f3f1"));
    macroChartInstance.data.datasets[0].pointBorderColor = years.map((_, i) => (i === idx ? "#2b59d1" : "#242424"));
    macroChartInstance.data.datasets[0].pointRadius = years.map((_, i) => (i === idx ? 7 : 3.5));
    macroChartInstance.data.datasets[1].pointRadius = years.map((_, i) => (i === idx ? 5 : 2.5));
    macroChartInstance.update("none");

    // Monthly Chart
    if (monthlyChartInstance) {
      monthlyChartInstance.data.datasets[0].data = data.monthly_visitors;
      monthlyChartInstance.data.datasets[1].data = data.monthly_stays;
      monthlyChartInstance.update();
    }

    // Inbound Chart
    if (inboundChartInstance) {
      inboundChartInstance.data.labels = Object.keys(data.inbound.top_countries);
      inboundChartInstance.data.datasets[0].data = Object.values(data.inbound.top_countries);
      inboundChartInstance.update();
    }

    // Facility Chart
    if (facilityChartInstance) {
      facilityChartInstance.data.labels = Object.keys(data.facilities);
      facilityChartInstance.data.datasets[0].data = Object.values(data.facilities);
      facilityChartInstance.update();
    }

    // Spending Chart
    if (spendingChartInstance) {
      spendingChartInstance.data.datasets[0].data = [
        data.spending.stay_total_oku,
        data.spending.souvenir_oku,
        data.spending.transport_oku,
        data.spending.other_oku
      ];
      spendingChartInstance.update();
    }
  }

  // ==========================================================================
  // Nav Links Smooth Scroll Navigation
  // ==========================================================================
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      const target = link.dataset.target;
      const targetId = sectionIds[target];
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Top Announcement Bar link
  const ctaTableLink = document.getElementById("ctaTableLink");
  if (ctaTableLink) {
    ctaTableLink.addEventListener("click", (e) => {
      e.preventDefault();
      const targetEl = document.getElementById("sectionTable");
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        navLinks.forEach((l) => {
          if (l.dataset.target === "table") l.classList.add("active");
          else l.classList.remove("active");
        });
      }
    });
  }

  // Active section scroll spy
  window.addEventListener("scroll", () => {
    const scrollPos = window.scrollY + 180;
    const entries = Object.entries(sectionIds).map(([key, id]) => ({
      key,
      el: document.getElementById(id)
    })).filter((item) => item.el);

    for (let i = entries.length - 1; i >= 0; i--) {
      if (scrollPos >= entries[i].el.offsetTop) {
        navLinks.forEach((l) => {
          if (l.dataset.target === entries[i].key) l.classList.add("active");
          else l.classList.remove("active");
        });
        break;
      }
    }
  }, { passive: true });

  // ==========================================================================
  // 2-Year Comparison Simulator (年度を指定して比較)
  // ==========================================================================
  const selectYearA = document.getElementById("selectYearA");
  const selectYearB = document.getElementById("selectYearB");

  function initComparisonSimulator() {
    if (!selectYearA || !selectYearB) return;

    if (selectYearA.options.length === 0) {
      selectYearA.innerHTML = "";
      selectYearB.innerHTML = "";
      years.forEach((y, idx) => {
        const optA = document.createElement("option");
        optA.value = idx;
        optA.textContent = `${y.year_jp} (${y.year_ad})`;
        const optB = document.createElement("option");
        optB.value = idx;
        optB.textContent = `${y.year_jp} (${y.year_ad})`;
        selectYearA.appendChild(optA);
        selectYearB.appendChild(optB);
      });

      // Default: Target A = latest (令和7年 / idx 12), Baseline B = previous (令和6年 / idx 11)
      const defaultA = Math.max(0, years.length - 1);
      const defaultB = Math.max(0, years.length - 2);
      selectYearA.value = String(defaultA);
      selectYearB.value = String(defaultB);

      selectYearA.addEventListener("change", runComparison);
      selectYearB.addEventListener("change", runComparison);
    }
    runComparison();
  }

  function runComparison() {
    const idxA = parseInt(selectYearA.value, 10);
    const idxB = parseInt(selectYearB.value, 10);
    const yA = years[idxA];
    const yB = years[idxB];

    renderCompareMetric("compareVisitors", "TOTAL VISITORS // 観光入込客数", yA.visitors.total, yB.visitors.total, "千人", yA.year_jp, yB.year_jp);
    renderCompareMetric("compareStays", "OVERNIGHT STAYS // 延べ宿泊客数", yA.stays.total, yB.stays.total, "千人", yA.year_jp, yB.year_jp);
    renderCompareMetric("compareInbound", "INBOUND // 外国人延べ宿泊者数", yA.inbound.total, yB.inbound.total, "人", yA.year_jp, yB.year_jp);
    renderCompareMetric("compareSpending", "SPENDING // 観光消費額総額", yA.spending.total_oku, yB.spending.total_oku, "億円", yA.year_jp, yB.year_jp);
    renderCompareMetric("comparePerStay", "STAY UNIT COST // 1人当宿泊単価", yA.spending.per_stay, yB.spending.per_stay, "円", yA.year_jp, yB.year_jp);
    renderCompareMetric("compareCamp", "SPRING CAMP // プロ野球等キャンプ来場", yA.spring_camp.total, yB.spring_camp.total, "人", yA.year_jp, yB.year_jp);

    updateCompareChart(yA, yB);
  }

  function renderCompareMetric(id, label, valA, valB, unit, nameA, nameB) {
    const el = document.getElementById(id);
    if (!el) return;
    const diff = valA - valB;
    const pct = valB > 0 ? ((diff / valB) * 100).toFixed(1) : 0;
    const sign = diff >= 0 ? "+" : "";
    const colorClass = diff >= 0 ? "positive" : "negative";

    el.innerHTML = `
      <div class="compare-mini-title">${label}</div>
      <div class="compare-col-group">
        <div>
          <div class="compare-year-label">${nameB} (基準)</div>
          <div class="compare-val-large" style="color: var(--color-graphite); font-size:20px;">
            ${valB.toLocaleString()}<span style="font-size:12px; font-family:var(--font-mono); margin-left:2px;">${unit}</span>
          </div>
        </div>
        <div style="text-align: center;">
          <span class="yoy-tag ${colorClass}" style="font-size:12px; padding: 4px 10px; display:inline-block;">
            ${sign}${diff.toLocaleString()}${unit}<br>(${sign}${pct}%)
          </span>
        </div>
        <div style="text-align: right;">
          <div class="compare-year-label" style="color: var(--color-lake-blue); font-weight:500;">${nameA} (対象)</div>
          <div class="compare-val-large" style="color: var(--color-off-black);">
            ${valA.toLocaleString()}<span style="font-size:12px; font-family:var(--font-mono); margin-left:2px;">${unit}</span>
          </div>
        </div>
      </div>
    `;
  }

  function updateCompareChart(yA, yB) {
    const canvas = document.getElementById("chartCompare");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (compareChartInstance) {
      compareChartInstance.destroy();
      compareChartInstance = null;
    }

    compareChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["観光入込客数(万人)", "延べ宿泊者数(万人)", "インバウンド(万人)", "観光消費額(10億円)"],
        datasets: [
          {
            label: `${yB.year_jp} (基準)`,
            data: [
              parseFloat((yB.visitors.total / 10).toFixed(1)),
              parseFloat((yB.stays.total / 10).toFixed(1)),
              parseFloat((yB.inbound.total / 10000).toFixed(1)),
              parseFloat((yB.spending.total_oku / 10).toFixed(1))
            ],
            backgroundColor: "#cecac8",
            borderRadius: 4
          },
          {
            label: `${yA.year_jp} (対象)`,
            data: [
              parseFloat((yA.visitors.total / 10).toFixed(1)),
              parseFloat((yA.stays.total / 10).toFixed(1)),
              parseFloat((yA.inbound.total / 10000).toFixed(1)),
              parseFloat((yA.spending.total_oku / 10).toFixed(1))
            ],
            backgroundColor: "#2b59d1",
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top", labels: { font: { family: "'JetBrains Mono', monospace", size: 12, weight: 500 } } },
          tooltip: { backgroundColor: "#242424", borderColor: "#cecac8", borderWidth: 1, titleColor: "#f6f3f1", bodyColor: "#cfdaf5", cornerRadius: 6 }
        },
        scales: {
          y: { grid: { color: "#cecac8" }, ticks: { font: { family: "'JetBrains Mono', monospace", size: 11 } } },
          x: { grid: { display: false }, ticks: { font: { family: "'JetBrains Mono', monospace", size: 11 } } }
        }
      }
    });
  }

  // ==========================================================================
  // Historical Chronology Tape
  // ==========================================================================
  function renderHistoricalTimeline() {
    const container = document.getElementById("timelineEventsContainer");
    if (!container || container.children.length > 0) return;

    history_timeline.forEach((event) => {
      const block = document.createElement("div");
      block.className = "timeline-item-block";
      block.innerHTML = `
        <span class="time-tag">${event.era} (${event.year_ad})</span>
        <div class="time-title">${event.title}</div>
        <div class="time-desc">${event.desc}</div>
      `;

      const targetYear = years.findIndex((y) => y.year_ad === event.year_ad);
      if (targetYear !== -1) {
        block.title = "クリックしてダッシュボードで表示";
        block.addEventListener("click", () => {
          document.querySelector('[data-target="dashboard"]').click();
          setYearIndex(targetYear);
        });
      }
      container.appendChild(block);
    });
  }

  // ==========================================================================
  // Data Repository (Full Table & CSV)
  // ==========================================================================
  function renderFullDataTable() {
    const tbody = document.getElementById("dataTableBody");
    if (!tbody || tbody.children.length > 0) return;

    years.forEach((y) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${y.year_jp}</strong> (${y.year_ad})</td>
        <td>${y.visitors.total.toLocaleString()}</td>
        <td>${y.visitors.outside.toLocaleString()}</td>
        <td>${y.visitors.inside.toLocaleString()}</td>
        <td>${y.stays.total.toLocaleString()}</td>
        <td>${y.stays.outside.toLocaleString()}</td>
        <td>${y.stays.inside.toLocaleString()}</td>
        <td style="font-weight:600; color:var(--color-off-black);">${y.inbound.total.toLocaleString()}</td>
        <td style="font-weight:600; color:var(--color-off-black);">${y.spending.total_oku.toFixed(1)}</td>
        <td>¥${y.spending.per_stay.toLocaleString()}</td>
        <td>¥${y.spending.per_day.toLocaleString()}</td>
        <td style="text-align:left; font-size:12px; max-width:280px; white-space:normal; color:var(--color-graphite);">${y.theme}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  const exportCsvBtn = document.getElementById("exportCsvBtn");
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", () => {
      let csvContent = "\uFEFF年次,西暦,観光入込客数(千人),県外客(千人),県内客(千人),延べ宿泊客数(千人),県外宿泊(千人),県内宿泊(千人),外国人宿泊客数(人),観光消費額(億円),宿泊消費単価(円),日帰り消費単価(円),主要テーマ\n";
      years.forEach((y) => {
        csvContent += `"${y.year_jp}",${y.year_ad},${y.visitors.total},${y.visitors.outside},${y.visitors.inside},${y.stays.total},${y.stays.outside},${y.stays.inside},${y.inbound.total},${y.spending.total_oku},${y.spending.per_stay},${y.spending.per_day},"${y.theme}"\n`;
      });
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `miyazaki_tourism_archive_2013_2025.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  const searchInput = document.getElementById("tableSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();
      const rows = document.querySelectorAll("#dataTableBody tr");
      rows.forEach((r) => {
        const text = r.textContent.toLowerCase();
        r.style.display = text.includes(term) ? "" : "none";
      });
    });
  }
  // ==========================================================================
  // Monad Assistant Widget Interactivity
  // ==========================================================================
  const suggestionChips = document.querySelectorAll(".suggestion-chip");
  suggestionChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const targetYearIdx = parseInt(chip.dataset.year, 10);
      if (!isNaN(targetYearIdx)) {
        if (isPlaying) stopPlayback();
        setYearIndex(targetYearIdx);
        const dashboardEl = document.getElementById("sectionDashboard");
        if (dashboardEl) {
          dashboardEl.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });

  const widgetToggleBtn = document.getElementById("widgetToggleBtn");
  const widgetBody = document.getElementById("widgetBody");
  if (widgetToggleBtn && widgetBody) {
    widgetToggleBtn.addEventListener("click", () => {
      const isClosed = widgetBody.style.display === "none";
      widgetBody.style.display = isClosed ? "block" : "none";
      widgetToggleBtn.textContent = isClosed ? "−" : "+";
    });
  }

  // ==========================================================================
  // Immediate Initial Load: Populate and Render All Sections on Page Load
  // ==========================================================================
  initCharts();
  initComparisonSimulator();
  renderHistoricalTimeline();
  renderFullDataTable();

  // Start App with default year (平成25年 / 2013) and 1.0x autoplay
  setYearIndex(0);
  startPlayback();
});
