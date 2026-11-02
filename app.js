const app = document.getElementById("app");

/* ---------- tool registry ---------- */
const TOOLS = [
  { id: "calculator", icon: "🧮", name: "Calculator", type: "tool", desc: "Quick everyday maths, keyboard friendly.", render: calculator },
  { id: "converter", icon: "📏", name: "Unit Converter", type: "tool", desc: "Length, weight and temperature.", render: converter },
  { id: "password", icon: "🔑", name: "Password Generator", type: "tool", desc: "Create strong random passwords.", render: passwordGen },
  { id: "stopwatch", icon: "⏱️", name: "Stopwatch & Timer", type: "tool", desc: "Time laps or count down.", render: stopwatch },
  { id: "wordcount", icon: "📝", name: "Word Counter", type: "tool", desc: "Words, characters and reading time.", render: wordCounter },
  { id: "bmi", icon: "⚖️", name: "BMI Calculator", type: "tool", desc: "Check your body mass index.", render: bmi },
  { id: "tictactoe", icon: "❌", name: "Tic Tac Toe", type: "game", desc: "Two players, one board.", render: ticTacToe },
  { id: "rps", icon: "✂️", name: "Rock Paper Scissors", type: "game", desc: "Beat the computer.", render: rockPaperScissors },
  { id: "guess", icon: "🎯", name: "Number Guess", type: "game", desc: "Find the secret number from 1 to 100.", render: numberGuess },
  { id: "memory", icon: "🃏", name: "Memory Match", type: "game", desc: "Flip cards and find the pairs.", render: memoryGame },
];

/* a colour and a little handwritten note for each tool */
const LOOK = {
  calculator: ["#ff7a59", "numbers, but make it quick"],
  converter: ["#4cc9f0", "miles, metres, whatever"],
  password: ["#80ed99", "future-you will thank you"],
  stopwatch: ["#ffd166", "on your marks..."],
  wordcount: ["#f78fb3", "for essays and captions"],
  bmi: ["#9b8cff", "just a number, be kind"],
  tictactoe: ["#ff7a59", "grab a friend"],
  rps: ["#4cc9f0", "rock beats scissors, always"],
  guess: ["#ffd166", "hot or cold?"],
  memory: ["#80ed99", "find all the pairs"],
};
TOOLS.forEach((t) => {
  t.color = LOOK[t.id][0];
  t.note = LOOK[t.id][1];
});

/* ---------- helpers ---------- */
const $ = (sel, root = app) => root.querySelector(sel);
let activeCleanup = null;
function cleanup() {
  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }
}

/* small wrapper so a blocked localStorage never breaks the site */
const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem("toolnest:" + key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem("toolnest:" + key, JSON.stringify(value));
    } catch (e) {}
  },
};

/* ---------- theme ---------- */
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]').content = t === "light" ? "#fbf4e8" : "#0e0821";
}
applyTheme(store.get("theme", "dark"));
document.getElementById("themeBtn").addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  store.set("theme", next);
  applyTheme(next);
});

/* ---------- confetti ---------- */
function confetti() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cv = document.getElementById("confetti");
  const ctx = cv.getContext("2d");
  cv.width = innerWidth;
  cv.height = innerHeight;
  const colors = ["#ff7a59", "#4cc9f0", "#80ed99", "#ffd166", "#f78fb3", "#c770f0"];
  const bits = Array.from({ length: 120 }, () => ({
    x: innerWidth / 2,
    y: innerHeight / 2.5,
    vx: (Math.random() - 0.5) * 14,
    vy: Math.random() * -12 - 3,
    s: Math.random() * 7 + 4,
    r: Math.random() * 6,
    c: colors[Math.floor(Math.random() * colors.length)],
  }));
  let frames = 0;
  (function tick() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    bits.forEach((b) => {
      b.x += b.vx;
      b.y += b.vy;
      b.vy += 0.35;
      b.r += 0.2;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.r);
      ctx.fillStyle = b.c;
      ctx.fillRect(-b.s / 2, -b.s / 2, b.s, b.s * 0.6);
      ctx.restore();
    });
    if (++frames < 110) requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, cv.width, cv.height);
  })();
}

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? "Burning the midnight oil?" : h < 12 ? "Good morning!" : h < 17 ? "Hey there!" : h < 21 ? "Good evening!" : "Late-night tinkering?";
}

