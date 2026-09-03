import { supabase } from '../lib/supabase'

/**
 * Quantos pacientes têm algo pedindo atenção agora — mesmo critério do
 * computePatientStatus() usado no prontuário (utils/patientStatus.ts):
 * tratamento aguardando aprovação, tratamento aprovado mas não agendado,
 * ou financeiro em atraso. Aqui só contamos (não recomputamos o texto do
 * "próximo passo" de cada um), por isso é uma query direta em vez de
 * reaproveitar computePatientStatus — evita buscar tratamentos de todo
 * mundo só pra saber um número.
 */
export async function countAttentionPatients() {
  const [{ data: pendingTreatments, error: e1 }, { data: latePatients, error: e2 }] = await Promise.all([
    supabase.from('treatments').select('patient_id').in('status', ['aguardando_aprovacao', 'nao_agendado']),
    supabase.from('patients').select('id').eq('financial_status', 'atrasado'),
  ])
  if (e1) throw e1
  if (e2) throw e2

  const ids = new Set<string>()
  for (const row of pendingTreatments ?? []) ids.add((row as any).patient_id)
  for (const row of latePatients ?? []) ids.add((row as any).id)
  return ids.size
}