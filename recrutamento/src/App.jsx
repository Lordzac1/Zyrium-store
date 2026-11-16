import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ChevronDown, Loader2, Send, Shield } from "lucide-react";

/* ============================================================
   CONFIGURAÇÃO
   ------------------------------------------------------------
   Opção A) Discord Webhook (embed roxo enviado direto):
     "https://discord.com/api/webhooks/ID/TOKEN"
   Opção B) Seu backend/bot Node.js (que posta no canal de
     formulários ${DISCORD_CHANNEL_ID}):
     "https://seu-dominio.com/api/recruitment"  (ou "/api/recruitment")
   ============================================================ */
const WEBHOOK_OR_BOT_API_URL = ""; // <-- COLOQUE AQUI
const DISCORD_CHANNEL_ID = "1570742963791859742";

const SERVER = {
  name: "ZYRIUM MC",
  version: "1.21.11",
  mode: "SEMI-ANARCHY",
  ip: "zyriummc.bed.net.br",
};

/* ============================================================
   PERGUNTAS — edite, adicione ou remova à vontade.
   type: "text" | "textarea" | "select"
   Campos: id (único), label, type, required, placeholder,
           hint (opcional), options (só para select), maxLength
   ============================================================ */
const QUESTIONS = [
  { id: "nick", label: "Qual é o seu nick no Minecraft?", type: "text", required: true, placeholder: "Ex: Steve_BR", maxLength: 32 },
  { id: "discord", label: "Qual é o seu usuário do Discord?", type: "text", required: true, placeholder: "Ex: usuario#0000 ou @usuario", hint: "Entraremos em contato por aqui.", maxLength: 40 },
  { id: "cargo", label: "Para qual cargo você está se candidatando?", type: "select", required: true, options: ["Ajudante", "Moderador", "Administrador", "Builder", "Suporte (Tickets)"] },
  { id: "experiencia", label: "Você já foi staff em outros servidores? Conte como foi.", type: "textarea", required: true, placeholder: "Servidores, cargos, tempo de atuação...", maxLength: 800 },
  { id: "motivo", label: "Por que devemos escolher você para a equipe do ZYRIUM MC?", type: "textarea", required: true, placeholder: "Fale sobre sua disponibilidade, maturidade e o que pode agregar.", maxLength: 1000 },
];

const fieldBase =
  "w-full rounded-lg bg-black/40 border border-purple-500/20 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 " +
  "outline-none transition focus:border-purple-400 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.18),0_0_22px_rgba(168,85,247,0.25)]";

/* ---------- Envio ---------- */
const isDiscordWebhook = (url) => /discord(app)?\.com\/api\/webhooks\//i.test(url);
const cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

