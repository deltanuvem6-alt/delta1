# 🚀 Publicar no Repositório Existente (deltanuvem)

Parece que há um conflito de usuários no seu terminal (está logado como `deltasystem1`, mas o repositório é do `Delta121314`).

A maneira mais fácil de resolver e enviar o código é usando o **GitHub Desktop**.

## Passo a Passo no GitHub Desktop

1. **Abra o GitHub Desktop**.
2. Vá em **File** > **Add Local Repository**.
3. Selecione a pasta: `C:\Users\lenovo\Downloads\delta.v3`
4. Clique em **Add Repository**.
5. O GitHub Desktop vai detectar que já existe um repositório configurado.
6. Clique em **Push origin** (botão na barra superior).

### Se der erro de autenticação no GitHub Desktop:
1. Vá em **File** > **Options** > **Accounts**.
2. Verifique se está logado como **Delta121314**.
3. Se não estiver, faça **Sign out** e entre com a conta correta.

---

## Alternativa via Terminal (Avançado)

Se você realmente quiser usar o terminal, precisará remover as credenciais antigas do Windows:
1. Abra o Menu Iniciar e digite "Gerenciador de Credenciais".
2. Vá em "Credenciais do Windows".
3. Procure por `git:https://github.com` e remova.
4. Tente o push novamente e insira as credenciais do `Delta121314`.
