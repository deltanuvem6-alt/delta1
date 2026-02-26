# 🧪 GUIA DE TESTE - Correção Evento "Sistema Ativado" Duplicado

**Data:** 09/12/2025  
**Objetivo:** Verificar se a proteção anti-duplicação está funcionando corretamente

---

## ✅ PRÉ-REQUISITOS

- [ ] Servidor local rodando (`npm run dev`)
- [ ] Console do navegador aberto (F12)
- [ ] Login como Admin ou Empresa
- [ ] Posto de teste configurado com horário de ativação

---

## 🧪 TESTE 1: Oscilação de Internet Simulada

### **Objetivo:** Verificar se eventos duplicados são bloqueados após reconexões

### **Passos:**

1. **Configurar Posto:**
   - Vá em "Postos de Serviço"
   - Clique em ⚙️ (Configurações) do posto de teste
   - Configure:
     - **Ativação:** Hora atual + 2 minutos (ex: se agora é 10:30, configure 10:32)
     - **Desativação:** Hora atual + 30 minutos
   - Clique em **Salvar**

2. **Fazer Login no Alerta Vigia:**
   - Vá em "Alerta Vigia"
   - Digite ID do posto e senha
   - Clique em "Iniciar Monitoramento"

3. **Aguardar Ativação Automática:**
   - Aguarde até o horário de ativação programado
   - Observe o console (F12):
     ```
     [ANTI-DUP] Verificando eventos "Sistema Ativado" para posto X desde...
     [ANTI-DUP] ✅ Nenhum evento "Sistema Ativado" recente encontrado. Criando novo evento...
     ```

4. **Simular Oscilação de Internet:**
   - **Desconecte** a internet (WiFi ou cabo)
   - Aguarde 10 segundos
   - **Reconecte** a internet
   - Aguarde 10 segundos
   - **Repita** mais 2 vezes (total de 3 desconexões)

5. **Verificar Resultado:**
   - Vá em "Monitoramento"
   - Filtre pelo ID do posto
   - **RESULTADO ESPERADO:**
     - ✅ Deve haver **APENAS 1** evento "Sistema Ativado"
     - ✅ Horário do evento deve ser próximo ao horário de ativação programado
   - **Verificar Console:**
     ```
     [ANTI-DUP] ⚠️ Evento "Sistema Ativado" JÁ EXISTE para posto X às...
     [ANTI-DUP] Bloqueando duplicação.
     ```

### **Critérios de Sucesso:**
- [ ] Apenas 1 evento "Sistema Ativado" criado
- [ ] Logs mostram bloqueio de duplicação
- [ ] Sem erros no console

---

## 🧪 TESTE 2: Múltiplas Abas Simultâneas

### **Objetivo:** Verificar se abrir múltiplas abas não cria eventos duplicados

### **Passos:**

1. **Abrir 3 Abas do Navegador:**
   - Abra `http://localhost:5173/` em 3 abas diferentes

2. **Fazer Login em Todas:**
   - Em cada aba, faça login no mesmo posto
   - Use "Alerta Vigia" → Digite ID e senha

3. **Aguardar Ativação:**
   - Configure horário de ativação para daqui a 2 minutos
   - Aguarde a ativação automática

4. **Verificar Resultado:**
   - Vá em "Monitoramento"
   - **RESULTADO ESPERADO:**
     - ✅ Deve haver **APENAS 1** evento "Sistema Ativado"
     - ✅ Mesmo com 3 abas abertas

### **Critérios de Sucesso:**
- [ ] Apenas 1 evento criado
- [ ] Logs em todas as abas mostram verificação
- [ ] Sem eventos duplicados

---

## 🧪 TESTE 3: Ativação Manual vs Automática

### **Objetivo:** Verificar se ativações legítimas não são bloqueadas

### **Passos:**

1. **Primeira Ativação (Manual):**
   - Configure ativação para **AGORA** (hora atual)
   - Faça login no Alerta Vigia
   - Sistema deve ativar imediatamente
   - **Verificar:** 1 evento "Sistema Ativado" criado

2. **Desativar:**
   - Clique em "Sair" (X no canto superior direito)
   - **Verificar:** 1 evento "Sistema Desativado" criado

3. **Segunda Ativação (Após 30 min):**
   - Aguarde 30 minutos OU
   - Configure novo horário de ativação (diferente do anterior)
   - Faça login novamente
   - **Verificar:** NOVO evento "Sistema Ativado" criado (não bloqueado)

### **Critérios de Sucesso:**
- [ ] Primeira ativação cria evento normalmente
- [ ] Desativação funciona normalmente
- [ ] Segunda ativação (após janela de 30 min) cria novo evento
- [ ] Sem bloqueios indevidos

---

## 🧪 TESTE 4: Turno Overnight

### **Objetivo:** Verificar se a lógica funciona para turnos que passam da meia-noite

### **Passos:**

