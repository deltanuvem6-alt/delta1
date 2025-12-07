# 🔧 Correção do Problema de "Sem Comunicação" Falso Positivo

## ❌ Problema Identificado

O sistema estava gerando eventos de **"Sem Comunicação"** incorretamente quando o tablet estava **online** e ativo na página do Alerta Vigia.

### **Causa Raiz:**

1. **Falta de Sincronização em Tempo Real**: O heartbeat era enviado para o banco de dados, mas o estado local `posts` não era atualizado automaticamente.
2. **Estado Desatualizado**: A função `checkPostStatus` usava dados antigos de `last_heartbeat`, resultando em falsos positivos.

---

## ✅ Solução Implementada

### **1. Subscription em Tempo Real para `service_posts`**

**Arquivo**: `App.tsx` (linhas 391-419)

Adicionada uma nova subscription que escuta mudanças na tabela `service_posts`:

```typescript
// Real-time subscription for service_posts (heartbeat updates)
useEffect(() => {
    const channel = supabase
        .channel('service_posts_heartbeat')
        .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'service_posts' },
            async (payload) => {
                const updatedPost = payload.new as any;
                console.log(`[REALTIME] Post ${updatedPost.id} heartbeat updated:`, updatedPost.last_heartbeat);
                
                // Update the local posts state with the new heartbeat
                setPosts(prev => 
                    prev.map(post => 
                        post.id === updatedPost.id 
                            ? { ...post, last_heartbeat: updatedPost.last_heartbeat }
                            : post
                    )
                );
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}, []);
```

**Benefício**: Agora, sempre que o heartbeat é atualizado no banco, o estado local é sincronizado automaticamente.

---

### **2. Logs Detalhados para Debug**

Adicionados logs em todas as etapas da verificação de heartbeat:

- ✅ `[HEARTBEAT CHECK] Skipping post X: No config` - Posto sem configuração
- ✅ `[HEARTBEAT CHECK] Skipping post X: Currently active` - Posto ativo no momento
- ✅ `[HEARTBEAT CHECK] Skipping post X: Outside active hours` - Fora do horário programado
- ✅ `[HEARTBEAT CHECK] Post X: Last heartbeat Xs ago (Threshold: 300s)` - Tempo desde último heartbeat
- ⚠️ `[HEARTBEAT CHECK] ⚠️ Post X: Heartbeat stale but recent 'Portaria Online' event exists - waiting...` - Aguardando estabilização
- ❌ `[HEARTBEAT CHECK] ❌ Post X has no heartbeat for Xs. Creating 'Sem Comunicação' event.` - Criando evento

---

### **3. Verificação Adicional de "Portaria Online"**

**Arquivo**: `App.tsx` (linhas 625-633)

Antes de criar um evento de "Sem Comunicação", o sistema agora verifica se há um evento de **"Portaria Online"** nos últimos **10 minutos**:

```typescript
// Additional check: verify if there's a "Portaria Online" event in the last 10 minutes
// This prevents false positives when the system just came online
const recentOnlineEvent = eventsForPost.find(e =>
    e.type === EventType.GatehouseOnline &&
    (now.getTime() - e.timestamp.getTime()) < 10 * 60 * 1000
);

if (recentOnlineEvent) {
    console.log(`[HEARTBEAT CHECK] ⚠️ Post ${post.id}: Heartbeat stale but recent 'Portaria Online' event exists - waiting...`);
    return;
}
```

**Benefício**: Evita falsos positivos quando o sistema acabou de ser ativado e o heartbeat ainda está se estabelecendo.

---

## 🧪 Como Testar

### **Passo 1: Verificar Logs no Console**

1. Abra o **DevTools** (F12) no navegador
2. Vá para a aba **Console**
3. Filtre por `[HEARTBEAT` para ver apenas logs relacionados

### **Passo 2: Testar Cenário Normal (Online)**

1. ✅ Acesse o **Alerta Vigia** com um posto configurado
2. ✅ Aguarde alguns minutos
3. ✅ Verifique no console:
   - `[HEARTBEAT] Sending heartbeat for post X` - A cada 30 segundos
   - `[REALTIME] Post X heartbeat updated` - Confirmação de sincronização
   - `[HEARTBEAT CHECK] Skipping post X: Currently active` - Posto não é verificado

4. ✅ **Resultado Esperado**: Nenhum evento "Sem Comunicação" deve ser criado

### **Passo 3: Testar Cenário de Perda de Conexão (Offline)**

