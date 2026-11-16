# ZYRIUM MC — Recrutamento Staff

    npm install
    npm run dev

- Perguntas: array `QUESTIONS` no topo de `src/App.jsx`.
- Envio: `WEBHOOK_OR_BOT_API_URL` no topo de `src/App.jsx`.
  - Webhook do Discord → envia embed roxo (#9333EA).
  - Rota do seu bot (`POST /api/recruitment`) → recebe JSON `{ channelId, server, submittedAt, answers: [{number,id,question,answer}] }`.
    O bot deve postar no canal `1570742963791859742` e liberar CORS para o domínio do site.
