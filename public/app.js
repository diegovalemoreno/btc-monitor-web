const API_URL = "/api/signal";
const $ = (id) => document.getElementById(id);

// ── Descrições educativas por indicador ───────────────────────
const TOOLTIPS = {
  "Medo & Ganância": "Mede o sentimento geral do mercado de 0 (pânico total) a 100 (euforia total).\n\nAbaixo de 25 = medo extremo — historicamente bom momento para comprar.\nAcima de 75 = euforia — risco alto de correção.\n\nQuando todos têm medo, pode ser hora de comprar. Quando todos estão eufóricos, cuidado.",

  "Taxa de Funding": "Taxa paga entre traders de futuros a cada 8 horas.\n\nPositiva e alta (>0,03%) = a maioria está alavancada comprando — mercado sobreaquecido, risco de queda brusca.\nNegativa = maioria apostando na queda — sinal de fundo, possível reversão para cima.",

  "Variação 7d": "Variação percentual do BTC nos últimos 7 dias.\n\nQuedas fortes (>10% em uma semana) costumam ser bons pontos de entrada para DCA tático.\nNão indica topo ou fundo por si só — funciona melhor em conjunto com outros sinais.",

  "Open Interest": "Valor total de contratos futuros abertos no mercado.\n\nPreço cai + OI cai forte = traders alavancados sendo liquidados (desalavancagem saudável).\nPreço sobe + OI sobe muito = mercado cada vez mais alavancado = risco aumentado.",

  "Liq. de Longs": "Volume de posições compradas forçadas a fechar por falta de margem.\n\nLiquidações massivas de longs costumam marcar fundos de curto prazo — o mercado 'limpa' posições fracas.\nAlto volume de liquidações + queda de preço = possível exaustão vendedora.",

  "MVRV": "Market Value to Realized Value — compara o valor de mercado atual com o custo médio de compra de todos os BTCs em circulação.\n\nAbaixo de 1 = a maioria dos holders está no prejuízo = zona de capitulação histórica (raro e excelente para comprar).\nAcima de 6 = maioria com lucro enorme = zona de euforia (topo histórico).",

  "Preço Realizado": "Preço médio ao qual cada BTC foi movimentado pela última vez — representa o custo médio do mercado.\n\nBTC abaixo do preço realizado = maioria dos holders está no prejuízo = oportunidade histórica muito rara.\nBTC acima = mercado em lucro médio.",

  "Mayer Multiple": "Preço atual dividido pela média móvel de 200 dias.\n\nAbaixo de 0,8 = BTC extremamente barato em relação à sua própria média histórica (ocorre poucas vezes por ciclo).\nAcima de 2,4 = extremamente caro = zona de topo de ciclo.",

  "Hash Ribbon": "Compara o poder computacional de mineração dos últimos 30 e 60 dias.\n\nQuando o hashrate cai (mineradores desligando máquinas por prejuízo) e depois volta a subir = capitulação dos mineradores terminou.\nHistoricamente um dos sinais de compra mais confiáveis após períodos de bear market.",

  "Pressão venda": "Mede a proporção de volume de venda em relação ao de compra nas exchanges.\n\nAlta pressão = grandes carteiras (whales) distribuindo BTC = sinal de cautela.\nBaixa pressão = mercado absorvendo bem, sem grandes vendedores.",

  "Médias Móveis": "Posição do preço em relação às médias de 200 dias (curto/médio prazo) e 50 semanas (longo prazo).\n\nAbaixo das duas médias = zona historicamente barata, rara em ciclos de alta.\nAcima das duas = mercado aquecido, cuidado com entradas grandes.",

  "ETF Institucional": "Monitora o volume financeiro dos 4 maiores ETFs de Bitcoin: IBIT (BlackRock), FBTC (Fidelity), GBTC (Grayscale) e ARKB.\n\nVolume muito acima da média + ETFs subindo = demanda institucional forte.\nVolume muito acima da média + ETFs caindo = instituições distribuindo.\nVolume baixo = instituições inativas, mercado sem catalisador institucional.",

  "Pi Cycle Top": "Indicador técnico que compara a média de 111 dias com o dobro da média de 350 dias.\n\nQuando a linha de 111 dias cruza ACIMA do dobro da linha de 350 dias = sinal histórico de topo de ciclo (aconteceu nos topos de 2013, 2017 e 2021).\nQuanto mais longe do cruzamento, menor o risco de topo iminente.",

  "Bollinger %B": "Mostra onde o preço está dentro das Bandas de Bollinger (faixa de volatilidade baseada em desvio padrão).\n\n0% ou abaixo = preço abaixo da banda inferior = oversold (muito vendido), historicamente bom para comprar.\n100% ou acima = preço acima da banda superior = overbought (muito comprado), cuidado com entradas.",

  "DXY (Dólar Index)": "Índice que mede a força do dólar americano contra uma cesta de moedas globais.\n\nDXY subindo = dólar fortalecendo = pressão sobre ativos de risco como BTC.\nDXY caindo = dólar enfraquecendo = ambiente favorável para BTC e outros ativos.\n\nCorrelação inversa com BTC — quando o dólar sobe, BTC tende a cair.",

  "Regime de Mercado": "Classificação geral do momento atual do mercado, derivada da combinação de todos os indicadores.\n\nCAPTULATION ZONE = zona de capitulação histórica (raríssima, excelente oportunidade).\nTACTICAL BUY = sinal de compra com força variável.\nNEUTRAL = sem sinal claro, manter DCA normal.\nRISK OFF / EXTREME RISK = cautela, reduzir exposição.\nEUPHORIA ZONE = topo de ciclo provável, não aumentar posição.",

  "Sinais Compostos": "Confluência de múltiplos indicadores extremos ao mesmo tempo.\n\nQuando vários indicadores batem limites históricos juntos (ex: medo extremo + MVRV < 1 + Mayer < 0,8), o sinal de compra é muito mais confiável do que qualquer indicador isolado.\nCAPTULATION ZONE = 3 indicadores de fundo ativos juntos.\nEUPHORIA ZONE = 3 indicadores de topo ativos juntos.",

  "Long/Short Ratio": "Proporção de traders com posições compradas (long) versus vendidas (short) na Binance Futures.\n\nRatio acima de 1,5 = mercado lotado de apostas na alta = risco elevado (posição contrária).\nRatio abaixo de 0,7 = maioria apostando na queda = sinal contrário de possível reversão para cima.\n\nMercados com todos do mesmo lado costumam surpreender na direção oposta.",

  "BTC Dominância": "Percentual do Bitcoin no valor total de todo o mercado de criptomoedas.\n\nAcima de 60% = BTC season — Bitcoin lidera o mercado, bom contexto para acumular.\nAbaixo de 45% = Alt season — altcoins outperformando, fase tardia de ciclo de alta.\nAbaixo de 40% = euforia extrema nas altcoins = provável topo de ciclo se aproximando.",

  "Stablecoin Ratio": "Compara o tamanho do mercado de stablecoins (USDT, USDC, DAI) com o market cap do Bitcoin.\n\nSSR baixo (< 4) = muito dinheiro parado em stablecoins esperando para entrar no mercado = força compradora disponível = bullish.\nSSR alto (> 10) = pouco dinheiro relativo em stablecoins = pouco combustível para subida.",
};

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

