# ⚡ Monitoramento de Fonte de Energia (Tablet)

**Data:** 11/12/2025
**Versão:** delta.v3
**Funcionalidade:** Detecção automática de conexão/desconexão da fonte de energia (carregador).

---

## 📋 Pré-requisitos (OBRIGATÓRIO)

Para que os novos eventos funcionem, você **PRECISA** atualizar o banco de dados Supabase.

1. Acesse o **SQL Editor** do seu projeto Supabase.
2. Copie o conteúdo do arquivo `update_event_constraint_power.sql`.
3. Cole no editor e clique em **RUN**.

**O que isso faz?**
Isso permite que o banco de dados aceite dois novos tipos de evento:
- `Fonte Conectada`
- `Fonte Desconectada`

---

## 🚀 Como Funciona

O sistema usa sensores nativos do Android para detectar o estado da bateria:

1. **Ao Entrar no "Alerta Vigia":**
   - O sistema verifica o estado inicial.
   - Exemplo: Se já estiver fora da tomada, ele registra internamente (sem criar evento spam).

2. **Durante o Monitoramento:**
   - **Desconectou o cabo:** O sistema detecta instantaneamente e gera o evento `Fonte Desconectada`.
   - **Conectou o cabo:** O sistema detecta e gera o evento `Fonte Conectada`.

3. **Notificação Automática:**
   - ✅ **Email enviado automaticamente** para o supervisor da empresa.
   - ✅ Evento registrado na tabela de Monitoramento.
   - ✅ Útil para detectar quedas de energia ou desconexões não autorizadas.

---

## 🧪 Como Testar

### Emulador Android
1. Abra o emulador Extended Controls (três pontinhos na barra lateral).
2. Vá em **Battery**.
3. Em **Charger connection**, mude de "AC Charger" para "None".
   - ✅ O App deve gerar o evento **Fonte Desconectada**.
4. Mude de volta para "AC Charger".
   - ✅ O App deve gerar o evento **Fonte Conectada**.

### Dispositivo Real (Tablet/Celular)
1. Abra o App e entre na tela "Alerta Vigia".
2. **Remova o carregador da tomada.**
   - ✅ Verifique se o evento apareceu no Monitoramento.
3. **Conecte o carregador novamente.**
   - ✅ Verifique se o evento apareceu no Monitoramento.

---

## ⚠️ Observações

- **Somente Android/iOS:** Essa funcionalidade depende de hardware nativo. Em navegadores de PC (Chrome/Edge), a API de bateria pode não ser suportada ou se comportar de forma diferente.
- **Fail-Safe:** O sistema foi projetado para não gerar eventos duplicados se você conectar/desconectar muito rápido (debounce nativo do hardware).

---

**Suporte DeltaNuvem**
