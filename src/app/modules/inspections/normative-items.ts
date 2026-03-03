export type NormativeItem = {
  id: string;
  standard: string;
  code: string;
  title: string;
  keywords: string[];
  reference: string;
};

export const NORMATIVE_ITEMS: NormativeItem[] = [
  {
    id: "nr-01-gerenciamento-riscos",
    standard: "NR-01",
    code: "1.5",
    title: "Gerenciamento de riscos ocupacionais no PGR",
    keywords: ["pgr", "riscos", "gerenciamento", "gro"],
    reference:
      "NR-01, item 1.5 - Gerenciamento de Riscos Ocupacionais (GRO/PGR).",
  },
  {
    id: "nr-06-epi-obrigatorio",
    standard: "NR-06",
    code: "6.6",
    title: "Obrigatoriedade de fornecimento e uso de EPI adequado",
    keywords: ["epi", "capacete", "luva", "oculos", "cinto"],
    reference:
      "NR-06, item 6.6 - Fornecimento, orientação e exigência de uso de EPI.",
  },
  {
    id: "nr-10-instalacoes-eletricas",
    standard: "NR-10",
    code: "10.2",
    title: "Medidas de controle em instalações elétricas",
    keywords: ["eletrica", "painel", "choque", "energizado", "bloqueio"],
    reference:
      "NR-10, item 10.2 - Medidas de controle para trabalho com eletricidade.",
  },
  {
    id: "nr-12-protecao-maquinas",
    standard: "NR-12",
    code: "12.38",
    title: "Proteções fixas e móveis em máquinas e equipamentos",
    keywords: ["maquina", "protecao", "guardas", "equipamento", "prensa"],
    reference:
      "NR-12, item 12.38 - Sistemas de segurança e proteção de máquinas.",
  },
  {
    id: "nr-17-ergonomia-posto",
    standard: "NR-17",
    code: "17.3",
    title: "Condições de trabalho e ergonomia do posto",
    keywords: ["ergonomia", "posto", "cadeira", "bancada", "esforco"],
    reference:
      "NR-17, item 17.3 - Organização e adaptação das condições de trabalho.",
  },
  {
    id: "nr-18-escada-mao",
    standard: "NR-18",
    code: "18.9",
    title: "Uso seguro de escada de mão em canteiro",
    keywords: ["escada", "escadas", "mao", "altura", "acesso"],
    reference:
      "NR-18, item 18.9 - Requisitos para escadas de mão na construção.",
  },
  {
    id: "nr-18-andaime",
    standard: "NR-18",
    code: "18.15",
    title: "Condições de segurança para andaimes",
    keywords: ["andaime", "guarda-corpo", "plataforma", "altura"],
    reference: "NR-18, item 18.15 - Montagem e uso seguro de andaimes.",
  },
  {
    id: "nr-18-protecao-quedas",
    standard: "NR-18",
    code: "18.13",
    title: "Proteção coletiva contra quedas em altura",
    keywords: ["queda", "altura", "guarda-corpo", "linha de vida"],
    reference:
      "NR-18, item 18.13 - Proteções contra quedas em trabalhos em altura.",
  },
  {
    id: "nr-23-combate-incendio",
    standard: "NR-23",
    code: "23.1",
    title: "Proteção contra incêndios e rotas de fuga",
    keywords: ["incendio", "extintor", "rota", "fuga", "alarme"],
    reference: "NR-23 - Requisitos de prevenção e combate a incêndio.",
  },
  {
    id: "nr-24-instalacoes-sanitarias",
    standard: "NR-24",
    code: "24.2",
    title: "Condições sanitárias e de conforto nos locais de trabalho",
    keywords: ["sanitario", "vestiario", "higiene", "refeitorio"],
    reference: "NR-24 - Condições sanitárias e de conforto para trabalhadores.",
  },
  {
    id: "nr-26-sinalizacao-seguranca",
    standard: "NR-26",
    code: "26.1",
    title: "Sinalização de segurança e identificação de riscos",
    keywords: ["sinalizacao", "placa", "rotulo", "cor", "risco"],
    reference: "NR-26 - Sinalização de segurança no ambiente de trabalho.",
  },
  {
    id: "nr-33-espaco-confinado",
    standard: "NR-33",
    code: "33.3",
    title: "Permissão e controle de entrada em espaço confinado",
    keywords: ["espaco confinado", "pet", "atmosfera", "resgate"],
    reference: "NR-33, item 33.3 - Gestão de segurança em espaços confinados.",
  },
  {
    id: "nr-35-trabalho-altura",
    standard: "NR-35",
    code: "35.4",
    title: "Planejamento e execução de trabalho em altura",
    keywords: ["altura", "cinto", "ancoragem", "linha de vida", "queda"],
    reference:
      "NR-35, item 35.4 - Medidas de proteção para trabalho em altura.",
  },
  {
    id: "nbr-9050-acessibilidade-escadas",
    standard: "NBR-9050",
    code: "6.6",
    title: "Critérios de acessibilidade para escadas e circulação",
    keywords: ["acessibilidade", "escada", "corrimao", "degrau"],
    reference: "ABNT NBR 9050, item 6.6 - Parâmetros para escadas acessíveis.",
  },
  {
    id: "nbr-9077-saidas-emergencia",
    standard: "NBR-9077",
    code: "4",
    title: "Dimensionamento de saídas de emergência",
    keywords: ["saida", "emergencia", "rota", "fuga", "escada"],
    reference: "ABNT NBR 9077 - Saídas de emergência em edifícios.",
  },
  {
    id: "nbr-5410-instalacao-eletrica",
    standard: "NBR-5410",
    code: "5",
    title: "Segurança em instalações elétricas de baixa tensão",
    keywords: ["eletrica", "fiação", "quadro", "aterramento", "circuito"],
    reference: "ABNT NBR 5410 - Instalações elétricas de baixa tensão.",
  },
  {
    id: "nbr-5419-spda",
    standard: "NBR-5419",
    code: "3",
    title: "Proteção contra descargas atmosféricas (SPDA)",
    keywords: ["spda", "raio", "aterramento", "para-raios"],
    reference:
      "ABNT NBR 5419 - Sistema de proteção contra descargas atmosféricas.",
  },
  {
    id: "nbr-14608-andaimes",
    standard: "NBR-14608",
    code: "6",
    title: "Procedimentos de montagem e uso de andaimes",
    keywords: ["andaime", "montagem", "plataforma", "escada"],
    reference: "ABNT NBR 14608 - Requisitos para andaimes de construção.",
  },
  {
    id: "nbr-6494-seguranca-andaimes",
    standard: "NBR-6494",
    code: "5",
    title: "Condições de segurança em andaimes",
    keywords: ["andaime", "seguranca", "guarda-corpo", "altura"],
    reference: "ABNT NBR 6494 - Segurança em andaimes.",
  },
];

export function filterNormativeItems(
  standardsFilter: string,
  keywordFilter: string,
) {
  const normalizedStandard = standardsFilter.trim().toLowerCase();
  const normalizedKeyword = keywordFilter.trim().toLowerCase();

  return NORMATIVE_ITEMS.filter((item) => {
    const matchesStandard =
      !normalizedStandard ||
      item.standard.toLowerCase().includes(normalizedStandard);

    const matchesKeyword =
      !normalizedKeyword ||
      item.title.toLowerCase().includes(normalizedKeyword) ||
      item.code.toLowerCase().includes(normalizedKeyword) ||
      item.keywords.some((keyword) =>
        keyword.toLowerCase().includes(normalizedKeyword),
      );

    return matchesStandard && matchesKeyword;
  });
}
