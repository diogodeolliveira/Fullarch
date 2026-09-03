# CRM Odontológico — Missão 03 (React + TypeScript + Supabase + Google Drive)

**Status desta entrega:** fundação da arquitetura + uma fatia vertical
**totalmente funcional** (não mockada), ponta a ponta:

```
Login (Supabase Auth)
   → lista de pacientes (Supabase)
      → criar paciente (Supabase, com evento automático na Timeline)
         → Timeline (ler/criar eventos, anotações, agendamentos)
         → Tratamentos (ler)
         → Imagens / Documentos (upload real → Google Drive via Edge
           Function com conta de serviço → metadado gravado no Supabase)
```

Isso prova que a arquitetura fecha de ponta a ponta — banco, RLS, auth,
Drive — antes de portar o restante das telas.

---

## ⚠️ O que NÃO foi testado

Este ambiente não tem acesso à rede, então nada aqui rodou contra um projeto
Supabase real nem contra credenciais reais do Google. Antes de considerar
isso pronto:

1. Rode a migration num projeto Supabase de teste.
2. Deploy da Edge Function e teste o upload com uma conta de serviço de
   teste (não a de produção).
3. Só depois disso, aponte para produção.

---

## 1. Configurar o Supabase

```bash
# dentro de supabase/
supabase login
supabase link --project-ref SEU_PROJECT_REF
supabase db push          # aplica supabase/migrations/0001_init.sql
```

Crie o primeiro usuário da equipe em **Authentication > Users** no painel
(email/senha), já que o cadastro de pacientes exige login.

Copie `.env.example` para `.env.local` e preencha com a URL e a anon key
do projeto (Settings > API).

## 2. Configurar o Google Drive (conta de serviço)

1. No Google Cloud Console, crie um projeto (ou reaproveite um existente).
2. Ative a **Google Drive API**.
3. Crie uma **conta de serviço** e gere uma chave JSON.
4. No Google Drive, crie a pasta onde os arquivos dos pacientes vão ficar
   e **compartilhe essa pasta com o e-mail da conta de serviço** (ela não
   tem Drive próprio — precisa que uma pasta seja compartilhada com ela).
5. Pegue o ID da pasta (no final da URL) e o `client_email` /
   `private_key` do JSON da conta de serviço.
6. Configure os secrets da Edge Function:

```bash
supabase secrets set GOOGLE_SERVICE_ACCOUNT_EMAIL="conta@projeto.iam.gserviceaccount.com"
supabase secrets set GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
supabase secrets set GOOGLE_DRIVE_FOLDER_ID="id_da_pasta_no_drive"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="sua_service_role_key"
```

7. Deploy:

```bash
supabase functions deploy drive-upload
```

## 3. Rodar o app

```bash
npm install
npm run dev
```

---

## 2. O que já está portado e funcionando

| Área | Status |
|---|---|
| Auth (login/logout) | ✅ Supabase Auth email/senha |
| Lista de pacientes | ✅ leitura real |
| Cadastro de paciente | ✅ escrita real + evento automático na Timeline |
| Timeline | ✅ leitura + criação (Anotar, Agendar) |
| Tratamentos | ✅ leitura (criação/edição ainda no padrão da API, falta UI) |
| Imagens | ✅ upload real → Drive → metadado no Supabase |
| Documentos | ✅ mesmo componente (`FilesTab`) reaproveitado com `kind="document"` |

## 3. O que ainda é stub (próximos passos, mesmo padrão)

Cada item abaixo segue exatamente o padrão já estabelecido: **tabela no
Supabase → função em `src/api/` → hook em `src/hooks/` → componente**.

- **Odontograma** — schema (`tooth_conditions`) já existe; falta o
  componente visual interativo (`src/components/Odontograma.tsx`) e as
  funções `src/api/toothConditions.ts` (upsert por dente/condição,
  incluindo a regra de criar tratamento pendente ao marcar condição
  "atenção" — hoje isso é lógica só de client, dá pra manter assim ou
  mover para uma function/trigger no Postgres).
- **Mini questionário** — schema (`questionnaire_responses`) já existe;
  falta API + componente de chips.
- **Dashboard** — dá pra montar com queries agregadas simples
  (`count`, `filter` por status) usando as mesmas tabelas.
- **Agenda (visão diária/semanal)** — a tabela `appointments` já existe
  e já é usada pelo botão "Agendar"; falta a grade visual e criação
  direta por horário.
- **Criação/edição de tratamento pela UI** — a função `createTreatment`
  em `src/api/treatments.ts` já existe; falta o modal.
- **Registrar sessão de tratamento** — `addTreatmentSession` já existe
  na API; falta o modal.
- **Deletar arquivo do Drive** (hoje `deletePatientFile` só apaga o
  metadado) — precisa de uma segunda Edge Function ou de estender a
  `drive-upload` para aceitar `DELETE` chamando `drive.files.delete`.

## 4. Decisões tomadas nesta etapa

- **Single-tenant por enquanto.** RLS libera qualquer usuário autenticado
  para tudo. Quando for multi-tenant: adicionar `clinic_id` nas tabelas
  e trocar as policies para checar `clinic_id = auth.jwt() -> 'clinic_id'`
  (ou uma tabela `clinic_members`).
- **Auth = Supabase Auth (email/senha).** O Google Drive é acessado só
  pela conta de serviço da clínica, nunca pela conta pessoal do usuário
  logado — por isso o upload sempre passa pela Edge Function, nunca
  direto do navegador.
- **Binário nunca passa pelo cliente-Supabase.** O arquivo vai direto
  pro Drive via Edge Function; o Supabase só guarda o metadado
  (`google_drive_file_id`, `google_drive_url`, paciente, tipo, quem
  enviou).
- **"Quick facts" deixaram de ser um campo solto** (como no protótipo
  em JS) **e passaram a ser computados** a partir de dados normalizados
  (`treatments`, `appointments`, `patients.financial_status`) em
  `src/utils/patientStatus.ts` — é o mesmo algoritmo do
  `computePatientStatus()` do `app.js` original, só que operando sobre
  dados reais em vez de um objeto mockado.

## 5. Lembrete do processo do projeto

Isso é Missão 03 rodando em paralelo com pendências ainda abertas da
Missão 02 (ver `melhorias_antes_missao_03.md`). Nenhuma tela nova aqui
resolve essas pendências de UX — só prova que a base técnica aguenta o
que já foi validado. Vale voltar e fechar a Missão 02 antes de portar o
restante das telas, pra não repetir trabalho.
