import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Termos de Servico | Lumenn Relay",
  description: "Termos de Servico do Lumenn Relay — modulo nao oficial para Foundry VTT.",
}

const acceptableUseItems = [
  "Usar o Servico para fins ilegais ou que violem os Termos do Discord ou da Foundry VTT.",
  "Tentar burlar limites de uso, autenticacao, ou mecanismos de seguranca.",
  "Sobrecarregar a infraestrutura com flood de requisicoes ou abuso de rate limit.",
  "Falsificar dados de rolagens ou identidade.",
]

const sections = [
  {
    title: "1. Quem somos",
    body: [
      'O Lumenn Relay ("o Servico", "o Bot") e um aplicativo de Discord e modulo para Foundry Virtual Tabletop, mantido pela Lumenn Moovies Produtora. O Servico retransmite resultados de rolagens de dados do Foundry VTT para servidores do Discord e mantem placares de acertos e falhas criticas.',
      "O Lumenn Relay nao e afiliado, endossado ou verificado pela Foundry Gaming LLC nem pela Discord Inc.",
    ],
  },
  {
    title: "2. Aceitacao",
    body: [
      "Ao adicionar o Bot a um servidor, instalar o modulo, ou usar qualquer funcionalidade do Servico, voce concorda com estes Termos. Se nao concordar, nao use o Servico.",
    ],
  },
  {
    title: "3. Elegibilidade",
    body: [
      "Voce deve cumprir os Termos de Servico do Discord, incluindo a idade minima exigida na sua regiao. Durante as fases Alfa e Beta, o acesso e restrito a usuarios autorizados pelos administradores.",
    ],
  },
  {
    title: "5. Dados e privacidade",
    body: [
      "O tratamento de dados e descrito na nossa Politica de Privacidade. Em resumo, o Servico processa identificadores do Discord, nomes de exibicao, nomes de mundos e resultados de rolagens para operar os placares.",
    ],
    link: { href: "/privacy", label: "Ler Politica de Privacidade" },
  },
  {
    title: "6. Disponibilidade",
    body: [
      'O Servico e fornecido "como esta", sem garantia de disponibilidade continua ou ausencia de erros. Podemos modificar, suspender ou encerrar o Servico a qualquer momento, especialmente durante as fases Alfa e Beta.',
    ],
  },
  {
    title: "7. Conteudo e propriedade",
    body: [
      "Voce mantem a titularidade dos dados gerados nas suas sessoes. O codigo do Lumenn Relay e licenciado sob MIT. Funcionalidades premium podem exigir assinatura no futuro.",
    ],
  },
  {
    title: "8. Limitacao de responsabilidade",
    body: [
      "Na maxima extensao permitida por lei, a Lumenn Moovies Produtora nao se responsabiliza por danos indiretos, perda de dados, ou interrupcoes decorrentes do uso do Servico.",
    ],
  },
  {
    title: "9. Alteracoes",
    body: [
      'Podemos atualizar estes Termos. A data de "ultima atualizacao" indica a versao vigente. O uso continuo apos mudancas significa aceitacao.',
    ],
  },
  {
    title: "10. Contato",
    body: [
      "Duvidas: atraves do repositorio oficial ou pelo servidor de suporte do Discord.",
    ],
    link: { href: "https://github.com/SoftMissT/lumenn-roll-relay", label: "Repositorio oficial" },
  },
]

const foundrySections = [
  {
    title: "11. Conformidade com Foundry VTT",
    body: [
      "Este modulo segue as diretrizes de marca da Foundry Gaming LLC. O titulo 'Lumenn Roll Relay' nao utiliza o nome 'Foundry Virtual Tabletop' nem sugere afiliacao oficial. O nome completo e referenciado apenas em texto descritivo, conforme permitido pelas Brand Guidelines.",
      'O modulo e distribuido como "package" nos termos da Foundry VTT Limited License for Package Development. Ele e projetado para funcionar exclusivamente com uma copia licenciada do Foundry Virtual Tabletop e nao opera de forma independente.',
    ],
  },
  {
    title: "12. Politica de IA (Foundry VTT AI Content Policy)",
    body: [
      "O codigo do Lumenn Relay utiliza assistencia de IA generativa no processo de desenvolvimento. Em conformidade com a Foundry VTT AI Content Policy (18 de marco de 2026):",
      "• O autor (Nelson/softmisst) compreende, revisa e mantem cada parte do codigo gerado. Nao e 'vibe coding' sem compreensao.",
      "• Toda decisao de arquitetura passa por revisao humana antes da implementacao.",
      "• Especificacoes e documentacao sao versionadas para auditoria.",
      "• O modulo nao gera conteudo de IA em runtime para usuarios finais.",
      "• Este pacote seria categorizado como 'AI Tools' se submetido a listagem oficial, pois utiliza ferramentas de IA no desenvolvimento de codigo.",
    ],
  },
]

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] px-6 py-12 text-[#EEF2FF]">
      <div className="mx-auto max-w-3xl">
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
          <h1 className="mt-4 font-display text-[56px] leading-none text-white md:text-[76px]">
            Termos de Servico
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-7 text-[#8BA8C4]">
            Regras de uso do Lumenn Relay durante as fases Alfa e Beta.
          </p>
        </header>

        <section className="mt-8 rounded-lg border border-[rgba(208,20,82,0.28)] bg-[rgba(208,20,82,0.06)] p-5">
          <h2 className="font-display text-2xl text-white">Aviso</h2>
          <p className="mt-2 text-[15px] leading-7 text-[#8BA8C4]">
            Este documento e um modelo inicial. Nao e aconselhamento juridico.
            Recomenda-se revisao por um profissional antes da publicacao oficial,
            especialmente quanto a LGPD, Discord e Foundry Gaming LLC.
          </p>
        </section>

        <section className="mt-10 space-y-10">
          {sections.slice(0, 3).map((section) => (
            <LegalSection key={section.title} {...section} />
          ))}

          <section>
            <h2 className="font-display text-3xl text-white">4. Uso aceitavel</h2>
            <p className="mt-3 text-[16px] leading-7 text-[#8BA8C4]">
              Voce concorda em nao:
            </p>
            <ul className="mt-4 space-y-3">
              {acceptableUseItems.map((item) => (
                <li key={item} className="flex gap-3 text-[16px] leading-7 text-[#8BA8C4]">
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D01452]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {sections.slice(3).map((section) => (
            <LegalSection key={section.title} {...section} />
          ))}

          {foundrySections.map((section) => (
            <LegalSection key={section.title} {...section} />
          ))}
        </section>

        <footer className="mt-14 border-t border-[rgba(0,212,245,0.12)] pt-8 text-[14px] text-[#4A6880]">
          Regido pelas leis aplicaveis no Brasil.
        </footer>
      </div>
    </main>
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