/* ---------- router ---------- */
let filter = "all";

function route() {
  cleanup();
  const id = location.hash.replace("#", "") || "home";
  const tool = TOOLS.find((t) => t.id === id);
  window.scrollTo(0, 0);
  if (!tool) return home();
  document.title = `${tool.name} | ToolNest`;
  app.innerHTML = `<a href="#home" class="back">← Back to the nest</a>
    <div class="card ${tool.id === "wordcount" ? "wide" : ""}" id="tool" style="--tc:${tool.color}">
      <h2>${tool.name}</h2><p class="tagline">${tool.note}</p>
      <div id="toolbody"></div>
    </div>`;
  tool.render($("#toolbody"));
}

let query = "";

function tileHTML(t, favs) {
  const on = favs.includes(t.id);
  return `
    <div class="tile" style="--tc:${t.color}">
      <a class="tile-link" href="#${t.id}">
        <div class="icon">${t.icon}</div>
        <h3>${t.name}</h3>
        <p>${t.desc}</p>
      </a>
      <div class="meta">
        <span class="badge">${t.type}</span>
        <button class="star ${on ? "on" : ""}" data-fav="${t.id}" aria-label="${on ? "Unpin" : "Pin"} ${t.name}" title="${on ? "Unpin" : "Pin to top"}">${on ? "★" : "☆"}</button>
      </div>
    </div>`;
}

