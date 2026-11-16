// Detector de IA (heurístico). É uma ESTIMATIVA: pode errar. A decisão final é sempre manual.
const STRONG = ["como uma inteligência artificial", "como um modelo de linguagem", "como ia,", "espero que isso ajude", "claro! aqui"];
const PHRASES = [
  "é importante ressaltar", "vale ressaltar", "vale destacar", "é fundamental", "é essencial", "em suma",
  "em resumo", "em conclusão", "nesse sentido", "dessa forma", "desta forma", "garantindo que", "visando",
  "ambiente saudável", "ambiente justo", "de forma imparcial", "de maneira imparcial", "a fim de garantir",
  "postura profissional", "primeiramente", "em primeiro lugar", "por fim,", "além disso,", "portanto,",
];

export function scoreText(t) {
  if (t.length < 80) return { score: 0, reasons: [] };
  const s = t.toLowerCase(), reasons = [];
  let score = 0;
  if (STRONG.some((p) => s.includes(p))) { score += 70; reasons.push("frase típica de chatbot"); }
  const hits = PHRASES.filter((p) => s.includes(p)).length;
  if (hits >= 2) { score += Math.min(40, hits * 12); reasons.push(`${hits} expressões típicas de IA`); }
  if (/\*\*|^#{1,3}\s|^\s*[-*•]\s|^\s*\d+[.)]\s/m.test(t)) { score += 25; reasons.push("formatação de lista/markdown"); }
  if (/[—–]/.test(t)) { score += 12; reasons.push("travessão longo"); }
  const lens = t.split(/[.!?]+\s/).filter((x) => x.trim().length > 3).map((x) => x.split(/\s+/).length);
  if (lens.length >= 4) {
    const avg = lens.reduce((a, b) => a + b) / lens.length;
    const sd = Math.sqrt(lens.reduce((a, b) => a + (b - avg) ** 2, 0) / lens.length);
    if (avg >= 14 && sd / avg < 0.3) { score += 15; reasons.push("frases muito uniformes"); }
  }
  return { score: Math.min(100, score), reasons };
}

// metrics: { blurs, totalMs, perQuestion: { [id]: { paste, keys } } }
export function analyze(answers, questions, metrics = {}) {
  const per = metrics.perQuestion || {};
  const items = [];
  for (const q of questions) {
    const t = String(answers[q.id] || "").trim();
    if (q.type === "select" || t.length < 80) continue;
    let { score, reasons } = scoreText(t);
    const paste = Math.min(Number(per[q.id]?.paste) || 0, t.length);
    const keys = per[q.id]?.keys === undefined ? t.length : Number(per[q.id].keys) || 0;
    if (paste / t.length >= 0.6) { score += 45; reasons.push(`texto colado (${Math.round((paste / t.length) * 100)}%)`); }
    else if (keys < t.length * 0.3) { score += 30; reasons.push("poucas teclas para o tamanho do texto"); }
    items.push({ id: q.id, score: Math.min(100, score), reasons });
  }
  const max = Math.max(0, ...items.map((i) => i.score));
  const avg = items.length ? items.reduce((a, i) => a + i.score, 0) / items.length : 0;
  const blurs = Number(metrics.blurs) || 0;
  const score = Math.min(100, Math.round((max + avg) / 2 + Math.min(15, blurs * 3)));
  const flagged = items.filter((i) => i.score >= 50);
  const level = score >= 60 || flagged.length >= 3 ? "alto" : score >= 35 || flagged.length >= 1 ? "médio" : "baixo";
  return { score, level, flagged, blurs, minutes: Math.round((Number(metrics.totalMs) || 0) / 60000), alert: level === "alto" };
}
