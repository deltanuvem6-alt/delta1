@echo off
echo ========================================
echo   Configurar SendGrid API Key
echo ========================================
echo.
echo Passos:
echo 1. Acesse: https://app.sendgrid.com/settings/api_keys
echo 2. Clique em "Create API Key"
echo 3. Nome: DeltaNuvem-Local
echo 4. Permissoes: Full Access
echo 5. Clique em "Create & View"
echo 6. COPIE a chave completa (comeca com SG.)
echo.
echo ========================================
echo.
set /p SENDGRID_KEY="Cole a API Key aqui e pressione ENTER: "
echo.
echo Criando arquivo .env.local...
(
echo GEMINI_API_KEY=PLACEHOLDER_API_KEY
echo SENDGRID_API_KEY=%SENDGRID_KEY%
echo EMAIL_FROM=deltanuvem@1agmail.com
echo EMAIL_USER=apikey
) > .env.local
echo.
echo ✅ Arquivo .env.local atualizado!
echo.
echo Testando conexao com SendGrid...
echo.
node test-sendgrid.js
echo.
pause