1. **Configurar Turno Overnight:**
   - Ativação: `22:00`
   - Desativação: `06:00`

2. **Testar às 23:00 (durante o turno):**
   - Faça login no Alerta Vigia
   - Sistema deve ativar automaticamente
   - **Verificar:** 1 evento "Sistema Ativado" criado

3. **Simular Oscilação:**
   - Desconecte e reconecte internet 2x
   - **Verificar:** Nenhum evento duplicado

4. **Testar às 01:00 (após meia-noite):**
   - Sistema ainda deve estar ativo
   - Desconecte e reconecte internet
   - **Verificar:** Nenhum evento duplicado

### **Critérios de Sucesso:**
- [ ] Ativação overnight funciona corretamente
- [ ] Janela de verificação ajusta para dia anterior
- [ ] Sem eventos duplicados após meia-noite

---

## 🧪 TESTE 5: Erro de Conexão com Supabase

### **Objetivo:** Verificar comportamento fail-safe em caso de erro

### **Passos:**

1. **Simular Erro de Conexão:**
   - Temporariamente, altere a URL do Supabase em `supabaseClient.ts` para uma URL inválida
   - OU desative o Supabase temporariamente

2. **Fazer Login no Alerta Vigia:**
   - Sistema tentará verificar eventos no banco
   - Deve falhar na consulta

3. **Verificar Console:**
   ```
   [ANTI-DUP] Erro ao verificar eventos recentes: [mensagem de erro]
   ```

4. **Verificar Comportamento:**
   - **RESULTADO ESPERADO:**
     - ✅ Evento "Sistema Ativado" é criado MESMO COM ERRO (fail-safe)
     - ✅ Sistema não trava
     - ✅ Log de erro é exibido

5. **Restaurar Configuração:**
   - Volte a URL correta do Supabase

### **Critérios de Sucesso:**
- [ ] Evento criado mesmo com erro de conexão
- [ ] Sistema não trava
- [ ] Log de erro claro no console

---

## 📊 CHECKLIST FINAL

Após executar todos os testes, verifique:

### **Funcionalidade:**
- [ ] Eventos duplicados são bloqueados
- [ ] Eventos legítimos são criados normalmente
- [ ] Desativação funciona sem alterações
- [ ] Turnos overnight funcionam corretamente
- [ ] Fail-safe funciona em caso de erro

### **Performance:**
- [ ] Sem travamentos ou lentidão
- [ ] Consulta ao banco é rápida (<500ms)
- [ ] Interface permanece responsiva

### **Logs:**
- [ ] Logs `[ANTI-DUP]` aparecem corretamente
- [ ] Mensagens são claras e informativas
- [ ] Sem erros no console (exceto teste de erro)

### **Banco de Dados:**
- [ ] Tabela `monitoring_events` não tem duplicados
- [ ] Timestamps estão corretos
- [ ] Eventos são salvos corretamente

---

## 🐛 PROBLEMAS COMUNS

### **Problema 1: Evento ainda duplica**
**Possível Causa:** Janela de verificação muito curta  
**Solução:** Verifique se a janela de 30 minutos está sendo calculada corretamente

### **Problema 2: Evento legítimo bloqueado**
**Possível Causa:** Evento anterior ainda dentro da janela  
**Solução:** Aguarde 30 minutos ou ajuste a janela de verificação

### **Problema 3: Erro no console**
**Possível Causa:** Supabase offline ou credenciais incorretas  
**Solução:** Verifique conexão com Supabase e credenciais

### **Problema 4: Logs não aparecem**
**Possível Causa:** Console não está aberto ou filtrado  
**Solução:** Abra F12 e verifique se não há filtros ativos

---

## 📝 RELATÓRIO DE TESTE

Após concluir os testes, preencha:

**Data do Teste:** _______________  
**Testado por:** _______________  
**Versão:** delta.v3

### **Resultados:**

| Teste | Status | Observações |
|-------|--------|-------------|
| Teste 1: Oscilação Internet | ☐ Passou ☐ Falhou | |
| Teste 2: Múltiplas Abas | ☐ Passou ☐ Falhou | |
| Teste 3: Ativação Manual/Auto | ☐ Passou ☐ Falhou | |
| Teste 4: Turno Overnight | ☐ Passou ☐ Falhou | |
| Teste 5: Erro Conexão | ☐ Passou ☐ Falhou | |

### **Conclusão:**
☐ **APROVADO** - Todos os testes passaram  
☐ **REPROVADO** - Ajustes necessários  
☐ **PARCIAL** - Alguns testes falharam

### **Observações Adicionais:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

## 📞 Suporte

Se encontrar problemas durante os testes:

**WhatsApp:** (11) 99803-7370  
**Email:** deltanuvem1@gmail.com

---

**Desenvolvido por:** DeltaNuvem Tecnologia  
**Sistema de Monitoramento 24h de Postos de Serviço**