function home() {
  document.title = "ToolNest | Tools & Games";
  const favs = store.get("favs", []);
  const q = query.trim().toLowerCase();
  const list = TOOLS.filter(
    (t) => (filter === "all" || t.type === filter) && (!q || (t.name + " " + t.desc + " " + t.type).toLowerCase().includes(q))
  );
  const pinned = list.filter((t) => favs.includes(t.id));
  const rest = list.filter((t) => !favs.includes(t.id));
  app.innerHTML = `
    <section class="hero">
      <div class="hero-text">
        <p class="hello">${greeting()}</p>
        <h1>My little drawer of <span class="scribble">tools &amp; games
          <svg viewBox="0 0 200 14" preserveAspectRatio="none"><path d="M2 9 C 40 2, 70 13, 110 6 S 170 4, 198 8" fill="none" stroke="var(--accent2)" stroke-width="4" stroke-linecap="round"/></svg>
        </span></h1>
        <p class="lead">I'm Divyanshi. I built ToolNest while learning JavaScript, so everything here is hand-coded and nothing needs a sign-up. Use a tool, play a game, pin your favourites.</p>
        <div class="chips">
          <span class="chip">${TOOLS.filter((t) => t.type === "tool").length} tools</span>
          <span class="chip">${TOOLS.filter((t) => t.type === "game").length} games</span>
          <span class="chip">no ads</span>
          <span class="chip">free forever</span>
        </div>
      </div>
      <div class="hero-art">🪺<small>come on in!</small></div>
    </section>
    <div class="search"><input id="q" type="search" placeholder="Search tools and games..." value="${query.replace(/"/g, "&quot;")}" aria-label="Search" /></div>
    ${pinned.length ? `<h2 class="section-title">Pinned by you</h2><section class="grid">${pinned.map((t) => tileHTML(t, favs)).join("")}</section>` : ""}
    <h2 class="section-title">${pinned.length ? "Everything else" : filter === "game" ? "Games" : filter === "tool" ? "Tools" : "Everything in the nest"}</h2>
    ${rest.length ? `<section class="grid">${rest.map((t) => tileHTML(t, favs)).join("")}</section>` : `<p class="empty">${list.length ? "That's everything!" : "Nothing matches that. Try another word."}</p>`}`;

  document.querySelectorAll("nav a").forEach((a) => a.classList.toggle("active", a.dataset.filter === filter));

  const input = $("#q");
  input.addEventListener("input", () => {
    query = input.value;
    const pos = input.selectionStart;
    home();
    const again = $("#q");
    again.focus();
    again.setSelectionRange(pos, pos);
  });
  app.querySelectorAll("[data-fav]").forEach((b) =>
    b.addEventListener("click", () => {
      const id = b.dataset.fav;
      const cur = store.get("favs", []);
      store.set("favs", cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
      home();
    })
  );
}

document.querySelectorAll("nav a").forEach((a) =>
  a.addEventListener("click", () => {
    filter = a.dataset.filter;
    if (location.hash === "#home" || !location.hash) home();
  })
);
window.addEventListener("hashchange", route);
route();

/* ---------- Calculator ---------- */
function calculator(el) {
  let cur = "0", prev = null, op = null, fresh = false;
  el.innerHTML = `
    <div class="calc-screen"><div class="prev"></div><div class="cur">0</div></div>
    <div class="keys">
      <button class="fn" data-k="C">C</button><button class="fn" data-k="±">±</button><button class="fn" data-k="%">%</button><button class="op" data-k="/">÷</button>
      <button data-k="7">7</button><button data-k="8">8</button><button data-k="9">9</button><button class="op" data-k="*">×</button>
      <button data-k="4">4</button><button data-k="5">5</button><button data-k="6">6</button><button class="op" data-k="-">−</button>
      <button data-k="1">1</button><button data-k="2">2</button><button data-k="3">3</button><button class="op" data-k="+">+</button>
      <button class="span2" data-k="0">0</button><button data-k=".">.</button><button class="eq" data-k="=">=</button>
    </div>`;
  const sym = { "/": "÷", "*": "×", "-": "−", "+": "+" };
  const show = () => {
    $(".cur", el).textContent = cur;
    $(".prev", el).textContent = prev !== null && op ? `${prev} ${sym[op]}` : "";
  };
  const compute = (a, b, o) => {
    a = parseFloat(a);
    b = parseFloat(b);
    const r = o === "+" ? a + b : o === "-" ? a - b : o === "*" ? a * b : b === 0 ? NaN : a / b;
    return isNaN(r) ? "Error" : String(parseFloat(r.toPrecision(12)));
  };
  function press(k) {
    if (cur === "Error" && k !== "C") return;
    if (/\d/.test(k)) {
      cur = fresh || cur === "0" ? k : cur + k;
      fresh = false;
    } else if (k === ".") {
      if (fresh) {
        cur = "0.";
        fresh = false;
      } else if (!cur.includes(".")) cur += ".";
    } else if (k === "C") {
      cur = "0";
      prev = null;
      op = null;
      fresh = false;
    } else if (k === "±") {
      cur = cur.startsWith("-") ? cur.slice(1) : cur === "0" ? cur : "-" + cur;
    } else if (k === "%") {
      cur = String(parseFloat(cur) / 100);
    } else if (k === "=") {
      if (op !== null) {
        cur = compute(prev, cur, op);
        prev = null;
        op = null;
        fresh = true;
      }
    } else {
      if (op !== null && !fresh) cur = compute(prev, cur, op);
      prev = cur;
      op = k;
      fresh = true;
    }
    show();
  }
  el.addEventListener("click", (e) => {
    const k = e.target.dataset.k;
    if (k) press(k);
  });
  const onKey = (e) => {
    if (/^[0-9.+\-*/]$/.test(e.key)) press(e.key);
    else if (e.key === "Enter" || e.key === "=") {
      e.preventDefault();
      press("=");
    } else if (e.key === "Backspace") {
      cur = cur.length > 1 && cur !== "Error" ? cur.slice(0, -1) : "0";
      show();
    } else if (e.key === "Escape") press("C");
  };
  document.addEventListener("keydown", onKey);
  activeCleanup = () => document.removeEventListener("keydown", onKey);
}

/* ---------- Unit converter ---------- */
function converter(el) {
  const units = {
    Length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mile: 1609.344, ft: 0.3048, inch: 0.0254 },
    Weight: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.45359237, oz: 0.0283495 },
    Temperature: { "°C": 1, "°F": 1, K: 1 },
  };
  el.innerHTML = `
    <label>Category</label><select id="cat">${Object.keys(units).map((c) => `<option>${c}</option>`).join("")}</select>
    <label>Value</label><input id="val" type="number" value="1" />
    <div class="row"><div><label>From</label><select id="from"></select></div><div><label>To</label><select id="to"></select></div></div>
    <p class="center big" id="out"></p>`;
  const fillUnits = () => {
    const names = Object.keys(units[$("#cat", el).value]);
    $("#from", el).innerHTML = names.map((n) => `<option>${n}</option>`).join("");
    $("#to", el).innerHTML = names.map((n, i) => `<option ${i === 1 ? "selected" : ""}>${n}</option>`).join("");
  };
  const toC = (v, u) => (u === "°F" ? ((v - 32) * 5) / 9 : u === "K" ? v - 273.15 : v);
  const fromC = (v, u) => (u === "°F" ? (v * 9) / 5 + 32 : u === "K" ? v + 273.15 : v);
  const calc = () => {
    const cat = $("#cat", el).value;
    const v = parseFloat($("#val", el).value);
    const f = $("#from", el).value;
    const t = $("#to", el).value;
    if (isNaN(v)) {
      $("#out", el).textContent = "—";
      return;
    }
    const r = cat === "Temperature" ? fromC(toC(v, f), t) : (v * units[cat][f]) / units[cat][t];
    $("#out", el).textContent = `${parseFloat(r.toPrecision(8))} ${t}`;
  };
  $("#cat", el).addEventListener("change", () => {
    fillUnits();
    calc();
  });
  ["#val", "#from", "#to"].forEach((s) => $(s, el).addEventListener("input", calc));
  fillUnits();
  calc();
}

