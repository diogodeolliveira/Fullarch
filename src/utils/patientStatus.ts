import type { Appointment, Patient, Treatment } from '../types/database.types'

export interface PatientStatus {
  tag: 'ok' | 'attention'
  nextStep: string
}

const FINANCIAL_LABEL: Record<Patient['financial_status'], string> = {
  em_dia: 'Em dia',
  parcial: 'Pagamento parcial',
  atrasado: 'Parcelas em atraso',
}

/**
 * Porta direta de computePatientStatus() do protótipo (app.js), agora
 * operando sobre dados normalizados vindos do Supabase em vez de um
 * objeto `facts` pré-computado.
 */
export function computePatientStatus(
  treatments: Treatment[],
  patient: Patient,
  nextAppointment?: Appointment | null
): PatientStatus {
  const aguardando = treatments.find((t) => t.status === 'aguardando_aprovacao')
  if (aguardando) return { tag: 'attention', nextStep: `Aprovar — ${aguardando.name}` }

  const naoAgendado = treatments.find((t) => t.status === 'nao_agendado')
  if (naoAgendado) return { tag: 'attention', nextStep: `${naoAgendado.name} — agendar` }

  if (patient.financial_status === 'atrasado') {
    return { tag: 'attention', nextStep: patient.financial_note || FINANCIAL_LABEL.atrasado }
  }

  const emAndamento = treatments.find((t) => t.status === 'em_andamento')
  if (emAndamento) return { tag: 'ok', nextStep: `${emAndamento.name} — em andamento` }

  if (nextAppointment) {
    const date = new Date(nextAppointment.scheduled_at)
    return { tag: 'ok', nextStep: `Consulta em ${date.toLocaleDateString('pt-BR')}` }
  }

  return { tag: 'ok', nextStep: treatments.length ? 'Em dia' : 'Avaliação pendente' }
}

export function financialLabel(status: Patient['financial_status']) {
  return FINANCIAL_LABEL[status]
}
