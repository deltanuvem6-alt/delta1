# 🔑 Configurar Autenticação do Git - Personal Access Token

**Problema:** Git não está autenticado para acessar repositórios privados do GitHub.

**Solução:** Criar e configurar um Personal Access Token.

---

## 📝 PASSO A PASSO (5 minutos)

### **1. Criar Personal Access Token no GitHub**

1. **Acesse:** https://github.com/settings/tokens

2. **Clique em:** "Generate new token" → "Generate new token (classic)"

3. **Preencha:**
   - **Note:** `Git CLI - PC Lenovo`
   - **Expiration:** 90 days (ou No expiration)
   - **Marque apenas:** ☑️ `repo` (Full control of private repositories)

4. **Clique em:** "Generate token"

5. **COPIE O TOKEN** (você só verá uma vez!)
   - Exemplo: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### **2. Configurar o Token no Git**

Execute estes comandos no PowerShell:

```powershell
cd "C:\Users\lenovo\Downloads\delta2-main (2)\delta1-main"

# Configurar credenciais
git config --global credential.helper manager-core

# Fazer push (vai pedir usuário e senha)
git push -u origin main
```

**Quando pedir:**
- **Username:** `deltasystem1`
- **Password:** Cole o token que você copiou (ghp_xxx...)

**PRONTO!** O Git vai salvar as credenciais e não vai pedir mais.

---

## ⚡ ALTERNATIVA RÁPIDA: Usar Token na URL

Se preferir não configurar, pode usar o token direto na URL:

```powershell
git remote set-url origin https://SEU_TOKEN@github.com/deltasystem1/alerta.git
git push -u origin main
```

Substitua `SEU_TOKEN` pelo token que você copiou.

---

## 🎯 DEPOIS DO PUSH

Seu código estará em: **https://github.com/deltasystem1/alerta**

Com todas as atualizações:
- ⚡ Monitoramento de energia
- 📧 Notificações por email  
- 📱 APK gerado
- 📚 Documentação completa

---

## 📞 Me Avise

Depois de criar o token, me passe ele que eu configuro e faço o push para você!

Ou me avise se preferir usar o GitHub Desktop (mais fácil).
