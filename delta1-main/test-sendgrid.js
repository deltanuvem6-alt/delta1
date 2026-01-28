import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

console.log('🔍 Diagnóstico do SendGrid\n');
console.log('📋 Variáveis de Ambiente:');
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? `${process.env.SENDGRID_API_KEY.substring(0, 10)}...` : '❌ NÃO CONFIGURADA');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || '❌ NÃO CONFIGURADA');
console.log('\n');

if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ ERRO: SENDGRID_API_KEY não está configurada!');
    console.log('\n📝 Crie um arquivo .env.local na raiz do projeto com:');
    console.log('SENDGRID_API_KEY=SG.sua_chave_aqui');
    console.log('EMAIL_FROM=deltanuvem1@gmail.com');
    process.exit(1);
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const testEmail = {
    to: 'alertav1@hotmail.com', // Email do teste que você fez
    from: process.env.EMAIL_FROM || 'deltanuvem1@gmail.com',
    subject: '🧪 Teste de Diagnóstico - DeltaNuvem',
    html: `
        <h1>Teste de Email</h1>
        <p>Se você recebeu este email, o SendGrid está funcionando corretamente!</p>
        <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
    `
};

console.log('📧 Tentando enviar email de teste...');
console.log('De:', testEmail.from);
console.log('Para:', testEmail.to);
console.log('Assunto:', testEmail.subject);
console.log('\n');

sgMail.send(testEmail)
    .then((response) => {
        console.log('✅ Email enviado com sucesso!');
        console.log('\n📊 Detalhes da Resposta:');
        console.log('Status Code:', response[0].statusCode);
        console.log('Headers:', JSON.stringify(response[0].headers, null, 2));
        console.log('\n✉️ Verifique sua caixa de entrada (e spam) em:', testEmail.to);
    })
    .catch((error) => {
        console.error('❌ ERRO ao enviar email:');
        console.error('\n📋 Detalhes do Erro:');
        console.error('Mensagem:', error.message);

        if (error.response) {
            console.error('\n🔍 Resposta do SendGrid:');
            console.error('Status Code:', error.response.statusCode);
            console.error('Body:', JSON.stringify(error.response.body, null, 2));

            // Analisar erros comuns
            if (error.response.body.errors) {
                console.error('\n⚠️ Erros Específicos:');
                error.response.body.errors.forEach((err, index) => {
                    console.error(`${index + 1}. ${err.message}`);
                    if (err.field) console.error(`   Campo: ${err.field}`);
                    if (err.help) console.error(`   Ajuda: ${err.help}`);
                });
            }
        }

        console.error('\n💡 Possíveis Causas:');
        console.error('1. API Key inválida ou expirada');
        console.error('2. Email remetente não verificado no SendGrid');
        console.error('3. Conta SendGrid suspensa ou limitada');
        console.error('4. Formato de email inválido');

        process.exit(1);
    });