1. ❌ Acesse o **Alerta Vigia**
2. ❌ **Desative a internet** do tablet/computador
3. ❌ Aguarde **5 minutos** (300 segundos)
4. ✅ Reative a internet
5. ✅ Verifique no **Monitoramento** se o evento "Sem Comunicação" foi criado

### **Passo 4: Testar Cenário de App Fechado**

1. ❌ Acesse o **Alerta Vigia**
2. ❌ **Feche o navegador/app**
3. ❌ Aguarde **5 minutos**
4. ✅ Abra novamente
5. ✅ Verifique se o evento "Sem Comunicação" foi criado (deve ter sido)

---

## 📊 Fluxo de Funcionamento Correto

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Tablet acessa Alerta Vigia                               │
│    → Evento "Portaria Online" criado                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Heartbeat enviado a cada 30 segundos                     │
│    → Atualiza `last_heartbeat` no banco                     │
│    → Subscription atualiza estado local                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. checkPostStatus executa a cada 60 segundos               │
│    → Verifica se está no horário programado                 │
│    → Verifica se há heartbeat recente (< 300s)              │
│    → Verifica se há evento "Portaria Online" recente        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. SE heartbeat > 300s E sem "Portaria Online" recente      │
│    → Cria evento "Sem Comunicação"                          │
│    → Envia email de notificação                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Parâmetros de Configuração

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| **HEARTBEAT_INTERVAL_MS** | 30.000ms (30s) | Intervalo entre heartbeats |
| **HEARTBEAT_THRESHOLD_SECONDS** | 45s | Tolerância para heartbeat |
| **Timeout de Verificação** | 300s (5min) | Tempo sem heartbeat para criar evento |
| **Período de Graça** | 5min | Tempo após ativação antes de verificar |
| **Janela "Portaria Online"** | 10min | Tempo para considerar evento recente |
| **Janela "Sem Comunicação"** | 10min | Evita duplicatas de eventos |

---

## ⚠️ Observações Importantes

### **1. Realtime Subscriptions no Supabase**

Certifique-se de que as **Realtime Subscriptions** estão habilitadas no Supabase:

1. Acesse: https://supabase.com/dashboard/project/hrubgwggnnxyqeomhhyc/database/replication
2. Verifique se a tabela `service_posts` está com **Realtime** habilitado
3. Se não estiver, clique em **Enable Realtime**

### **2. RLS (Row Level Security)**

As políticas de RLS devem permitir:
- ✅ **SELECT** na tabela `service_posts` para role `anon`
- ✅ **UPDATE** na tabela `service_posts` para role `anon` (para heartbeat)

### **3. Logs de Produção**

Em produção (Render.com), os logs podem ser visualizados em:
- **Render Dashboard** → Seu projeto → **Logs**
- Filtrar por `[HEARTBEAT` ou `[REALTIME`

---

## 🐛 Troubleshooting

### **Problema: Ainda recebe "Sem Comunicação" com app online**

**Solução**:
1. Verifique se o Realtime está habilitado no Supabase
2. Abra o console e procure por `[REALTIME] Post X heartbeat updated`
3. Se não aparecer, verifique as permissões RLS

### **Problema: Não recebe "Sem Comunicação" quando deveria**

**Solução**:
1. Verifique se o posto tem configuração de horários (`alerta_vigia_configs`)
2. Verifique se está dentro do horário programado
3. Verifique os logs: `[HEARTBEAT CHECK] Skipping post X: ...`

### **Problema: Muitos logs no console**

**Solução**:
- Os logs são para debug e podem ser removidos em produção
- Para filtrar, use o filtro do DevTools: `[HEARTBEAT` ou `[REALTIME`

---

## 📝 Checklist de Verificação

- [ ] Realtime habilitado no Supabase para `service_posts`
- [ ] RLS permite SELECT e UPDATE em `service_posts`
- [ ] Heartbeat sendo enviado a cada 30s (verificar console)
- [ ] Estado local sendo atualizado (verificar console: `[REALTIME]`)
- [ ] Nenhum evento falso positivo quando online
- [ ] Evento criado corretamente quando offline por 5+ minutos

---

## 🎉 Resultado Esperado

✅ **Sistema funcionando corretamente**:
- Heartbeat enviado regularmente
- Estado local sincronizado em tempo real
- Eventos "Sem Comunicação" criados apenas quando realmente necessário
- Logs detalhados para debug e monitoramento

---

**Data da Correção**: 05/12/2025  
**Versão**: delta.v3  
**Arquivos Modificados**: `App.tsx`