function escapeHtml(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function renderIndicators(indicators) {
  const grid = $("indicators-body");
  grid.innerHTML = indicators.map((ind) => {
    const tip = TOOLTIPS[ind.name] || "";
    const tipAttr = tip ? `data-tooltip="${escapeHtml(tip)}"` : "";
    const sc = scoreClass(ind.score);
    const sigClass = ind.score > 0 ? "sig-pos" : ind.score < 0 ? "sig-neg" : "sig-zero";
    return `<div class="ind-card ${sigClass}${tip ? " has-tooltip" : ""}" ${tipAttr}>
      <div class="ind-card-header">
        <span class="ind-card-name">${ind.name}</span>
        <span class="${sc}"><span class="score-badge">${scoreLabel(ind.score)}</span></span>
      </div>
      <div class="ind-card-summary">${ind.summary}</div>
    </div>`;
  }).join("");
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
  $("playbook-allowed").innerHTML = playbook.allowed.map((x) => `<li>${x}</li>`).join("");
  $("playbook-avoid").innerHTML = playbook.avoid.map((x) => `<li>${x}</li>`).join("");
}

function render(signal) {
  $("h-regime").textContent = signal.regime.replace(/_/g, " ");
  $("h-regime").className = `hero-value regime-${signal.regime}`;
  $("h-bias").textContent = `Viés: ${signal.actionBias.replace(/_/g, " ")}`;
  const regimeCard = document.getElementById("hero-regime");
  if (regimeCard) regimeCard.style.borderLeftColor = `var(--regime-${signal.regime})`;
  $("h-score").textContent = scoreLabel(signal.score.weighted);
  $("h-score").className = `hero-value ${scoreClass(signal.score.weighted)}`;
  const scoreCard = document.getElementById("hero-score");
  if (scoreCard) {
    const w = signal.score.weighted;
    scoreCard.style.borderLeftColor = w > 0 ? "var(--green)" : w < 0 ? "var(--red)" : "var(--border)";
  }
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

// ── Tooltip engine ────────────────────────────────────────────
let tooltipEl = null;

function createTooltip() {
  const el = document.createElement("div");
  el.className = "tooltip-box";
  document.body.appendChild(el);
  return el;
}

function showTooltip(target, text) {
  if (!tooltipEl) tooltipEl = createTooltip();
  tooltipEl.textContent = text;
  tooltipEl.style.display = "block";
  positionTooltip(target);
}

function positionTooltip(target) {
  if (!tooltipEl) return;
  const rect = target.getBoundingClientRect();
  const tipW = tooltipEl.offsetWidth;
  const tipH = tooltipEl.offsetHeight;
  let left = rect.left + window.scrollX;
  let top  = rect.bottom + window.scrollY + 8;
  if (left + tipW > window.innerWidth - 12) left = window.innerWidth - tipW - 12;
  if (top + tipH > window.scrollY + window.innerHeight - 12) top = rect.top + window.scrollY - tipH - 8;
  tooltipEl.style.left = `${Math.max(8, left)}px`;
  tooltipEl.style.top  = `${top}px`;
}

function hideTooltip() {
  if (tooltipEl) tooltipEl.style.display = "none";
}

document.addEventListener("mouseover", (e) => {
  const el = e.target.closest("[data-tooltip]");
  if (el) showTooltip(el, el.dataset.tooltip);
});
document.addEventListener("mouseout", (e) => {
  if (!e.target.closest("[data-tooltip]")) return;
  hideTooltip();
});
document.addEventListener("scroll", () => {
  const hovered = document.querySelector("[data-tooltip]:hover");
  if (hovered) positionTooltip(hovered); else hideTooltip();
}, { passive: true });

// tap-to-show for touch devices
let _tapTarget = null;
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-tooltip]");
  if (el) {
    if (_tapTarget === el && tooltipEl && tooltipEl.style.display === "block") {
      hideTooltip();
      _tapTarget = null;
    } else {
      showTooltip(el, el.dataset.tooltip);
      _tapTarget = el;
    }
    e.stopPropagation();
  } else {
    hideTooltip();
    _tapTarget = null;
  }
});

// ── Fetch ─────────────────────────────────────────────────────
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