function buildDiscordEmbed(answers) {
  const fields = QUESTIONS.map((q, i) => ({
    name: cut(`#${String(i + 1).padStart(2, "0")} ${q.label}`, 256),
    value: cut(answers[q.id]?.trim() || "—", 1024),
    inline: false,
  })).slice(0, 25);
  return {
    username: "ZYRIUM MC • Recrutamento",
    embeds: [
      {
        title: "📋 Nova candidatura Staff",
        description: `Servidor: **${SERVER.name}** • ${SERVER.version} • ${SERVER.mode}`,
        color: 0x9333ea,
        fields,
        footer: { text: `${SERVER.name} — Recrutamento Staff` },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

async function submitApplication(answers) {
  const url = WEBHOOK_OR_BOT_API_URL.trim();
  if (!url) throw new Error("O envio ainda não foi configurado. Defina WEBHOOK_OR_BOT_API_URL no topo de src/App.jsx.");

  const body = isDiscordWebhook(url)
    ? buildDiscordEmbed(answers)
    : {
        channelId: DISCORD_CHANNEL_ID,
        server: SERVER.name,
        submittedAt: new Date().toISOString(),
        answers: QUESTIONS.map((q, i) => ({ number: i + 1, id: q.id, question: q.label, answer: answers[q.id]?.trim() || "" })),
      };

  let res;
  try {
    res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Verifique a URL e o CORS do seu backend.");
  }
  if (!res.ok) throw new Error(`O envio falhou (erro ${res.status}). Tente novamente em instantes.`);
}

/* ---------- Componentes ---------- */
function Field({ q, index, value, error, onChange }) {
  const id = `q-${q.id}`;
  return (
    <motion.section
      id={`block-${q.id}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.08 * index, ease: "easeOut" }}
      className={`rounded-xl bg-zy-card border p-5 sm:p-6 transition hover:shadow-[0_0_30px_rgba(147,51,234,0.12)] ${
        error ? "border-red-500/60" : "border-purple-500/20 hover:border-purple-500/40"
      }`}
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="font-display font-bold text-lg leading-6 bg-gradient-to-br from-purple-400 to-red-500 bg-clip-text text-transparent">
          #{String(index + 1).padStart(2, "0")}
        </span>
        <label htmlFor={id} className="font-display font-semibold text-zinc-100 leading-6">
          {q.label} {q.required && <span className="text-red-500" aria-label="obrigatória">*</span>}
        </label>
      </div>

      {q.type === "textarea" ? (
        <textarea id={id} rows={4} value={value} maxLength={q.maxLength} placeholder={q.placeholder}
          onChange={(e) => onChange(q.id, e.target.value)} className={`${fieldBase} resize-y`} />
      ) : q.type === "select" ? (
        <div className="relative">
          <select id={id} value={value} onChange={(e) => onChange(q.id, e.target.value)}
            className={`${fieldBase} appearance-none pr-10 ${value ? "" : "text-zinc-500"}`}>
            <option value="" className="bg-zy-card">Selecione uma opção</option>
            {q.options.map((o) => (<option key={o} value={o} className="bg-zy-card text-zinc-100">{o}</option>))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
        </div>
      ) : (
        <input id={id} type="text" value={value} maxLength={q.maxLength} placeholder={q.placeholder}
          onChange={(e) => onChange(q.id, e.target.value)} className={fieldBase} />
      )}

      <div className="mt-2 flex items-center justify-between gap-3 text-xs">
        <span className={error ? "text-red-400" : "text-zinc-500"}>{error || q.hint || ""}</span>
        {q.type !== "select" && q.maxLength && <span className="text-zinc-600 tabular-nums">{value.length}/{q.maxLength}</span>}
      </div>
    </motion.section>
  );
}

function Success() {
  const particles = useMemo(
    () => Array.from({ length: 26 }, (_, i) => ({
      id: i, x: (Math.random() - 0.5) * 520, y: -60 - Math.random() * 300,
      size: 4 + Math.random() * 7, delay: Math.random() * 0.5, red: i % 3 === 0,
    })), []);
  return (
    <motion.div initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 140, damping: 16 }}
      className="relative overflow-hidden rounded-2xl bg-zy-card border border-purple-500/30 p-8 sm:p-12 text-center shadow-[0_0_60px_rgba(147,51,234,0.25)]">
      <div className="pointer-events-none absolute left-1/2 top-24" aria-hidden>
        {particles.map((p) => (
          <motion.span key={p.id} className="absolute rounded-full"
            style={{ width: p.size, height: p.size, background: p.red ? "#EF4444" : "#A855F7", boxShadow: `0 0 12px ${p.red ? "#EF4444" : "#A855F7"}` }}
            initial={{ x: 0, y: 0, opacity: 0 }} animate={{ x: p.x, y: p.y, opacity: [0, 1, 0] }}
            transition={{ duration: 1.8, delay: p.delay, ease: "easeOut" }} />
        ))}
      </div>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2, stiffness: 200, damping: 12 }}
        className="relative mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-purple-600 to-red-600 shadow-[0_0_40px_rgba(168,85,247,0.6)]">
        <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.5 }} />
        </svg>
        <motion.span className="absolute inset-0 rounded-full border-2 border-purple-400"
          initial={{ scale: 1, opacity: 0.7 }} animate={{ scale: 1.8, opacity: 0 }} transition={{ duration: 1.6, repeat: Infinity }} />
      </motion.div>
      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="font-display text-2xl sm:text-3xl font-bold text-white">Candidatura enviada com sucesso!</motion.h2>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
        className="mx-auto mt-3 max-w-md text-zinc-400">
        Suas respostas foram encaminhadas diretamente para a equipe no Discord do ZYRIUM MC.
      </motion.p>
    </motion.div>
  );
}

export default function App() {
  const [answers, setAnswers] = useState(() => Object.fromEntries(QUESTIONS.map((q) => [q.id, ""])));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success
  const [submitError, setSubmitError] = useState("");
  const topRef = useRef(null);

  const answered = QUESTIONS.filter((q) => answers[q.id].trim() !== "").length;
  const progress = Math.round((answered / QUESTIONS.length) * 100);

  const onChange = (id, v) => {
    setAnswers((a) => ({ ...a, [id]: v }));
    if (errors[id]) setErrors((e) => ({ ...e, [id]: undefined }));
  };

  const validate = () => {
    const e = {};
    QUESTIONS.forEach((q) => { if (q.required && !answers[q.id].trim()) e[q.id] = "Esta pergunta é obrigatória."; });
    setErrors(e);
    const first = QUESTIONS.find((q) => e[q.id]);
    if (first) document.getElementById(`block-${first.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    return !first;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    setStatus("sending");
    try {
      await submitApplication(answers);
      setStatus("success");
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      setSubmitError(err.message);
      setStatus("idle");
    }
  };

  return (
    <div ref={topRef} className="min-h-screen">
      {/* Barra de progresso */}
      <div className="fixed inset-x-0 top-0 z-50 h-1.5 bg-white/5" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <motion.div className="h-full bg-gradient-to-r from-purple-600 via-purple-400 to-red-500 shadow-[0_0_14px_rgba(168,85,247,0.9)]"
          animate={{ width: `${status === "success" ? 100 : progress}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
      </div>

      <main className="mx-auto max-w-2xl px-4 pb-20 pt-12 sm:pt-16">
        <header className="mb-10 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-purple-600 to-red-600 shadow-[0_0_30px_rgba(147,51,234,0.5)]">
            <Shield className="h-7 w-7 text-white" />
          </motion.div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            ZYRIUM MC <span className="text-zinc-500">—</span> RECRUTAMENTO STAFF
          </h1>
          <span className="mt-4 inline-block rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1 font-display text-xs font-semibold tracking-widest text-purple-300">
            VERSÃO {SERVER.version} • {SERVER.mode}
          </span>
          <p className="mt-3 text-sm text-zinc-500">IP: <span className="text-zinc-300">{SERVER.ip}</span></p>
          {status !== "success" && (
            <p className="mt-6 text-sm text-zinc-400">
              <span className="font-display font-semibold text-purple-300">{answered}/{QUESTIONS.length}</span> perguntas respondidas
            </p>
          )}
        </header>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            <Success key="ok" />
          ) : (
            <motion.form key="form" onSubmit={onSubmit} noValidate exit={{ opacity: 0, y: -20, scale: 0.97 }} transition={{ duration: 0.35 }} className="space-y-4">
              {QUESTIONS.map((q, i) => (<Field key={q.id} q={q} index={i} value={answers[q.id]} error={errors[q.id]} onChange={onChange} />))}

              <AnimatePresence>
                {submitError && (
                  <motion.div role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden rounded-xl border border-red-500/50 bg-red-500/10">
                    <div className="flex items-start gap-3 p-4 text-sm text-red-300">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                      <p>{submitError}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button type="submit" disabled={status === "sending"} whileHover={{ scale: status === "sending" ? 1 : 1.03 }} whileTap={{ scale: 0.98 }}
                className="mt-2 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 via-red-600 to-purple-600 bg-[length:200%_100%] animate-pulseGrad px-6 py-4 font-display text-base font-bold tracking-wider text-white shadow-[0_0_24px_rgba(147,51,234,0.45)] transition-shadow hover:shadow-[0_0_44px_rgba(220,38,38,0.65)] disabled:cursor-wait disabled:opacity-80">
                {status === "sending" ? (<><Loader2 className="h-5 w-5 animate-spin" /> ENVIANDO PARA O DISCORD...</>) : (<><Send className="h-5 w-5" /> ENVIAR CANDIDATURA</>)}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
