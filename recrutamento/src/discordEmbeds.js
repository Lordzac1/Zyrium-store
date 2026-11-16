// Monta as mensagens (embeds roxos) e envia — usado pelo site (webhook) e pelo servidor (bot).
const PURPLE = 0x9333ea, RED = 0xdc2626;
const cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
const num = (id) => String(id).padStart(2, "0");

export function buildMessages({ answers, questions, analysis, roleId }) {
  const nick = answers[3]?.trim() || "—", disc = answers[5]?.trim() || "—";
  const emoji = { alto: "🔴", médio: "🟠", baixo: "🟢" }[analysis.level];
  const msgs = [{
    embeds: [{
      title: "📋 Nova candidatura Staff",
      description: `**Nick:** ${nick}\n**Discord:** ${disc}\n**Cargo desejado:** ${answers[16] || "—"}`,
      color: PURPLE,
      fields: [{
        name: "Estimativa de IA",
        value: `${emoji} **${analysis.level.toUpperCase()}** (${analysis.score}/100) • abas trocadas: ${analysis.blurs} • tempo: ${analysis.minutes} min\n*Heurística automática — revise manualmente.*`,
      }],
      timestamp: new Date().toISOString(),
    }],
  }];

  if (analysis.alert) {
    msgs.push({
      content: `${roleId ? `<@&${roleId}> ` : ""}🚨 **Possível uso de IA** na candidatura de **${nick}**`,
      embeds: [{
        color: RED,
        title: `Alerta de IA — ${analysis.score}/100`,
        description: analysis.flagged.slice(0, 10).map((f) => `**#${num(f.id)}** (${f.score}) — ${f.reasons.join(", ")}`).join("\n") || "Comportamento suspeito (abas trocadas / tempo).",
      }],
      allowed_mentions: { roles: roleId ? [roleId] : [] },
    });
  }

  const flagged = new Set(analysis.flagged.map((f) => f.id));
  let fields = [], size = 0, part = 1;
  const flush = () => {
    if (fields.length) msgs.push({ embeds: [{ title: `Respostas — parte ${part++}`, color: PURPLE, fields }] });
    fields = []; size = 0;
  };
  for (const q of questions) {
    const f = {
      name: cut(`${flagged.has(q.id) ? "⚠️ " : ""}#${num(q.id)} ${q.label}`, 256),
      value: cut((answers[q.id] || "").trim() || "—", 1024),
    };
    const n = f.name.length + f.value.length;
    if (fields.length >= 25 || size + n > 5000) flush();
    fields.push(f); size += n;
  }
  flush();

  msgs.forEach((m) => { m.allowed_mentions ||= { parse: [] }; });
  return msgs;
}

export async function postAll(msgs, url, headers = {}) {
  for (const m of msgs) {
    for (let tries = 0; ; tries++) {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(m) });
      if (res.status === 429 && tries < 3) {
        const j = await res.json().catch(() => ({}));
        await new Promise((r) => setTimeout(r, (j.retry_after || 1) * 1000 + 100));
        continue;
      }
      if (!res.ok) throw new Error(`O Discord recusou o envio (erro ${res.status}).`);
      break;
    }
  }
}
