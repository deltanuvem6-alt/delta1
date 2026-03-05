import smtplib
import ssl
import os
from email.message import EmailMessage
from dotenv import load_dotenv

# Carregar variáveis de ambiente do arquivo .env
# Certifique-se de criar um arquivo .env baseado no .env.example
load_dotenv()

def enviar_email():
    # 1. Obter configurações
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = os.getenv("SMTP_PORT")
    sender_email = os.getenv("SMTP_USERNAME")
    password = os.getenv("SMTP_PASSWORD")
    recipient_email = os.getenv("EMAIL_TO")

    # Verificação básica se as configurações existem
    if not all([smtp_server, smtp_port, sender_email, password, recipient_email]):
        print("ERRO: Faltam configurações no arquivo .env!")
        print("Verifique se configurou: SMTP_SERVER, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD e EMAIL_TO")
        return

    # 2. Criar a mensagem
    msg = EmailMessage()
    msg['Subject'] = "Teste de Envio de E-mail via Python"
    msg['From'] = sender_email
    msg['To'] = recipient_email
    
    # Conteúdo do corpo do e-mail
    msg.set_content("""\
Olá!

Este é um e-mail de teste enviado através do seu novo aplicativo Python usando SMTP.

Se você está lendo isso, a configuração funcionou perfeitamente!

Atenciosamente,
Seu App Python
""")

    # 3. Conectar ao servidor e enviar
    context = ssl.create_default_context()

    print(f"Tentando conectar a {smtp_server}:{smtp_port}...")

    try:
        # Usando SMTP_SSL (geralmente porta 465)
        # Se seu servidor usar TLS (porta 587), a lógica seria um pouco diferente (starttls)
        with smtplib.SMTP_SSL(smtp_server, int(smtp_port), context=context) as server:
            print("Login no servidor SMTP...")
            server.login(sender_email, password)
            
            print("Enviando e-mail...")
            server.send_message(msg)
            
            print("✅ E-mail enviado com sucesso!")

    except Exception as e:
        print(f"❌ Falha ao enviar e-mail: {e}")

if __name__ == "__main__":
    print("--- Iniciando App de Envio de E-mail ---")
    enviar_email()
