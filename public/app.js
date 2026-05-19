const API_URL = "/api/signal";

const $ = (id) => document.getElementById(id);

function formatUSD(n) {
  if (n == null) return "indisponível";
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }) + " BRT";
}

function scoreClass(s) {
  if (s > 0) return "score-pos";
  if (s < 0) return "score-neg";
  return "score-zero";
}

function scoreLabel(s) {
  if (s > 0) return `+${s}`;
  return String(s);
}

function renderIndicators(indicators) {
  const tbody = $("indicators-body");
  tbody.innerHTML = indicators.map((ind) => `
    <tr>
      <td class="ind-name">${ind.name}</td>
      <td class="ind-score ${scoreClass(ind.score)}">${scoreLabel(ind.score)}</td>
      <td class="ind-summary">${ind.summary}</td>
    </tr>
  `).join("");
}

function renderRules(rules) {
  const list = $("rules-list");
  if (!rules || rules.length === 0) {
    list.innerHTML = `<li class="no-rules">Nenhuma regra composta ativa no momento.</li>`;
    return;
  }
  list.innerHTML = rules.map((r) => `
    <li class="rule-item">
      <div class="rule-name">${r.name}</div>
      <ul class="rule-reasons">${r.reasons.map((x) => `<li>${x}</li>`).join("")}</ul>
    </li>
  `).join("");
}

function renderPlaybook(playbook) {
  $("playbook-allowed").innerHTML = playbook.allowed
    .map((x) => `<li>${x}</li>`).join("");
  $("playbook-avoid").innerHTML = playbook.avoid
    .map((x) => `<li>${x}</li>`).join("");
}

function render(signal) {
  $("h-regime").textContent = signal.regime.replace(/_/g, " ");
  $("h-regime").className = `hero-value regime-${signal.regime}`;

  $("h-bias").textContent = `Viés: ${signal.actionBias.replace(/_/g, " ")}`;

  $("h-score").textContent = scoreLabel(signal.score.weighted);
  $("h-score").className = `hero-value ${scoreClass(signal.score.weighted)}`;

  $("h-risk").innerHTML = `Risco: <span class="risk-${signal.riskLevel}">${signal.riskLevel}</span>`;
  $("h-raw").textContent = `Score bruto: ${scoreLabel(signal.score.raw)}`;

  $("h-price").textContent = formatUSD(signal.btcPrice);

  $("ts").textContent = formatTime(signal.generatedAt);

  renderIndicators(signal.indicators);
  renderRules(signal.triggeredRules);
  renderPlaybook(signal.playbook);
  $("summary-text").textContent = signal.summary || "—";
}

function setState(state, errorMsg) {
  $("loading").style.display = state === "loading" ? "block" : "none";
  $("error-msg").style.display = state === "error" ? "block" : "none";
  $("dashboard").style.display = state === "ready" ? "block" : "none";
  if (state === "error") $("error-msg").textContent = errorMsg || "Erro desconhecido.";
}

async function fetchSignal() {
  const btn = $("refresh");
  btn.disabled = true;
  setState("loading");

  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `HTTP ${res.status}`);
    }
    const signal = await res.json();
    render(signal);
    setState("ready");
  } catch (err) {
    setState("error", `Falha ao carregar: ${err.message}`);
  } finally {
    btn.disabled = false;
  }
}

$("refresh").addEventListener("click", fetchSignal);
fetchSignal();
