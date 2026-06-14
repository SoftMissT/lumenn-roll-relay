import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Politica de Privacidade | Lumenn Relay",
  description: "Politica de Privacidade do Lumenn Relay.",
}

const dataRows = [
  ["ID de usuario do Discord", "Identificar o jogador no placar", "Discord"],
  ["Nome de usuario / exibicao", "Exibir no placar", "Discord / Foundry"],
  ["ID do servidor e canal do Discord", "Direcionar mensagens ao canal certo", "Discord"],
  ["ID de usuario do Foundry", "Vincular rolagem ao jogador", "Foundry VTT"],
  ["Nome do mundo Foundry", "Separar placares por mundo", "Foundry VTT"],
  ["Dados da rolagem", "Calcular e exibir o placar", "Foundry VTT"],
]

const usageItems = [
  "Retransmitir rolagens ao canal do Discord configurado.",
  "Calcular e exibir placares por mundo e jogador.",
  "Controlar o acesso autorizado durante Alfa/Beta.",
]

const providers = [
  "Discord — entrega de mensagens e autenticacao.",
  "Supabase — banco de dados.",
  "Vercel / Deno Deploy / Railway — hospedagem dos componentes.",
]

const sections = [
  {
    title: "3. Base legal (LGPD)",
    body: [
      "Tratamos os dados com base no legitimo interesse de operar o Servico solicitado e no consentimento dado ao adicionar o Bot e configurar o modulo. Voce pode revogar o consentimento removendo o Bot e solicitando exclusao dos dados.",
    ],
  },
  {
    title: "4. Armazenamento e seguranca",
    body: [
      "Os dados ficam em banco PostgreSQL (Supabase) com Row Level Security (RLS) ativado.",
      "Credenciais e segredos nao sao expostos a clientes; o acesso e autenticado.",
      "Aplicamos rate limiting e validacao de entrada para mitigar abuso.",
    ],
  },
  {
    title: "5. Retencao",
    body: [
      "Os dados de rolagem sao mantidos enquanto o placar do mundo estiver ativo. Ao resetar o placar ou remover o Bot, os dados associados podem ser excluidos. Voce pode solicitar exclusao a qualquer momento.",
    ],
  },
  {
    title: "7. Seus direitos (LGPD)",
    body: [
      "Voce tem direito a acessar, corrigir, solicitar a exclusao dos seus dados e revogar consentimento. Para exercer, entre em contato pelo repositorio oficial ou servidor de suporte. Atenderemos no prazo legal.",
    ],
  },
  {
    title: "8. Menores",
    body: [
      "O Servico segue a idade minima exigida pelo Discord na sua regiao. Nao coletamos intencionalmente dados de menores abaixo dessa idade.",
    ],
  },
  {
    title: "9. Alteracoes",
    body: [
      'Esta politica pode ser atualizada. A data de "ultima atualizacao" reflete a versao vigente.',
    ],
  },
  {
    title: "10. Contato",
    body: [
      "Encarregado de dados / contato: atraves do repositorio oficial ou do servidor de suporte do Discord.",
    ],
    link: { href: "https://github.com/SoftMissT/lumenn-roll-relay", label: "Repositorio oficial" },
  },
]

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] px-6 py-12 text-[#EEF2FF]">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="font-mono-hud text-[11px] uppercase tracking-[0.2em] text-[#00D4F5] transition-colors hover:text-[#7DD8EC]"
        >
          Voltar ao Hub
        </Link>

        <header className="mt-12 border-b border-[rgba(0,212,245,0.12)] pb-10">
          <p className="font-mono-hud text-[11px] uppercase tracking-[0.22em] text-[#4A6880]">
            Ultima atualizacao: 13 de junho de 2026
          </p>
          <h1 className="mt-4 font-display text-[52px] leading-none text-white md:text-[72px]">
            Politica de Privacidade
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-7 text-[#8BA8C4]">
            Como o Lumenn Relay processa dados para retransmitir rolagens e operar placares.
          </p>
        </header>

        <section className="mt-8 rounded-lg border border-[rgba(208,20,82,0.28)] bg-[rgba(208,20,82,0.06)] p-5">
          <h2 className="font-display text-2xl text-white">Aviso</h2>
          <p className="mt-2 text-[15px] leading-7 text-[#8BA8C4]">
            Modelo inicial, nao e aconselhamento juridico. Revise com um profissional
            antes da publicacao, principalmente quanto a LGPD.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-3xl text-white">1. Dados que coletamos</h2>
          <p className="mt-3 text-[16px] leading-7 text-[#8BA8C4]">
            Para operar os placares de criticos e falhas, o Lumenn Relay processa:
          </p>

          <div className="mt-5 overflow-hidden rounded-lg border border-[rgba(0,212,245,0.12)]">
            <div className="grid grid-cols-1 bg-[rgba(0,212,245,0.06)] font-mono-hud text-[11px] uppercase tracking-[0.14em] text-[#00D4F5] md:grid-cols-[1fr_1.2fr_0.8fr]">
              <div className="border-b border-[rgba(0,212,245,0.12)] p-4 md:border-b-0">Dado</div>
              <div className="border-b border-[rgba(0,212,245,0.12)] p-4 md:border-b-0">Finalidade</div>
              <div className="p-4">Origem</div>
            </div>
            {dataRows.map(([data, purpose, source]) => (
              <div
                key={data}
                className="grid grid-cols-1 border-t border-[rgba(0,212,245,0.08)] text-[15px] text-[#8BA8C4] md:grid-cols-[1fr_1.2fr_0.8fr]"
              >
                <div className="p-4 text-[#EEF2FF]">{data}</div>
                <div className="p-4">{purpose}</div>
                <div className="p-4">{source}</div>
              </div>
            ))}
          </div>

          <p className="mt-5 text-[16px] leading-7 text-[#8BA8C4]">
            Nao coletamos e-mail, senha, dados de pagamento no escopo atual,
            conteudo de mensagens privadas, ou qualquer dado sensivel.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-3xl text-white">2. Como usamos</h2>
          <p className="mt-3 text-[16px] leading-7 text-[#8BA8C4]">
            Os dados sao usados exclusivamente para:
          </p>
          <BulletList items={usageItems} />
          <p className="mt-5 text-[16px] leading-7 text-[#8BA8C4]">
            Nao vendemos, alugamos ou compartilhamos seus dados com terceiros para fins de marketing.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-3xl text-white">6. Compartilhamento com provedores</h2>
          <p className="mt-3 text-[16px] leading-7 text-[#8BA8C4]">
            O Servico roda em infraestrutura de terceiros que processam dados em nosso nome:
          </p>
          <BulletList items={providers} />
          <p className="mt-5 text-[16px] leading-7 text-[#8BA8C4]">
            Cada provedor possui suas proprias politicas de privacidade.
          </p>
        </section>

        <section className="mt-10 space-y-10">
          {sections.map((section) => (
            <LegalSection key={section.title} {...section} />
          ))}
        </section>

        <footer className="mt-14 border-t border-[rgba(0,212,245,0.12)] pt-8 text-[14px] text-[#4A6880]">
          Lumenn Moovies Produtora — em conformidade com a LGPD (Lei 13.709/2018).
        </footer>
      </div>
    </main>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[16px] leading-7 text-[#8BA8C4]">
          <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D01452]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function LegalSection({
  title,
  body,
  link,
}: {
  title: string
  body: string[]
  link?: { href: string; label: string }
}) {
  return (
    <section>
      <h2 className="font-display text-3xl text-white">{title}</h2>
      <div className="mt-3 space-y-3">
        {body.map((paragraph) => (
          <p key={paragraph} className="text-[16px] leading-7 text-[#8BA8C4]">
            {paragraph}
          </p>
        ))}
      </div>
      {link ? (
        <Link
          href={link.href}
          className="mt-4 inline-flex font-mono-hud text-[12px] uppercase tracking-[0.16em] text-[#00D4F5] transition-colors hover:text-[#7DD8EC]"
        >
          {link.label}
        </Link>
      ) : null}
    </section>
  )
}
