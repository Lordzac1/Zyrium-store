import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ChevronDown, ChevronLeft, ChevronRight, Loader2, Send, Shield } from "lucide-react";
import { QUESTIONS } from "./questions.js";
import { analyze } from "./aiDetector.js";
import { buildMessages, postAll } from "./discordEmbeds.js";

/* ============================================================
   CONFIGURAÇÃO
   A) Webhook do Discord: "https://discord.com/api/webhooks/ID/TOKEN"
      (embeds roxos + alerta de IA direto no canal do webhook)
   B) Seu servidor/bot (recomendado): "https://SEU-SERVIDOR/api/recruitment"
      (o servidor em /server posta no canal RECRUITMENT_CHANNEL_ID)
   ============================================================ */
const WEBHOOK_OR_BOT_API_URL = import.meta.env.VITE_API_URL || "";
const STAFF_ROLE_ID = "1570743525593714738"; // cargo marcado no alerta de IA (modo webhook). "" para não marcar

const SERVER = { name: "ZYRIUM MC", version: "1.21.11", mode: "SEMI-ANARCHY", ip: "zyriummc.bed.net.br" };
const STEPS = [...new Set(QUESTIONS.map((q) => q.category))];

const fieldBase =
  "w-full rounded-lg bg-black/40 border border-purple-500/20 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 " +
  "outline-none transition focus:border-purple-400 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.18),0_0_22px_rgba(168,85,247,0.25)]";

