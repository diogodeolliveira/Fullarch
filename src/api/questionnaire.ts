import { supabase } from '../lib/supabase'

export async function listQuestionnaireItems(patientId: string) {
  const { data, error } = await supabase
    .from('questionnaire_responses')
    .select('item')
    .eq('patient_id', patientId)
  if (error) throw error
  return (data ?? []).map((r) => r.item as string)
}

export async function toggleQuestionnaireItem(patientId: string, item: string, selected: boolean) {
  if (selected) {
    const { error } = await supabase.from('questionnaire_responses').insert({ patient_id: patientId, item })
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('questionnaire_responses')
      .delete()
      .eq('patient_id', patientId)
      .eq('item', item)
    if (error) throw error
  }
}
