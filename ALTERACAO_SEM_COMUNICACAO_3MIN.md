# 📋 Alteração: Evento "Sem Comunicação" com 3 Minutos de Tolerância

**Data:** 06/12/2025  
**Versão:** delta.v3  
**Arquivo Modificado:** `App.tsx`

---

## 🎯 Objetivo da Alteração

Modificar o sistema para exibir o evento **"Sem Comunicação"** na tabela de eventos quando o Posto de Serviço **NÃO ATIVA** ou **NÃO DESATIVA** dentro do horário programado, com um período de tolerância de **3 minutos**.

---

## ✨ Mudanças Implementadas

### 1. **Período de Tolerância Reduzido**
- **ANTES:** 10 minutos de tolerância
- **AGORA:** 3 minutos de tolerância

```typescript
const gracePeriodMinutes = 3; // ALTERADO: 3 minutos de tolerância
```

---

### 2. **Nova Verificação: Falta de Ativação**

O sistema agora verifica se o posto **ativou o sistema** no horário programado:

- ✅ Verifica entre **3 e 10 minutos** após o horário de ativação configurado
- ✅ Procura por eventos de **"Sistema Ativado"** ou **"Portaria Online"**
- ✅ Se NÃO encontrar esses eventos, gera **"Sem Comunicação"**

**Exemplo:**
- Horário de Ativação Configurado: `08:00`
- Tolerância: `3 minutos`
- Se às `08:03` o posto não tiver ativado → Gera evento "Sem Comunicação"

---

### 3. **Nova Verificação: Falta de Desativação** ⭐ NOVO!

O sistema agora **TAMBÉM** verifica se o posto **desativou o sistema** no horário programado:

- ✅ Verifica entre **3 e 10 minutos** após o horário de desativação configurado
- ✅ Procura por eventos de **"Sistema Desativado"** ou **"Portaria Offline"**
- ✅ Se NÃO encontrar esses eventos E o posto ainda estiver ativo, gera **"Sem Comunicação"**

**Exemplo:**
- Horário de Desativação Configurado: `18:00`
- Tolerância: `3 minutos`
- Se às `18:03` o posto não tiver desativado → Gera evento "Sem Comunicação"

---

### 4. **Verificação de Heartbeat Mantida**

A verificação de perda de heartbeat durante a operação foi **mantida**:

- ✅ Se o posto deveria estar ativo OU teve atividade recente
- ✅ E não envia heartbeat por **5 minutos**
- ✅ Gera evento "Sem Comunicação"

---

## 🔍 Lógica de Verificação (Ordem de Execução)

```
1️⃣ VERIFICAÇÃO DE ATIVAÇÃO
   ├─ Passou 3 minutos do horário de ativação?
   ├─ Posto ativou o sistema? (Sistema Ativado ou Portaria Online)
   └─ Se NÃO → Gera "Sem Comunicação"

2️⃣ VERIFICAÇÃO DE DESATIVAÇÃO
   ├─ Passou 3 minutos do horário de desativação?
   ├─ Posto desativou o sistema? (Sistema Desativado ou Portaria Offline)
   └─ Se NÃO e posto ainda ativo → Gera "Sem Comunicação"

3️⃣ VERIFICAÇÃO DE HEARTBEAT
   ├─ Posto está no horário de operação?
   ├─ Último heartbeat foi há mais de 5 minutos?
   └─ Se SIM → Gera "Sem Comunicação"
```

---

## 📊 Cenários de Teste

### ✅ Cenário 1: Posto Não Ativa no Horário
- **Configuração:** Ativação às 08:00
- **Situação:** Posto não ativa até 08:03
- **Resultado:** Evento "Sem Comunicação" gerado às 08:03

### ✅ Cenário 2: Posto Não Desativa no Horário
- **Configuração:** Desativação às 18:00
- **Situação:** Posto não desativa até 18:03 (mas ainda está enviando heartbeat)
- **Resultado:** Evento "Sem Comunicação" gerado às 18:03

### ✅ Cenário 3: Posto Perde Conexão Durante Operação
- **Configuração:** Operando entre 08:00 e 18:00
- **Situação:** Último heartbeat há 6 minutos
- **Resultado:** Evento "Sem Comunicação" gerado

### ✅ Cenário 4: Turno Overnight (22:00 às 06:00)
- **Configuração:** Ativação às 22:00, Desativação às 06:00
- **Situação:** Posto não ativa até 22:03
- **Resultado:** Evento "Sem Comunicação" gerado às 22:03

---

## 🛡️ Proteções Implementadas

### 1. **Anti-Duplicação**
- Não gera evento se já existe um "Sem Comunicação" nos últimos **1 minuto**

### 2. **Janela de Verificação**
- Verifica apenas entre **3 e 10 minutos** após o horário programado
- Evita alertas contínuos após o período inicial

### 3. **Ignora Posto Ativo**
- Não verifica o posto que está **ativo no dispositivo atual**

### 4. **Suporte a Overnight**
- Cálculos ajustados para turnos que passam da meia-noite

---

## 📝 Logs de Console

O sistema agora exibe logs mais descritivos:

```javascript
// Falta de Ativação
[CHECK] Posto [Nome]: Não ativou no horário programado (08:00). Gerando alerta.

// Falta de Desativação
[CHECK] Posto [Nome]: Não desativou no horário programado (18:00). Gerando alerta.

// Perda de Heartbeat
[CHECK] Posto [Nome]: Sem heartbeat há 320s. Gerando alerta.
```

---

## ⚙️ Configuração Necessária

Para que o sistema funcione corretamente, cada posto deve ter configurado na página **"Configurações do Alerta Vigia"**:

1. ✅ **Horário de Ativação** (ex: 08:00)
2. ✅ **Horário de Desativação** (ex: 18:00)
3. ✅ Duração do Progresso (minutos)
4. ✅ Tempo do Alerta Sonoro (segundos)

---

## 🚀 Como Testar

### Teste 1: Falta de Ativação
1. Configure um posto com ativação às **HH:MM** (hora atual + 1 minuto)
2. Aguarde até **HH:MM+3**
3. Verifique se o evento "Sem Comunicação" aparece na tabela

### Teste 2: Falta de Desativação
1. Configure um posto com desativação às **HH:MM** (hora atual + 1 minuto)
2. Ative o posto (faça login na tela Alerta Vigia)
3. Aguarde até **HH:MM+3** SEM desativar
4. Verifique se o evento "Sem Comunicação" aparece na tabela

### Teste 3: Perda de Heartbeat
1. Ative um posto
2. Feche o navegador/aba (para parar o heartbeat)
3. Aguarde 5 minutos
4. Verifique se o evento "Sem Comunicação" aparece na tabela

---

## 📧 Notificações por Email

Todos os eventos "Sem Comunicação" gerados disparam **email automático** para:
- ✅ Email da empresa cadastrada
- ✅ Assunto: `DeltaNuvem - Sem Comunicação`
- ✅ Detalhes: Empresa, Posto, Data e Horário

---

## ✅ Status

**IMPLEMENTADO E TESTADO**

A alteração está pronta para uso em produção. O sistema agora monitora:
- ✅ Falta de ativação (3 min)
- ✅ Falta de desativação (3 min)
- ✅ Perda de heartbeat (5 min)

---

**Desenvolvido por:** DeltaNuvem Tecnologia  
**Suporte:** (11) 99803-7370
