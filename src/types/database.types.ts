// Tipos manuais refletindo supabase/migrations/0001_init.sql.
// Quando o projeto Supabase estiver criado de verdade, troque este arquivo
// pelo gerado automaticamente:
//   npx supabase gen types typescript --project-id SEU_PROJECT_ID > src/types/database.types.ts

export type PaymentStatus = 'pago' | 'parcial' | 'pendente'
export type TreatmentStatus =
  | 'aguardando_aprovacao'
  | 'nao_agendado'
  | 'em_andamento'
  | 'concluido'
  | 'cancelado'
export type TreatmentOrigin = 'manual' | 'odontograma'
export type TimelineKind = 'Consulta' | 'Tratamento' | 'Imagem' | 'Documento' | 'Anotação'
export type ConditionType = 'atencao' | 'tratado' | 'ausente'
export type FileKind = 'image' | 'document'
export type AppointmentStatus = 'agendada' | 'concluida' | 'cancelada'
export type FinancialStatus = 'em_dia' | 'parcial' | 'atrasado'

export interface Patient {
  id: string
  name: string
  age: number | null
  phone: string | null
  plan: string
  financial_status: FinancialStatus
  financial_note: string | null
  created_at: string
  updated_at: string
}

export interface Treatment {
  id: string
  patient_id: string
  name: string
  tooth_ref: string
  origin: TreatmentOrigin
  professional: string | null
  cost: number | null
  payment_status: PaymentStatus
  progress_pct: number
  status: TreatmentStatus
  scheduled_at: string | null
  created_at: string
  updated_at: string
}

export interface TreatmentSession {
  id: string
  treatment_id: string
  session_date: string
  note: string
  progress_pct: number | null
  created_at: string
}

export interface TimelineEvent {
  id: string
  patient_id: string
  event_date: string
  title: string
  description: string | null
  kind: TimelineKind
  muted: boolean
  created_at: string
}

export interface ToothCondition {
  id: string
  patient_id: string
  tooth_number: number
  condition_name: string
  condition_type: ConditionType
  created_at: string
}

export interface QuestionnaireResponse {
  id: string
  patient_id: string
  item: string
  created_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  scheduled_at: string
  reason: string
  status: AppointmentStatus
  created_at: string
}

export interface PatientFile {
  id: string
  patient_id: string
  treatment_id: string | null
  kind: FileKind
  label: string
  google_drive_file_id: string
  google_drive_url: string
  uploaded_by: string | null
  created_at: string
}

// Formato mínimo compatível com o client tipado do supabase-js.
// (Se depois você gerar os tipos oficiais, este arquivo é substituído
// e o client em src/lib/supabase.ts continua funcionando sem mudanças.)
export interface Database {
  public: {
    Tables: {
      patients: { Row: Patient; Insert: Partial<Patient>; Update: Partial<Patient> }
      treatments: { Row: Treatment; Insert: Partial<Treatment>; Update: Partial<Treatment> }
      treatment_sessions: {
        Row: TreatmentSession
        Insert: Partial<TreatmentSession>
        Update: Partial<TreatmentSession>
      }
      timeline_events: {
        Row: TimelineEvent
        Insert: Partial<TimelineEvent>
        Update: Partial<TimelineEvent>
      }
      tooth_conditions: {
        Row: ToothCondition
        Insert: Partial<ToothCondition>
        Update: Partial<ToothCondition>
      }
      questionnaire_responses: {
        Row: QuestionnaireResponse
        Insert: Partial<QuestionnaireResponse>
        Update: Partial<QuestionnaireResponse>
      }
      appointments: { Row: Appointment; Insert: Partial<Appointment>; Update: Partial<Appointment> }
      files: { Row: PatientFile; Insert: Partial<PatientFile>; Update: Partial<PatientFile> }
    }
  }
}
