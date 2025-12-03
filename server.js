import express from 'express';
import cors from 'cors';
import sgMail from '@sendgrid/mail';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

// Carregar variáveis de ambiente
// No Render, as variáveis vêm do sistema (Environment Variables)
// Localmente, vêm do .env.local
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.local' });
}
dotenv.config(); // Fallback para .env padrão

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Iniciando servidor DeltaNuvem...');
console.log('📁 Diretório atual:', __dirname);

const app = express();
const port = process.env.PORT || 3001; // Porta 3001 para dev local, Render usa PORT do ambiente


console.log('🔌 Porta configurada:', port);
console.log('🌍 Variáveis de ambiente:', {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? '✅ Configurada' : '❌ Não configurada',
    EMAIL_FROM: process.env.EMAIL_FROM
});

// Configurar SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('✅ SendGrid configurado');
} else {
    console.warn('⚠️  AVISO: SENDGRID_API_KEY não encontrada nas variáveis de ambiente.');
}

app.use(cors());
app.use(express.json());

// Verificar se a pasta dist existe
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    console.log('✅ Pasta dist encontrada:', distPath);
    app.use(express.static(distPath));
} else {
    console.error('❌ ERRO: Pasta dist não encontrada!');
    console.log('Conteúdo do diretório:', fs.readdirSync(__dirname));
}

// Rota para envio de e-mail
app.post('/api/send-email', async (req, res) => {
    console.log('📨 Recebida requisição de envio de email');
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));

    const { to, subject, html } = req.body;

    if (!process.env.SENDGRID_API_KEY) {
        console.error('❌ ERRO: SENDGRID_API_KEY não configurada no servidor');
        return res.status(500).json({ error: 'Servidor não configurado com API Key do SendGrid.' });
    }

    if (!to || !subject || !html) {
        console.error('❌ ERRO: Campos obrigatórios faltando');
        return res.status(400).json({ error: 'Faltam campos obrigatórios (to, subject, html).' });
    }

    const msg = {
        to,
        from: process.env.EMAIL_FROM || 'deltanuvem1@gmail.com',
        subject,
        html,
    };

    console.log('📤 Tentando enviar para SendGrid:', { to: msg.to, from: msg.from, subject: msg.subject });

    try {
        const response = await sgMail.send(msg);
        console.log('✅ SendGrid respondeu com sucesso!');
        console.log('📊 Status Code:', response[0].statusCode);
        console.log('📝 Headers:', JSON.stringify(response[0].headers));
        res.status(200).json({ message: 'Email enviado com sucesso!' });
    } catch (error) {
        console.error('❌ Erro ao enviar email via SendGrid:', error);
        if (error.response) {
            console.error('🔍 Detalhes do erro SendGrid:', JSON.stringify(error.response.body, null, 2));
        }
        res.status(500).json({ error: 'Falha ao enviar email.', details: error.message });
    }
});

// Qualquer outra rota retorna o index.html (SPA)
app.get(/(.*)/, (req, res) => {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('App não encontrado. Verifique se o build foi executado corretamente.');
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Servidor rodando na porta ${port}`);
    console.log(`🌐 URL: http://localhost:${port}`);
}).on('error', (err) => {
    console.error('❌ Erro ao iniciar servidor:', err);
    process.exit(1);
});
