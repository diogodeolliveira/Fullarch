import { supabase } from '../lib/supabase'
import type { ConditionType, ToothCondition } from '../types/database.types'
import { addTimelineEvent } from './timeline'

export async function listToothConditions(patientId: string) {
  const { data, error } = await supabase.from('tooth_conditions').select('*').eq('patient_id', patientId)
  if (error) throw error
  return data as ToothCondition[]
}

/**
 * Substitui as condições de um dente pelo conjunto atual selecionado no
 * modal. Condições novas do tipo "atenção" geram automaticamente um
 * tratamento "aguardando_aprovacao" + evento na timeline — mesma regra do
 * criarTratamentoPendente() do protótipo original.
 */
export async function saveToothConditions(params: {
  patientId: string
  toothNumber: number
  selected: { name: string; type: ConditionType }[]
}) {
  const { patientId, toothNumber, selected } = params

  const { data: existingRows, error: existingError } = await supabase
    .from('tooth_conditions')
    .select('condition_name')
    .eq('patient_id', patientId)
    .eq('tooth_number', toothNumber)
  if (existingError) throw existingError
  const existingNames = new Set((existingRows ?? []).map((r) => r.condition_name))

  const { error: deleteError } = await supabase
    .from('tooth_conditions')
    .delete()
    .eq('patient_id', patientId)
    .eq('tooth_number', toothNumber)
  if (deleteError) throw deleteError

  if (selected.length > 0) {
    const { error: insertError } = await supabase.from('tooth_conditions').insert(
      selected.map((s) => ({
        patient_id: patientId,
        tooth_number: toothNumber,
        condition_name: s.name,
        condition_type: s.type,
      }))
    )
    if (insertError) throw insertError
  }

  const newlyAdded = selected.filter((s) => s.type === 'atencao' && !existingNames.has(s.name))
  for (const item of newlyAdded) {
    await createPendingTreatmentForTooth(patientId, toothNumber, item.name)
  }
}

export async function clearToothConditions(patientId: string, toothNumber: number) {
  const { error } = await supabase
    .from('tooth_conditions')
    .delete()
    .eq('patient_id', patientId)
    .eq('tooth_number', toothNumber)
  if (error) throw error
}

async function createPendingTreatmentForTooth(patientId: string, toothNumber: number, conditionName: string) {
  const isOutro = conditionName.startsWith('Outro:')
  const label = isOutro ? conditionName.replace('Outro: ', '') : conditionName
  const toothRef = `Dente ${toothNumber}`

  const { data: existingTreatments, error: checkError } = await supabase
    .from('treatments')
    .select('id, name')
    .eq('patient_id', patientId)
    .eq('tooth_ref', toothRef)
  if (checkError) throw checkError
  const jaExiste = (existingTreatments ?? []).some((t) => t.name.includes(label))
  if (jaExiste) return

  const { error: insertError } = await supabase.from('treatments').insert({
    patient_id: patientId,
    name: `${label} — dente ${toothNumber}`,
    tooth_ref: toothRef,
    origin: 'odontograma',
    status: 'aguardando_aprovacao',
  })
  if (insertError) throw insertError

  await addTimelineEvent({
    patientId,
    title: 'Pendência identificada no odontograma',
    description: `${label} registrada no dente ${toothNumber}. Tratamento adicionado à aba Tratamentos, aguardando aprovação do paciente.`,
    kind: 'Tratamento',
  })
}