/* ---------- Password generator ---------- */
function passwordGen(el) {
  el.innerHTML = `
    <input id="pw" readonly />
    <label>Length: <b id="lenv">16</b></label><input id="len" type="range" min="6" max="40" value="16" />
    <label><input id="up" type="checkbox" checked style="width:auto"> Uppercase</label>
    <label><input id="lo" type="checkbox" checked style="width:auto"> Lowercase</label>
    <label><input id="nu" type="checkbox" checked style="width:auto"> Numbers</label>
    <label><input id="sy" type="checkbox" checked style="width:auto"> Symbols</label>
    <div class="row" style="margin-top:14px"><button id="gen">Generate</button><button id="copy" class="ghost">Copy</button></div>`;
  const gen = () => {
    let pool = "";
    if ($("#up", el).checked) pool += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if ($("#lo", el).checked) pool += "abcdefghijklmnopqrstuvwxyz";
    if ($("#nu", el).checked) pool += "0123456789";
    if ($("#sy", el).checked) pool += "!@#$%^&*()-_=+[]{};:,.?";
    if (!pool) {
      $("#pw", el).value = "Select at least one option";
      return;
    }
    const n = +$("#len", el).value;
    const buf = new Uint32Array(n);
    crypto.getRandomValues(buf);
    $("#pw", el).value = Array.from(buf, (x) => pool[x % pool.length]).join("");
  };
  $("#len", el).addEventListener("input", () => {
    $("#lenv", el).textContent = $("#len", el).value;
    gen();
  });
  $("#gen", el).addEventListener("click", gen);
  $("#copy", el).addEventListener("click", () => {
    navigator.clipboard.writeText($("#pw", el).value).then(() => {
      $("#copy", el).textContent = "Copied!";
      setTimeout(() => ($("#copy", el).textContent = "Copy"), 1200);
    });
  });
  el.querySelectorAll("input[type=checkbox]").forEach((c) => c.addEventListener("change", gen));
  gen();
}

