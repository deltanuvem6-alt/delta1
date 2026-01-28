# Script de Push Automático para GitHub - DeltaNuvem
# Repositório: https://github.com/Delta121314/DeltaNuvem.git

Write-Host "🚀 Push Automático para GitHub - DeltaNuvem" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se estamos em um repositório Git
if (-not (Test-Path .git)) {
    Write-Host "⚠️  Repositório Git não inicializado. Inicializando..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git inicializado" -ForegroundColor Green
}

# Configurar remote
Write-Host ""
Write-Host "🔗 Configurando remote do GitHub..." -ForegroundColor Cyan
$remotes = git remote
if ($remotes -contains "origin") {
    Write-Host "⚠️  Remote 'origin' já existe. Atualizando URL..." -ForegroundColor Yellow
    git remote set-url origin https://github.com/Delta121314/DeltaNuvem.git
} else {
    git remote add origin https://github.com/Delta121314/DeltaNuvem.git
}
Write-Host "✅ Remote configurado" -ForegroundColor Green

# Verificar remote
Write-Host ""
Write-Host "📋 Remote configurado:" -ForegroundColor Cyan
git remote -v

# Adicionar todos os arquivos
Write-Host ""
Write-Host "📦 Adicionando arquivos..." -ForegroundColor Cyan
git add .
Write-Host "✅ Arquivos adicionados" -ForegroundColor Green

# Verificar status
Write-Host ""
Write-Host "📊 Status do Git:" -ForegroundColor Cyan
git status --short

# Fazer commit
Write-Host ""
$commitMsg = Read-Host "💬 Mensagem do commit (Enter para usar padrão)"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "Preparar DeltaNuvem para deploy no Render.com"
}

git commit -m $commitMsg
Write-Host "✅ Commit realizado" -ForegroundColor Green

# Configurar branch main
Write-Host ""
Write-Host "🌿 Configurando branch main..." -ForegroundColor Cyan
git branch -M main
Write-Host "✅ Branch configurada" -ForegroundColor Green

# Push para GitHub
Write-Host ""
Write-Host "🚀 Fazendo push para GitHub..." -ForegroundColor Cyan
Write-Host "⚠️  Você precisará autenticar com GitHub" -ForegroundColor Yellow
Write-Host "   Use seu Personal Access Token como senha" -ForegroundColor Yellow
Write-Host ""

$pushResult = git push -u origin main 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "✅ PUSH REALIZADO COM SUCESSO!" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 Repositório: https://github.com/Delta121314/DeltaNuvem" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🚀 Próximo passo: Deploy no Render" -ForegroundColor Cyan
    Write-Host "   1. Acesse: https://dashboard.render.com/"
    Write-Host "   2. Clique em 'New +' → 'Static Site'"
    Write-Host "   3. Selecione: Delta121314/DeltaNuvem"
    Write-Host "   4. Configure conforme DEPLOY.md"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Red
    Write-Host "❌ ERRO NO PUSH" -ForegroundColor Red
    Write-Host "============================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possíveis soluções:" -ForegroundColor Yellow
    Write-Host "1. Verifique sua autenticação (use Personal Access Token)"
    Write-Host "2. Se o repositório já tiver conteúdo, execute:"
    Write-Host "   git pull origin main --allow-unrelated-histories"
    Write-Host "   git push -u origin main"
    Write-Host ""
    Write-Host "Consulte PUSH_GITHUB.md para mais detalhes"
    Write-Host ""
    Write-Host "Erro detalhado:" -ForegroundColor Red
    Write-Host $pushResult
}

Write-Host ""
Write-Host "Pressione qualquer tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
