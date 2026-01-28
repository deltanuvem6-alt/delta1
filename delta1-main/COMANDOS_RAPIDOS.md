# 🚀 Comandos Rápidos - Deploy DeltaNuvem

## ⚡ Deploy em 3 Comandos

```bash
# 1. Verificar se está tudo pronto
node verify-deploy.js

# 2. Commit e Push
git add . && git commit -m "Deploy DeltaNuvem no Render" && git push origin main

# 3. Acessar Render e criar Static Site
# https://dashboard.render.com/
```

---

## 🛠️ Comandos Úteis

### Desenvolvimento Local
```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

### Verificação
```bash
# Verificar requisitos de deploy
node verify-deploy.js

# Verificar status do Git
git status

# Ver último commit
git log -1
```

### Git
```bash
# Adicionar todos os arquivos
git add .

# Commit
git commit -m "Sua mensagem aqui"

# Push para repositório
git push origin main

# Ver branches
git branch

# Ver remote
git remote -v
```

### Build
```bash
# Build de produção
npm run build

# Limpar e rebuildar
rm -rf dist && npm run build

# Build e preview
npm run build && npm run preview
```

### Troubleshooting
```bash
# Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json && npm install

# Limpar cache do npm
npm cache clean --force

# Verificar versão do Node
node --version

# Verificar versão do npm
npm --version
```

---

## 🔗 Links Rápidos

- **Render Dashboard**: https://dashboard.render.com/
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Criar Static Site**: https://dashboard.render.com/select-repo?type=static

---

## 📝 Configuração Render (Copiar e Colar)

```
Name: deltanuvem
Branch: main
Build Command: npm install && npm run build
Publish Directory: dist
```

---

## ✅ Checklist Rápido

- [ ] `node verify-deploy.js` passou
- [ ] Build local funciona (`npm run build`)
- [ ] Código commitado no Git
- [ ] Push para repositório remoto
- [ ] Static Site criado no Render
- [ ] Deploy concluído com sucesso
- [ ] Aplicativo acessível via URL
- [ ] Testes básicos realizados

---

## 🎯 Próximo Passo

Execute:
```bash
node verify-deploy.js
```

Se tudo estiver ✅, faça:
```bash
git add . && git commit -m "Preparar para deploy" && git push origin main
```

Depois acesse: https://dashboard.render.com/

---

**Boa sorte com o deploy! 🚀**