/* ---------- Stopwatch & timer ---------- */
function stopwatch(el) {
  el.innerHTML = `
    <div class="row" style="margin-bottom:10px"><button id="mSw">Stopwatch</button><button id="mTm" class="ghost">Timer</button></div>
    <div id="body"></div>`;
  let handle = null;
  const stop = () => {
    clearInterval(handle);
    handle = null;
  };
  activeCleanup = stop;
  const fmt = (ms) => {
    const t = Math.max(0, Math.floor(ms / 10));
    const m = String(Math.floor(t / 6000)).padStart(2, "0");
    const s = String(Math.floor(t / 100) % 60).padStart(2, "0");
    return `${m}:${s}.${String(t % 100).padStart(2, "0")}`;
  };

  function sw() {
    stop();
    let base = 0, start = 0, laps = [];
    $("#body", el).innerHTML = `<p class="center big" id="t">00:00.00</p>
      <div class="row"><button id="go">Start</button><button id="lap" class="ghost">Lap</button><button id="rs" class="ghost">Reset</button></div>
      <ol id="laps"></ol>`;
    const tick = () => ($("#t", el).textContent = fmt(base + Date.now() - start));
    $("#go", el).onclick = () => {
      if (handle) {
        base += Date.now() - start;
        stop();
        $("#go", el).textContent = "Start";
      } else {
        start = Date.now();
        handle = setInterval(tick, 30);
        $("#go", el).textContent = "Pause";
      }
    };
    $("#lap", el).onclick = () => {
      const now = handle ? base + Date.now() - start : base;
      if (!now) return;
      laps.push(fmt(now));
      $("#laps", el).innerHTML = laps.map((l) => `<li>${l}</li>`).join("");
    };
    $("#rs", el).onclick = () => {
      stop();
      base = 0;
      laps = [];
      $("#t", el).textContent = "00:00.00";
      $("#laps", el).innerHTML = "";
      $("#go", el).textContent = "Start";
    };
  }

  function tm() {
    stop();
    $("#body", el).innerHTML = `<div class="row"><div><label>Minutes</label><input id="mm" type="number" min="0" value="1" /></div><div><label>Seconds</label><input id="ss" type="number" min="0" max="59" value="0" /></div></div>
      <p class="center big" id="t">01:00.00</p>
      <div class="row"><button id="go">Start</button><button id="rs" class="ghost">Reset</button></div>`;
    let end = 0, left = 0;
    const total = () => ((+$("#mm", el).value || 0) * 60 + (+$("#ss", el).value || 0)) * 1000;
    ["#mm", "#ss"].forEach((s) => {
      $(s, el).oninput = () => {
        if (!handle) {
          left = 0;
          $("#t", el).textContent = fmt(total());
        }
      };
    });
    $("#go", el).onclick = () => {
      if (handle) {
        left = end - Date.now();
        stop();
        $("#go", el).textContent = "Resume";
        return;
      }
      if (!left) left = total();
      if (!left) return;
      end = Date.now() + left;
      $("#go", el).textContent = "Pause";
      handle = setInterval(() => {
        const r = end - Date.now();
        $("#t", el).textContent = fmt(r);
        if (r <= 0) {
          stop();
          left = 0;
          $("#go", el).textContent = "Start";
          $("#t", el).textContent = "Time's up! ⏰";
        }
      }, 30);
    };
    $("#rs", el).onclick = () => {
      stop();
      left = 0;
      $("#go", el).textContent = "Start";
      $("#t", el).textContent = fmt(total());
    };
  }

  $("#mSw", el).onclick = () => {
    $("#mSw", el).className = "";
    $("#mTm", el).className = "ghost";
    sw();
  };
  $("#mTm", el).onclick = () => {
    $("#mTm", el).className = "";
    $("#mSw", el).className = "ghost";
    tm();
  };
  sw();
}

/* ---------- Word counter ---------- */
function wordCounter(el) {
  el.innerHTML = `
    <textarea id="txt" rows="8" placeholder="Type or paste your text here..."></textarea>
    <div class="scoreboard center">
      <div><div class="big" id="w">0</div><div class="muted">Words</div></div>
      <div><div class="big" id="c">0</div><div class="muted">Characters</div></div>
      <div><div class="big" id="s">0</div><div class="muted">Sentences</div></div>
      <div><div class="big" id="r">0</div><div class="muted">Min read</div></div>
    </div>`;
  $("#txt", el).addEventListener("input", () => {
    const raw = $("#txt", el).value;
    const t = raw.trim();
    const words = t ? t.split(/\s+/).length : 0;
    $("#w", el).textContent = words;
    $("#c", el).textContent = raw.length;
    $("#s", el).textContent = t ? (t.match(/[^.!?]+[.!?]*/g) || []).filter((x) => x.trim()).length : 0;
    $("#r", el).textContent = words ? Math.max(1, Math.round(words / 200)) : 0;
  });
}

