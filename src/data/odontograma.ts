import type { ConditionType } from '../types/database.types'

export const DENTES = {
  SUPERIOR_ESQUERDA: [18, 17, 16, 15, 14, 13, 12, 11],
  SUPERIOR_DIREITA: [21, 22, 23, 24, 25, 26, 27, 28],
  INFERIOR_ESQUERDA: [38, 37, 36, 35, 34, 33, 32, 31],
  INFERIOR_DIREITA: [41, 42, 43, 44, 45, 46, 47, 48],
}

export const CONDICAO_GRUPOS: { label: string; items: [string, ConditionType][] }[] = [
  {
    label: 'Cárie',
    items: [
      ['Cárie oclusal', 'atencao'],
      ['Cárie mesial', 'atencao'],
      ['Cárie distal', 'atencao'],
      ['Cárie palatina', 'atencao'],
      ['Cárie lingual', 'atencao'],
      ['Cárie vestibular', 'atencao'],
    ],
  },
  {
    label: 'Restaurações',
    items: [
      ['Restauração satisfatória', 'tratado'],
      ['Restauração insatisfatória classe I', 'atencao'],
      ['Restauração insatisfatória classe II', 'atencao'],
      ['Restauração insatisfatória classe III', 'atencao'],
      ['Restauração insatisfatória classe IV', 'atencao'],
      ['Restauração insatisfatória classe V', 'atencao'],
    ],
  },
  {
    label: 'Desgaste e estrutura',
    items: [
      ['LCNC', 'atencao'],
      ['Atrição', 'atencao'],
      ['Abrasão', 'atencao'],
      ['Erosão', 'atencao'],
      ['Cálculo', 'atencao'],
      ['Raiz residual', 'atencao'],
      ['Dente fraturado', 'atencao'],
      ['Dente incluso', 'atencao'],
      ['Dente semi-incluso', 'atencao'],
      ['Ausente', 'ausente'],
    ],
  },
  {
    label: 'Periodontal',
    items: [
      ['Ressecção gengival', 'atencao'],
      ['Lesão de furca', 'atencao'],
      ['Mobilidade grau I', 'atencao'],
      ['Mobilidade grau II', 'atencao'],
      ['Mobilidade grau III', 'atencao'],
    ],
  },
  {
    label: 'Endodontia',
    items: [
      ['Tratamento endodôntico satisfatório', 'tratado'],
      ['Tratamento endodôntico insatisfatório', 'atencao'],
      ['Lesão periapical', 'atencao'],
    ],
  },
  {
    label: 'Prótese e implante',
    items: [
      ['Prótese fixa unitária', 'tratado'],
      ['Implante', 'tratado'],
    ],
  },
]

export const CONDICAO_TYPE: Record<string, ConditionType> = {}
CONDICAO_GRUPOS.forEach((g) => g.items.forEach(([name, type]) => (CONDICAO_TYPE[name] = type)))

export const QUESTIONARIO_GRUPOS: { label: string; items: string[] }[] = [
  {
    label: 'Prótese',
    items: ['Prótese total', 'PPR', 'PPR Kennedy I', 'PPR Kennedy II', 'PPR Kennedy III', 'PPR Kennedy IV'],
  },
  {
    label: 'Sintomas e hábitos (ATM)',
    items: [
      'Dor na região da mandíbula ou temporal',
      'Dor ao mastigar alimentos duros ou consistentes',
      'Dor ao abrir a boca ou movimentar a mandíbula',
      'Mantém os dentes sempre encostados',
      'Apertar ou ranger os dentes',
      'Mascar chiclete',
      'Dor ao bocejar, falar ou outras atividades',
    ],
  },
]