function Field({ q, index, value, error, onChange, onPaste, onKey }) {
  const id = `q-${q.id}`;
  const typed = {
    id, value, maxLength: q.maxLength, placeholder: q.placeholder,
    onChange: (e) => onChange(q.id, e.target.value),
    onPaste: (e) => onPaste(q.id, e),
    onKeyDown: () => onKey(q.id),
  };
  return (
    <motion.section id={`block-${q.id}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 * index }}
      className={`rounded-xl bg-zy-card border p-5 sm:p-6 transition hover:shadow-[0_0_30px_rgba(147,51,234,0.12)] ${error ? "border-red-500/60" : "border-purple-500/20 hover:border-purple-500/40"}`}>
      <div className="mb-3 flex items-start gap-3">
        <span className="font-display text-lg font-bold leading-6 bg-gradient-to-br from-purple-400 to-red-500 bg-clip-text text-transparent">#{String(q.id).padStart(2, "0")}</span>
        <label htmlFor={id} className="font-display font-semibold leading-6 text-zinc-100">
          {q.label} {q.required && <span className="text-red-500" aria-label="obrigatória">*</span>}
        </label>
      </div>
      {q.type === "textarea" ? (
        <textarea rows={4} {...typed} className={`${fieldBase} resize-y`} />
      ) : q.type === "select" ? (
        <div className="relative">
          <select id={id} value={value} onChange={(e) => onChange(q.id, e.target.value)} className={`${fieldBase} appearance-none pr-10 ${value ? "" : "text-zinc-500"}`}>
            <option value="" className="bg-zy-card">Selecione uma opção</option>
            {q.options.map((o) => (<option key={o} value={o} className="bg-zy-card text-zinc-100">{o}</option>))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400" />
        </div>
      ) : (
        <input type="text" {...typed} className={fieldBase} />
      )}
      <div className="mt-2 flex items-center justify-between gap-3 text-xs">
        <span className={error ? "text-red-400" : "text-zinc-500"}>{error || ""}</span>
        {q.type !== "select" && <span className="tabular-nums text-zinc-600">{value.length}/{q.maxLength}</span>}
      </div>
    </motion.section>
  );
}

function Success() {
  const particles = useMemo(() => Array.from({ length: 26 }, (_, i) => ({
    id: i, x: (Math.random() - 0.5) * 520, y: -60 - Math.random() * 300, size: 4 + Math.random() * 7, delay: Math.random() * 0.5, red: i % 3 === 0,
  })), []);
  return (
    <motion.div initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 140, damping: 16 }}
      className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-zy-card p-8 text-center shadow-[0_0_60px_rgba(147,51,234,0.25)] sm:p-12">
      <div className="pointer-events-none absolute left-1/2 top-24" aria-hidden>
        {particles.map((p) => (
          <motion.span key={p.id} className="absolute rounded-full" style={{ width: p.size, height: p.size, background: p.red ? "#EF4444" : "#A855F7", boxShadow: `0 0 12px ${p.red ? "#EF4444" : "#A855F7"}` }}
            initial={{ x: 0, y: 0, opacity: 0 }} animate={{ x: p.x, y: p.y, opacity: [0, 1, 0] }} transition={{ duration: 1.8, delay: p.delay, ease: "easeOut" }} />
        ))}
      </div>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2, stiffness: 200, damping: 12 }}
        className="relative mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-purple-600 to-red-600 shadow-[0_0_40px_rgba(168,85,247,0.6)]">
        <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.5 }} />
        </svg>
        <motion.span className="absolute inset-0 rounded-full border-2 border-purple-400" initial={{ scale: 1, opacity: 0.7 }} animate={{ scale: 1.8, opacity: 0 }} transition={{ duration: 1.6, repeat: Infinity }} />
      </motion.div>
      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="font-display text-2xl font-bold text-white sm:text-3xl">Candidatura enviada com sucesso!</motion.h2>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }} className="mx-auto mt-3 max-w-md text-zinc-400">
        Suas respostas foram encaminhadas diretamente para a equipe no Discord do ZYRIUM MC.
      </motion.p>
    </motion.div>
  );
}

export default function App() {
  const [answers, setAnswers] = useState(() => Object.fromEntries(QUESTIONS.map((q) => [q.id, ""])));
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | sending | success
  const [submitError, setSubmitError] = useState("");
  const track = useRef({});
  const blurs = useRef(0);
  const startedAt = useRef(Date.now());
  const topRef = useRef(null);

  // Detecção de IA — comportamento: trocas de aba, texto colado e nº de teclas digitadas
  useEffect(() => {
    const onVis = () => { if (document.hidden) blurs.current++; };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
  const t = (id) => (track.current[id] ||= { paste: 0, keys: 0 });
  const onPaste = (id, e) => { t(id).paste += (e.clipboardData?.getData("text") || "").length; };
  const onKey = (id) => { t(id).keys++; };

  const stepQuestions = QUESTIONS.filter((q) => q.category === STEPS[step]);
  const last = step === STEPS.length - 1;
  const answered = QUESTIONS.filter((q) => answers[q.id].trim() !== "").length;
  const progress = Math.round((answered / QUESTIONS.length) * 100);

  const onChange = (id, v) => {
    if (v === "") track.current[id] = { paste: 0, keys: 0 };
    setAnswers((a) => ({ ...a, [id]: v }));
    if (errors[id]) setErrors((e) => ({ ...e, [id]: undefined }));
  };

  const validateStep = () => {
    const e = {};
    stepQuestions.forEach((q) => { if (q.required && !answers[q.id].trim()) e[q.id] = "Esta pergunta é obrigatória."; });
    setErrors(e);
    const first = stepQuestions.find((q) => e[q.id]);
    if (first) document.getElementById(`block-${first.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    return !first;
  };

  const go = (n) => { setStep(n); topRef.current?.scrollIntoView({ behavior: "smooth" }); };

  const send = async () => {
    const url = WEBHOOK_OR_BOT_API_URL.trim();
    if (!url) throw new Error("O envio ainda não foi configurado. Defina WEBHOOK_OR_BOT_API_URL no topo de src/App.jsx.");
    const metrics = { blurs: blurs.current, totalMs: Date.now() - startedAt.current, perQuestion: track.current };
    if (/discord(app)?\.com\/api\/webhooks\//i.test(url)) {
      const analysis = analyze(answers, QUESTIONS, metrics);
      const msgs = buildMessages({ answers, questions: QUESTIONS, analysis, roleId: STAFF_ROLE_ID })
        .map((m) => ({ username: "ZYRIUM MC • Recrutamento", ...m }));
      await postAll(msgs, url);
    } else {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers, metrics }) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `O envio falhou (erro ${res.status}).`);
    }
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setSubmitError("");
    if (!validateStep()) return;
    if (!last) return go(step + 1);
    setStatus("sending");
    try {
      await send();
      setStatus("success");
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      setSubmitError(err instanceof TypeError ? "Não foi possível conectar. Verifique a URL configurada e o CORS do servidor." : err.message);
      setStatus("idle");
    }
  };

  return (
    <div ref={topRef} className="min-h-screen">
      <div className="fixed inset-x-0 top-0 z-50 h-1.5 bg-white/5" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <motion.div className="h-full bg-gradient-to-r from-purple-600 via-purple-400 to-red-500 shadow-[0_0_14px_rgba(168,85,247,0.9)]"
          animate={{ width: `${status === "success" ? 100 : progress}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
      </div>

      <main className="mx-auto max-w-2xl px-4 pb-20 pt-12 sm:pt-16">
        <header className="mb-8 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-purple-600 to-red-600 shadow-[0_0_30px_rgba(147,51,234,0.5)]">
            <Shield className="h-7 w-7 text-white" />
          </motion.div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">ZYRIUM MC <span className="text-zinc-500">—</span> RECRUTAMENTO STAFF</h1>
          <span className="mt-4 inline-block rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1 font-display text-xs font-semibold tracking-widest text-purple-300">
            VERSÃO {SERVER.version} • {SERVER.mode}
          </span>
          <p className="mt-3 text-sm text-zinc-500">IP: <span className="text-zinc-300">{SERVER.ip}</span></p>
          {status !== "success" && (
            <>
              <p className="mt-6 text-sm text-zinc-400"><span className="font-display font-semibold text-purple-300">{answered}/{QUESTIONS.length}</span> perguntas respondidas</p>
              <div className="mt-4 flex justify-center gap-1.5" aria-hidden>
                {STEPS.map((s, i) => (<span key={s} className={`h-1.5 w-8 rounded-full transition ${i === step ? "bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]" : i < step ? "bg-purple-700" : "bg-white/10"}`} />))}
              </div>
              <h2 className="mt-4 font-display text-lg font-semibold text-zinc-200">Etapa {step + 1} de {STEPS.length}: {STEPS[step]}</h2>
            </>
          )}
        </header>

        {status === "success" ? (
          <Success />
        ) : (
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }} className="space-y-4">
                {stepQuestions.map((q, i) => (<Field key={q.id} q={q} index={i} value={answers[q.id]} error={errors[q.id]} onChange={onChange} onPaste={onPaste} onKey={onKey} />))}
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              {submitError && (
                <motion.div role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden rounded-xl border border-red-500/50 bg-red-500/10">
                  <div className="flex items-start gap-3 p-4 text-sm text-red-300"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" /><p>{submitError}</p></div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-2 flex gap-3">
              {step > 0 && (
                <button type="button" onClick={() => go(step - 1)} disabled={status === "sending"}
                  className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-zy-card px-5 py-4 font-display font-semibold text-zinc-300 transition hover:border-purple-400 hover:text-white">
                  <ChevronLeft className="h-5 w-5" /> VOLTAR
                </button>
              )}
              <motion.button type="submit" disabled={status === "sending"} whileHover={{ scale: status === "sending" ? 1 : 1.03 }} whileTap={{ scale: 0.98 }}
                className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 via-red-600 to-purple-600 bg-[length:200%_100%] animate-pulseGrad px-6 py-4 font-display text-base font-bold tracking-wider text-white shadow-[0_0_24px_rgba(147,51,234,0.45)] transition-shadow hover:shadow-[0_0_44px_rgba(220,38,38,0.65)] disabled:cursor-wait disabled:opacity-80">
                {status === "sending" ? (<><Loader2 className="h-5 w-5 animate-spin" /> ENVIANDO PARA O DISCORD...</>)
                  : last ? (<><Send className="h-5 w-5" /> ENVIAR CANDIDATURA</>)
                  : (<>PRÓXIMO <ChevronRight className="h-5 w-5" /></>)}
              </motion.button>
            </div>
            <p className="pt-2 text-center text-xs text-zinc-600">Responda com suas próprias palavras. A equipe analisa as respostas e usa uma checagem automática de uso de IA.</p>
          </form>
        )}
      </main>
    </div>
  );
}