/* ---------- BMI ---------- */
function bmi(el) {
  el.innerHTML = `
    <label>Weight (kg)</label><input id="kg" type="number" min="1" placeholder="e.g. 60" />
    <label>Height (cm)</label><input id="cm" type="number" min="1" placeholder="e.g. 165" />
    <button id="go" style="margin-top:14px;width:100%">Calculate</button>
    <p class="center big" id="out"></p><p class="center muted" id="cat"></p>`;
  $("#go", el).onclick = () => {
    const kg = +$("#kg", el).value;
    const m = +$("#cm", el).value / 100;
    if (!kg || !m) {
      $("#out", el).textContent = "";
      $("#cat", el).textContent = "Enter both values.";
      return;
    }
    const v = kg / (m * m);
    $("#out", el).textContent = v.toFixed(1);
    $("#cat", el).textContent = v < 18.5 ? "Underweight" : v < 25 ? "Healthy weight" : v < 30 ? "Overweight" : "Obese";
  };
}

/* ---------- Tic Tac Toe ---------- */
function ticTacToe(el) {
  const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  let b, turn, over;
  const score = store.get("ttt", { "⭕": 0, "❌": 0 });
  el.innerHTML = `<p class="center" id="msg"></p><div class="board"></div>
    <div class="scoreboard"><span>❌ <b id="sx">${score["❌"]}</b></span><span>⭕ <b id="so">${score["⭕"]}</b></span></div>
    <button id="new" style="width:100%">New game</button>`;
  const boardEl = $(".board", el);
  function reset() {
    b = Array(9).fill("");
    turn = "❌";
    over = false;
    boardEl.innerHTML = b.map((_, i) => `<button class="cell" data-i="${i}"></button>`).join("");
    $("#msg", el).textContent = `${turn}'s turn`;
  }
  boardEl.addEventListener("click", (e) => {
    const i = e.target.dataset.i;
    if (i === undefined || b[i] || over) return;
    b[i] = turn;
    e.target.textContent = turn;
    const w = lines.find((l) => l.every((x) => b[x] === turn));
    if (w) {
      over = true;
      w.forEach((x) => boardEl.children[x].classList.add("win"));
      score[turn]++;
      store.set("ttt", score);
      confetti();
      $("#sx", el).textContent = score["❌"];
      $("#so", el).textContent = score["⭕"];
      $("#msg", el).textContent = `${turn} wins! 🎉`;
    } else if (b.every(Boolean)) {
      over = true;
      $("#msg", el).textContent = "It's a draw!";
    } else {
      turn = turn === "❌" ? "⭕" : "❌";
      $("#msg", el).textContent = `${turn}'s turn`;
    }
  });
  $("#new", el).onclick = reset;
  reset();
}

/* ---------- Rock Paper Scissors ---------- */
function rockPaperScissors(el) {
  const moves = ["🪨", "📄", "✂️"];
  const beats = { "🪨": "✂️", "📄": "🪨", "✂️": "📄" };
  let s = store.get("rps", { you: 0, cpu: 0, tie: 0 });
  el.innerHTML = `
    <div class="rps-choices">${moves.map((m) => `<button data-m="${m}">${m}</button>`).join("")}</div>
    <p class="center big" id="res">Pick a move</p><p class="center muted" id="det"></p>
    <div class="scoreboard"><span>You <b id="y">${s.you}</b></span><span>Tie <b id="t">${s.tie}</b></span><span>CPU <b id="c">${s.cpu}</b></span></div>
    <button class="ghost" id="rs" style="width:100%">Reset score</button>`;
  el.addEventListener("click", (e) => {
    const m = e.target.dataset.m;
    if (!m) return;
    const cpu = moves[Math.floor(Math.random() * 3)];
    let r;
    if (m === cpu) {
      r = "It's a tie";
      s.tie++;
    } else if (beats[m] === cpu) {
      r = "You win! 🎉";
      s.you++;
      confetti();
    } else {
      r = "You lose 😅";
      s.cpu++;
    }
    $("#res", el).textContent = r;
    $("#det", el).textContent = `${m} vs ${cpu}`;
    $("#y", el).textContent = s.you;
    $("#t", el).textContent = s.tie;
    $("#c", el).textContent = s.cpu;
    store.set("rps", s);
  });
  $("#rs", el).onclick = () => {
    s = { you: 0, cpu: 0, tie: 0 };
    store.set("rps", s);
    ["#y", "#t", "#c"].forEach((x) => ($(x, el).textContent = 0));
    $("#res", el).textContent = "Pick a move";
    $("#det", el).textContent = "";
  };
}

