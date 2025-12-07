# 🚀 Como Rodar o Aplicativo Localmente

**Última atualização:** 06/12/2025 - 12:00

---

## ✅ Pré-requisitos

Certifique-se de que você tem:
- ✅ Node.js instalado (versão 18 ou superior)
- ✅ npm instalado (versão 9 ou superior)
- ✅ Arquivo `.env.local` configurado com as credenciais do Supabase

---

## 📋 Passo a Passo

### 1️⃣ Abrir Terminal no Projeto

Abra o PowerShell ou CMD na pasta do projeto:
```
C:\Users\lenovo\Downloads\delta.v3
```

---

### 2️⃣ Instalar Dependências (se necessário)

Se for a primeira vez ou se atualizou o `package.json`:

```powershell
npm install
```

---

### 3️⃣ Rodar o Servidor de Desenvolvimento

Execute o comando:

```powershell
npm run dev
```

---

### 4️⃣ Abrir no Navegador

O Vite vai exibir algo como:

```
  VITE v6.2.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Abra o navegador em:** `http://localhost:5173/`

---

## 🧪 Como Testar a Alteração "Sem Comunicação"

### **Teste 1: Falta de Ativação (3 minutos)**

1. **Faça login como Admin:**
   - Username: `admin`
   - Password: (sua senha de admin)

2. **Vá em "Postos de Serviço"**

3. **Clique no ícone ⚙️ (Configurações) de um posto**

4. **Configure o horário de ativação:**
   - **Ativação:** `12:05` (daqui a 5 minutos, por exemplo)
   - **Desativação:** `18:00` (qualquer horário futuro)
   - Clique em **Salvar**

5. **NÃO faça login no Alerta Vigia**

6. **Aguarde até 12:08** (5 min até ativação + 3 min de tolerância)

7. **Vá na aba "Monitoramento"**
   - Deve aparecer o evento **"Sem Comunicação"** às 12:08

---

### **Teste 2: Falta de Desativação (3 minutos)**

1. **Configure o horário de desativação:**
   - **Ativação:** `12:00` (agora ou já passou)
   - **Desativação:** `12:05` (daqui a 5 minutos)
   - Clique em **Salvar**

2. **Vá em "Alerta Vigia"**
   - Digite o ID do posto e senha
   - Faça login (isso ativa o posto)

3. **Aguarde até 12:08** (5 min até desativação + 3 min de tolerância)

4. **NÃO clique em "Sair"** (deixe o posto ativo)

5. **Abra outra aba** e vá em "Monitoramento"
   - Deve aparecer o evento **"Sem Comunicação"** às 12:08

---

## 🔍 Verificar Logs no Console

Abra o **Console do Navegador** (F12) e procure por mensagens como:

```
[CHECK] Posto [Nome]: Não ativou no horário programado (12:05). Gerando alerta.
```

ou

```
[CHECK] Posto [Nome]: Não desativou no horário programado (12:05). Gerando alerta.
```

---

## ⚙️ Verificar Configurações do Supabase

Certifique-se de que o arquivo `.env.local` está configurado:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

---

## 🛑 Parar o Servidor

Para parar o servidor de desenvolvimento:
- Pressione `Ctrl + C` no terminal

---

## 📊 Monitorar em Tempo Real

O sistema verifica os postos **a cada 1 minuto**. Você pode acompanhar:

1. **Console do Navegador (F12):**
   - Logs de verificação
   - Eventos gerados

2. **Aba Monitoramento:**
   - Eventos aparecem em tempo real
   - Som de alerta toca automaticamente

3. **Supabase Dashboard:**
   - Veja os eventos sendo inseridos na tabela `monitoring_events`

---

## ✅ Checklist de Teste

- [ ] Servidor rodando em `http://localhost:5173/`
- [ ] Login como admin funcionando
- [ ] Configuração de horários salvando
- [ ] Evento "Sem Comunicação" aparecendo após 3 min de ativação
- [ ] Evento "Sem Comunicação" aparecendo após 3 min de desativação
- [ ] Som de alerta tocando
- [ ] Email sendo enviado (se configurado)

---

## 🆘 Problemas Comuns

### Erro: "Cannot find module"
```powershell
npm install
```

### Erro: "Port 5173 already in use"
```powershell
# Mude a porta no vite.config.ts ou mate o processo
netstat -ano | findstr :5173
taskkill /PID [número_do_processo] /F
```

### Eventos não aparecem
- Verifique se o horário está correto
- Verifique se o posto tem configuração salva
- Verifique o console do navegador (F12)

---

## 📞 Suporte

**WhatsApp:** (11) 99803-7370  
**Email:** deltanuvem1@gmail.com

---

**Desenvolvido por:** DeltaNuvem Tecnologia
