import express from "express";
import cors from "cors";
import { QUESTIONS } from "../src/questions.js";
import { analyze } from "../src/aiDetector.js";
import { buildMessages, postAll } from "../src/discordEmbeds.js";

const { DISCORD_BOT_TOKEN, RECRUITMENT_CHANNEL_ID = "1570742963791859742", STAFF_ROLE_ID = "", ALLOWED_ORIGIN = "*", PORT = 3001 } = process.env;
if (!DISCORD_BOT_TOKEN) { console.error("Defina DISCORD_BOT_TOKEN nas variáveis de ambiente."); process.exit(1); }

const app = express();
app.set("trust proxy", 1);
app.use(cors({ origin: ALLOWED_ORIGIN === "*" ? true : ALLOWED_ORIGIN.split(",") }));
app.use(express.json({ limit: "200kb" }));

const last = new Map(); // anti-spam: 1 envio por minuto por IP

app.post("/api/recruitment", async (req, res) => {
  const ip = req.ip, now = Date.now();
  if (now - (last.get(ip) || 0) < 60_000) return res.status(429).json({ error: "Aguarde 1 minuto para enviar novamente." });
  const { answers, metrics } = req.body || {};
  if (!answers || typeof answers !== "object") return res.status(400).json({ error: "Dados inválidos." });

  const clean = {};
  for (const q of QUESTIONS) {
    const v = String(answers[q.id] ?? "").trim().slice(0, 1000);
    if (q.required && !v) return res.status(400).json({ error: `A pergunta #${q.id} é obrigatória.` });
    clean[q.id] = v;
  }
  try {
    const analysis = analyze(clean, QUESTIONS, metrics || {}); // texto reavaliado no servidor
    const msgs = buildMessages({ answers: clean, questions: QUESTIONS, analysis, roleId: STAFF_ROLE_ID });
    await postAll(msgs, `https://discord.com/api/v10/channels/${RECRUITMENT_CHANNEL_ID}/messages`, { Authorization: `Bot ${DISCORD_BOT_TOKEN}` });
    last.set(ip, now);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(502).json({ error: "Falha ao enviar para o Discord." });
  }
});
app.get("/health", (_, res) => res.send("ok"));
app.listen(PORT, () => console.log(`API de recrutamento na porta ${PORT}`));