/* ---------- Number guess ---------- */
function numberGuess(el) {
  let secret, tries;
  const showBest = () => {
    const b = store.get("guessBest", null);
    $("#best", el).textContent = b ? `Your best: ${b} tries` : "";
  };
  el.innerHTML = `<p class="center muted">I'm thinking of a number between 1 and 100.</p>
    <div class="row"><input id="g" type="number" min="1" max="100" placeholder="Your guess" /><button id="go" style="flex:0 0 auto">Guess</button></div>
    <p class="center big" id="msg"></p><p class="center muted" id="tries"></p><p class="best" id="best"></p>
    <button class="ghost" id="new" style="width:100%">New game</button>`;
  const reset = () => {
    secret = 1 + Math.floor(Math.random() * 100);
    tries = 0;
    $("#msg", el).textContent = "";
    $("#tries", el).textContent = "";
    $("#g", el).value = "";
    $("#g", el).disabled = false;
    showBest();
  };
  const guess = () => {
    const g = +$("#g", el).value;
    if (!g || g < 1 || g > 100) {
      $("#msg", el).textContent = "Enter 1-100";
      return;
    }
    tries++;
    $("#tries", el).textContent = `Tries: ${tries}`;
    if (g === secret) {
      $("#msg", el).textContent = `🎉 Got it in ${tries}!`;
      $("#g", el).disabled = true;
      const prevBest = store.get("guessBest", null);
      if (!prevBest || tries < prevBest) store.set("guessBest", tries);
      showBest();
      confetti();
    } else {
      $("#msg", el).textContent = g < secret ? "Too low ⬆️" : "Too high ⬇️";
      $("#g", el).select();
    }
  };
  $("#go", el).onclick = guess;
  $("#g", el).addEventListener("keydown", (e) => e.key === "Enter" && guess());
  $("#new", el).onclick = reset;
  reset();
}

/* ---------- Memory match ---------- */
function memoryGame(el) {
  const icons = ["🍎", "🚀", "🎸", "🌙", "🐱", "⚡", "🍕", "🎲"];
  let first = null, lock = false, moves = 0, found = 0;
  el.innerHTML = `<p class="center" id="info">Moves: 0</p><div class="memory"></div><p class="best" id="best"></p>
    <button id="new" style="width:100%">New game</button>`;
  const grid = $(".memory", el);
  function reset() {
    first = null;
    lock = false;
    moves = 0;
    found = 0;
    $("#info", el).textContent = "Moves: 0";
    const b = store.get("memBest", null);
    $("#best", el).textContent = b ? `Your best: ${b} moves` : "";
    const deck = [...icons, ...icons].sort(() => Math.random() - 0.5);
    grid.innerHTML = deck.map((c, i) => `<button class="mem" data-i="${i}" data-c="${c}">?</button>`).join("");
  }
  grid.addEventListener("click", (e) => {
    const b = e.target;
    if (!b.dataset.c || lock || b === first || b.classList.contains("done")) return;
    b.textContent = b.dataset.c;
    b.classList.add("open");
    if (!first) {
      first = b;
      return;
    }
    moves++;
    $("#info", el).textContent = `Moves: ${moves}`;
    if (first.dataset.c === b.dataset.c) {
      first.classList.replace("open", "done");
      b.classList.replace("open", "done");
      first = null;
      found++;
      if (found === icons.length) {
        $("#info", el).textContent = `🎉 Done in ${moves} moves!`;
        const best = store.get("memBest", null);
        if (!best || moves < best) store.set("memBest", moves);
        $("#best", el).textContent = `Your best: ${store.get("memBest", moves)} moves`;
        confetti();
      }
    } else {
      lock = true;
      const a = first;
      first = null;
      setTimeout(() => {
        [a, b].forEach((x) => {
          x.textContent = "?";
          x.classList.remove("open");
        });
        lock = false;
      }, 800);
    }
  });
  $("#new", el).onclick = reset;
  reset();
}
