import React, { useState } from 'react';
import { Copy, Check, Shield, ShoppingBag, Users } from 'lucide-react';

export function App() {
  const [copied, setCopied] = useState(false);
  const serverIp = 'zyriummc.bed.net.br';

  const copyIp = () => {
    navigator.clipboard.writeText(serverIp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050B16] text-white font-sans">
      <header className="border-b border-white/10 bg-[#0B1628]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-[#2878FF] via-[#00D2FF] to-[#8B35F5] bg-clip-text text-transparent">
            ZYRIUM MC
          </span>
          <button
            onClick={copyIp}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2878FF]/20 border border-[#2878FF] text-[#00D2FF] hover:bg-[#2878FF]/30 transition"
          >
            <span className="font-mono text-sm">{serverIp}</span>
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-20 text-center">
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#8B35F5]/20 text-[#8B35F5] border border-[#8B35F5]/40">
          SEMI-ANARCHY • VERSÃO 1.21.11
        </span>
        <h1 className="mt-6 text-5xl font-black tracking-tight">
          Domine o Caos no <span className="text-[#2878FF]">ZYRIUM MC</span>
        </h1>
        <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
          Explore, construa, lute sem limites e conquiste seu espaço. Loja oficial, recrutamento de equipe e suporte integrado diretamente ao Discord.
        </p>

        <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-xl bg-[#0B1628] border border-white/10">
            <ShoppingBag className="text-[#00D2FF] mb-4" size={28} />
            <h3 className="text-lg font-bold">Loja Oficial</h3>
            <p className="text-sm text-gray-400 mt-2">
              Adquira VIPs progressivos até o VIP ZYRIUM com checkout rápido via PIX e ativação por ticket.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-[#0B1628] border border-white/10">
            <Users className="text-[#8B35F5] mb-4" size={28} />
            <h3 className="text-lg font-bold">Recrutamento Staff</h3>
            <p className="text-sm text-gray-400 mt-2">
              Candidate-se para integrar nossa equipe de moderação e ajude a manter a ordem no servidor.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-[#0B1628] border border-white/10">
            <Shield className="text-[#2878FF] mb-4" size={28} />
            <h3 className="text-lg font-bold">Central de Tickets</h3>
            <p className="text-sm text-gray-400 mt-2">
              Atendimento sincronizado em tempo real com threads privadas no nosso Discord oficial.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
