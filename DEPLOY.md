# Deploy DeltaNuvem no Render.com

## 📋 Pré-requisitos

1. Conta no [Render.com](https://render.com)
2. Repositório Git com o código (GitHub, GitLab ou Bitbucket)
3. Projeto Supabase configurado e ativo

## 🚀 Passos para Deploy

### 1. Preparar o Repositório

Certifique-se de que todos os arquivos estão commitados:

```bash
git add .
git commit -m "Preparar para deploy no Render"
git push origin main
```

### 2. Criar Novo Static Site no Render

1. Acesse [Render Dashboard](https://dashboard.render.com/)
2. Clique em **"New +"** → **"Static Site"**
3. Conecte seu repositório Git
4. Configure as seguintes opções:

#### Configurações Básicas:
- **Name**: `deltanuvem` (ou nome de sua preferência)
- **Branch**: `main` (ou sua branch principal)
- **Root Directory**: deixe vazio
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

#### Configurações Avançadas:
- **Auto-Deploy**: Yes (deploy automático em cada push)

### 3. Variáveis de Ambiente (se necessário)

Se você precisar de variáveis de ambiente no build, adicione em **Environment**:

```
GEMINI_API_KEY=sua_chave_aqui
```

**Nota**: Como o Supabase está configurado diretamente no código (`supabaseClient.ts`), não é necessário adicionar variáveis de ambiente para ele.

### 4. Deploy

Clique em **"Create Static Site"** e aguarde o build completar.

O Render irá:
1. Clonar o repositório
2. Instalar dependências (`npm install`)
3. Executar o build (`npm run build`)
4. Publicar a pasta `dist`

### 5. Acessar o Aplicativo

Após o deploy, você receberá uma URL como:
```
https://deltanuvem.onrender.com
```

## 🔧 Configurações Importantes

### Redirecionamentos SPA

O arquivo `public/_redirects` já está configurado para garantir que o React Router funcione corretamente:

```
/* /index.html 200
```

### Versão do Node.js

A versão do Node.js está especificada em `.node-version`:
```
18.18.0
```

### Configuração do Render

O arquivo `render.yaml` contém a configuração completa do serviço.

## 🔄 Atualizações Automáticas

Sempre que você fizer push para a branch configurada, o Render irá:
1. Detectar as mudanças
2. Executar novo build automaticamente
3. Publicar a nova versão

## 🐛 Troubleshooting

### Build Falha

1. Verifique os logs no Render Dashboard
2. Certifique-se de que `npm run build` funciona localmente
3. Verifique se todas as dependências estão no `package.json`

### Página em Branco

1. Verifique o console do navegador para erros
2. Confirme que o Supabase está acessível
3. Verifique as credenciais do Supabase em `supabaseClient.ts`

### Rotas não Funcionam

1. Confirme que `public/_redirects` existe
2. Verifique se o arquivo foi incluído no build

## 📊 Monitoramento

- **Logs**: Disponíveis no Render Dashboard
- **Status**: Monitore uptime e performance
- **Metrics**: Visualize uso de banda e requests

## 🔒 Segurança

- As credenciais do Supabase (anon key) são seguras para exposição pública
- RLS (Row Level Security) deve estar ativado no Supabase
- Nunca exponha chaves privadas ou service_role keys

## 📱 PWA

O aplicativo é um PWA e pode ser instalado em dispositivos móveis diretamente da URL do Render.

## 🆘 Suporte

- Render Docs: https://render.com/docs/static-sites
- Supabase Docs: https://supabase.com/docs
- WhatsApp Suporte: (11) 99803-7370

---

**Desenvolvido com ❤️ para DeltaNuvem**
