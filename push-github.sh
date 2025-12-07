#!/bin/bash

# Script de Push Automático para GitHub - DeltaNuvem
# Repositório: https://github.com/Delta121314/DeltaNuvem.git

echo "🚀 Push Automático para GitHub - DeltaNuvem"
echo "============================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se estamos em um repositório Git
if [ ! -d .git ]; then
    echo -e "${YELLOW}⚠️  Repositório Git não inicializado. Inicializando...${NC}"
    git init
    echo -e "${GREEN}✅ Git inicializado${NC}"
fi

# Configurar remote
echo ""
echo "🔗 Configurando remote do GitHub..."
if git remote | grep -q "origin"; then
    echo -e "${YELLOW}⚠️  Remote 'origin' já existe. Atualizando URL...${NC}"
    git remote set-url origin https://github.com/Delta121314/DeltaNuvem.git
else
    git remote add origin https://github.com/Delta121314/DeltaNuvem.git
fi
echo -e "${GREEN}✅ Remote configurado${NC}"

# Verificar remote
echo ""
echo "📋 Remote configurado:"
git remote -v

# Adicionar todos os arquivos
echo ""
echo "📦 Adicionando arquivos..."
git add .
echo -e "${GREEN}✅ Arquivos adicionados${NC}"

# Verificar status
echo ""
echo "📊 Status do Git:"
git status --short

# Fazer commit
echo ""
read -p "💬 Mensagem do commit (Enter para usar padrão): " COMMIT_MSG
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Preparar DeltaNuvem para deploy no Render.com"
fi

git commit -m "$COMMIT_MSG"
echo -e "${GREEN}✅ Commit realizado${NC}"

# Configurar branch main
echo ""
echo "🌿 Configurando branch main..."
git branch -M main
echo -e "${GREEN}✅ Branch configurada${NC}"

# Push para GitHub
echo ""
echo "🚀 Fazendo push para GitHub..."
echo -e "${YELLOW}⚠️  Você precisará autenticar com GitHub${NC}"
echo -e "${YELLOW}   Use seu Personal Access Token como senha${NC}"
echo ""

if git push -u origin main; then
    echo ""
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}✅ PUSH REALIZADO COM SUCESSO!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
    echo "🔗 Repositório: https://github.com/Delta121314/DeltaNuvem"
    echo ""
    echo "🚀 Próximo passo: Deploy no Render"
    echo "   1. Acesse: https://dashboard.render.com/"
    echo "   2. Clique em 'New +' → 'Static Site'"
    echo "   3. Selecione: Delta121314/DeltaNuvem"
    echo "   4. Configure conforme DEPLOY.md"
    echo ""
else
    echo ""
    echo -e "${RED}============================================${NC}"
    echo -e "${RED}❌ ERRO NO PUSH${NC}"
    echo -e "${RED}============================================${NC}"
    echo ""
    echo "Possíveis soluções:"
    echo "1. Verifique sua autenticação (use Personal Access Token)"
    echo "2. Se o repositório já tiver conteúdo, execute:"
    echo "   git pull origin main --allow-unrelated-histories"
    echo "   git push -u origin main"
    echo ""
    echo "Consulte PUSH_GITHUB.md para mais detalhes"
fi
