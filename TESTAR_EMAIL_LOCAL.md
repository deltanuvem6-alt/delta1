# 🔧 Como Testar Email em Desenvolvimento Local

## ⚠️ Problema Identificado

O erro `"Failed to execute 'json' on 'Response': Unexpected end of JSON input"` acontece porque:
- O Vite (frontend) roda na porta **3000**
- O servidor Express (backend) precisa rodar na porta **3001**
- Sem o servidor rodando, a chamada `/api/send-email` falha

---

## ✅ Solução: Rodar Frontend e Backend Simultaneamente

### **Opção 1: Usar 2 Terminais (Recomendado)**

#### Terminal 1 - Backend (Servidor Express):
```bash
npm start
```
Isso inicia o `server.js` na porta **3001**

#### Terminal 2 - Frontend (Vite):
```bash
npm run dev
```
Isso inicia o Vite na porta **3000** com proxy para a porta 3001

---

### **Opção 2: Usar Concurrently (Automático)**

Instale o pacote:
```bash
npm install --save-dev concurrently
```

Adicione no `package.json`:
```json
"scripts": {
  "dev": "vite",
  "dev:full": "concurrently \"npm start\" \"npm run dev\"",
  "build": "vite build",
  "preview": "vite preview",
  "start": "node server.js"
}
```

Execute:
```bash
npm run dev:full
```

---

## 🌐 Como Funciona Agora

1. **Vite** (porta 3000) - Serve o frontend
2. **Express** (porta 3001) - Processa emails via SendGrid
3. **Proxy** - Vite redireciona `/api/*` para `http://localhost:3001`

---

## 🚀 Em Produção (Render.com)

**Não precisa fazer nada!** O Render:
- Executa `npm run build` (gera pasta `dist`)
- Executa `npm start` (servidor Express)
- O Express serve tanto o frontend (pasta `dist`) quanto a API (`/api/send-email`)
- Tudo roda na mesma porta definida pela variável `PORT` do Render

---

## 📝 Checklist de Variáveis de Ambiente

### **Desenvolvimento Local (.env.local)**
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=deltanuvem1@gmail.com
```

### **Produção (Render.com)**
Configurar no painel do Render:
- `SENDGRID_API_KEY` = Sua chave do SendGrid
- `EMAIL_FROM` = deltanuvem1@gmail.com

---

## 🧪 Testando o Email

1. Inicie o backend: `npm start`
2. Em outro terminal, inicie o frontend: `npm run dev`
3. Acesse: `http://localhost:3000`
4. Faça login como Admin
5. Clique em "Enviar Email Teste"
6. Digite um email válido
7. Verifique a caixa de entrada

---

## ❓ Troubleshooting

### Erro: "Servidor de email não encontrado"
- ✅ Certifique-se de que `npm start` está rodando
- ✅ Verifique se a porta 3001 está livre

### Erro: "SENDGRID_API_KEY não configurada"
- ✅ Crie arquivo `.env.local` na raiz do projeto
- ✅ Adicione `SENDGRID_API_KEY=SG.sua_chave_aqui`

### Email não chega
- ✅ Verifique se a API Key do SendGrid é válida
- ✅ Verifique se o email remetente está verificado no SendGrid
- ✅ Confira a pasta de spam

---

## 📦 Banco de Dados

**NÃO**, o envio de email **não precisa de tabela no banco de dados**!

O email é enviado diretamente via:
- Frontend → Backend (Express) → SendGrid → Destinatário

O banco de dados (Supabase) é usado apenas para:
- Empresas
- Postos de Serviço
- Eventos de Monitoramento
- Configurações do Alerta Vigia
