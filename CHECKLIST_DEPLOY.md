# ✅ Checklist de Deploy - DeltaNuvem no Render.com

## 📦 Arquivos Criados/Atualizados

- [x] `render.yaml` - Configuração do Render
- [x] `.node-version` - Versão do Node.js (18.18.0)
- [x] `public/_redirects` - Redirecionamento para SPA
- [x] `package.json` - Engines adicionados
- [x] `DEPLOY.md` - Documentação de deploy
- [x] Build testado localmente ✅

## 🔍 Verificações Pré-Deploy

### 1. Código
- [x] Build local funciona (`npm run build`)
- [x] Pasta `dist` gerada corretamente
- [ ] Código commitado no Git
- [ ] Push para repositório remoto

### 2. Supabase
- [ ] Projeto Supabase ativo
- [ ] URL e Anon Key corretos em `supabaseClient.ts`
- [ ] RLS (Row Level Security) configurado
- [ ] Tabelas criadas (executar `schema.sql`)
- [ ] Políticas de acesso configuradas

### 3. Configurações
- [ ] Logo da empresa configurado
- [ ] Som de alerta no Supabase Storage
- [ ] Usuário admin criado no banco

## 🚀 Passos para Deploy no Render

### Passo 1: Preparar Repositório Git

```bash
# Verificar status
git status

# Adicionar todos os arquivos
git add .

# Commit
git commit -m "Preparar para deploy no Render.com"

# Push para o repositório
git push origin main
```

### Passo 2: Criar Static Site no Render

1. Acesse: https://dashboard.render.com/
2. Clique em **"New +"** → **"Static Site"**
3. Conecte seu repositório (GitHub/GitLab/Bitbucket)
4. Selecione o repositório `delta.v3`

### Passo 3: Configurar o Deploy

**Configurações Básicas:**
```
Name: deltanuvem
Branch: main
Root Directory: (deixe vazio)
Build Command: npm install && npm run build
Publish Directory: dist
```

**Auto-Deploy:** ✅ Yes

### Passo 4: Variáveis de Ambiente (Opcional)

Se necessário, adicione em **Environment Variables**:
```
GEMINI_API_KEY=sua_chave_aqui
```

### Passo 5: Deploy

1. Clique em **"Create Static Site"**
2. Aguarde o build (2-5 minutos)
3. Acesse a URL fornecida

## 🔗 URLs Importantes

- **Render Dashboard**: https://dashboard.render.com/
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Documentação Render**: https://render.com/docs/static-sites

## 🧪 Testes Pós-Deploy

Após o deploy, teste:

- [ ] Página inicial carrega
- [ ] Login funciona
- [ ] Cadastro de empresa funciona
- [ ] Dashboard carrega dados do Supabase
- [ ] Eventos em tempo real funcionam
- [ ] Alerta Vigia funciona
- [ ] Geração de PDF funciona
- [ ] PWA pode ser instalado
- [ ] Modo offline funciona

## 🐛 Troubleshooting

### Build Falha no Render

**Problema**: `npm install` falha
**Solução**: Verifique `package.json` e `engines`

**Problema**: `npm run build` falha
**Solução**: Teste localmente primeiro, verifique logs

### Página em Branco

**Problema**: Tela branca após deploy
**Solução**: 
1. Abra DevTools (F12)
2. Verifique console para erros
3. Confirme conexão com Supabase

### Dados Não Carregam

**Problema**: Eventos não aparecem
**Solução**:
1. Verifique RLS no Supabase
2. Confirme que tabelas existem
3. Verifique credenciais em `supabaseClient.ts`

### Rotas 404

**Problema**: Rotas retornam 404
**Solução**: Confirme que `public/_redirects` existe

## 📊 Monitoramento

Após deploy, monitore:

- **Logs**: Render Dashboard → Logs
- **Métricas**: Render Dashboard → Metrics
- **Uptime**: Status da aplicação
- **Bandwidth**: Uso de dados

## 🔄 Atualizações Futuras

Para atualizar o app:

```bash
# Fazer alterações no código
# Commit
git add .
git commit -m "Descrição da atualização"

# Push (deploy automático)
git push origin main
```

O Render detectará o push e fará deploy automático!

## 📱 Domínio Customizado (Opcional)

Para usar domínio próprio:

1. Render Dashboard → Settings → Custom Domain
2. Adicione seu domínio
3. Configure DNS conforme instruções

## 🎉 Deploy Completo!

Após completar todos os passos, seu aplicativo estará:

- ✅ Hospedado no Render.com
- ✅ Acessível via HTTPS
- ✅ Com deploy automático
- ✅ PWA instalável
- ✅ Conectado ao Supabase

---

**Suporte**: WhatsApp (11) 99803-7370
**Desenvolvido para**: DeltaNuvem - Sistema de Monitoramento 24h
