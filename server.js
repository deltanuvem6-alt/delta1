import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente
dotenv.config();

// Forçar o fuso horário de Brasília (America/Sao_Paulo)
process.env.TZ = 'America/Sao_Paulo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 [SISTEMA] Iniciando servidor DeltaNuvem...');
console.log('📅 [SISTEMA] Horário atual:', new Date().toLocaleString('pt-BR'));

// Inicializar cliente Supabase no servidor
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

const app = express();
const port = process.env.PORT || 3001;

// Configuração do Transportador SMTP (Hostinger)
const smtpConfig = {
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
        user: process.env.SMTP_USER || 'alerta@deltanuvem.com',
        pass: process.env.SMTP_PASS || 'Dvr@121314',
    },
    tls: {
        rejectUnauthorized: false
    }
};

console.log(`📧 [SMTP] Configurando host: ${smtpConfig.host}:${smtpConfig.port} (SSL: ${smtpConfig.secure})`);

const transporter = nodemailer.createTransport(smtpConfig);

// Template de Email
const generateEmailHtml = (title, details) => {
    const detailsHtml = Object.entries(details).map(([key, value]) => `
        <tr>
            <td style="padding: 8px 0; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; line-height: 1.6;">
                <span style="font-weight: 600; color: #1f2937;">${key}:</span>
                <span style="color: #374151; margin-left: 4px;">${value}</span>
            </td>
        </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Arial, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="540" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); background-color: #1e3a8a; padding: 32px 24px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">DeltaNuvem</h1>
                            <p style="color: #e0e7ff; margin: 8px 0 0; font-size: 15px;">Tecnologia em Segurança</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 32px 24px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb; border-left: 4px solid #3b82f6; border-radius: 6px;">
                                <tr><td style="padding: 20px;"><table border="0" cellpadding="0" cellspacing="0" width="100%">${detailsHtml}</table></td></tr>
                            </table>
                            <p style="margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 20px; color: #6b7280; font-size: 13px;">
                                <strong style="color: #991b1b;">Atenção:</strong> Email automático, por favor não responda.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
};

// Robô de Verificação Automática de E-mails
const checkAndSendEmails = async () => {
    try {
        const notifyTypes = [
            'Botão de Pânico',
            'Vigia Adormeceu',
            'Sem Comunicação',
            'Fonte Desconectada',
            'Fonte Conectada',
            'Portaria Online',
            'Portaria Offline',
            'Sistema Ativado',
            'Sistema Desativado'
        ];

        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

        const { data: events, error: eventError } = await supabase
            .from('monitoring_events')
            .select('*, service_posts(*, companies(*))')
            .eq('notified', false)
            .in('type', notifyTypes)
            .gt('timestamp', fiveMinutesAgo)
            .limit(5);

        if (eventError) {
            console.error('❌ [ROBÔ] Erro ao buscar eventos do Supabase:', eventError.message);
            return;
        }

        if (events && events.length > 0) {
            console.log(`🔍 [ROBÔ] Processando ${events.length} novos eventos...`);
        }

        for (const event of (events || [])) {
            const company = event.service_posts?.companies;
            if (!company?.email) {
                console.log(`⚠️ [ROBÔ] Evento ${event.id} sem e-mail de destino para a empresa do posto ${event.service_posts?.name}`);
                await supabase.from('monitoring_events').update({ notified: true }).eq('id', event.id);
                continue;
            }

            const timestamp = new Date(event.timestamp);
            const html = generateEmailHtml('Alerta de Segurança', {
                'Posto': event.service_posts.name,
                'Empresa': company.name,
                'Evento': event.type,
                'Data': timestamp.toLocaleString('pt-BR'),
            });

            console.log(`📧 [ROBÔ] Enviando e-mail: [${event.type}] para [${company.email}]`);

            try {
                await transporter.sendMail({
                    from: `"DeltaNuvem Alertas" <${smtpConfig.auth.user}>`,
                    to: company.email,
                    subject: `ALERTA: ${event.type} no posto ${event.service_posts.name}`,
                    html
                });
                await supabase.from('monitoring_events').update({ notified: true }).eq('id', event.id);
                console.log(`✅ [ROBÔ] E-mail enviado com sucesso: ${event.id}`);
            } catch (mailError) {
                console.error(`❌ [ROBÔ] Falha ao enviar e-mail para ${company.email}:`, mailError.message);
            }
        }
    } catch (err) {
        console.error('❌ [ROBÔ] Erro inesperado:', err.message);
    }
};

// Iniciar o robô a cada 15 segundos
setInterval(checkAndSendEmails, 15000);

// Verificar conexão SMTP na inicialização
console.log('⏳ [SMTP] Verificando conexão...');
transporter.verify((error) => {
    if (error) {
        console.error('❌ [SMTP] Erro na configuração:', error.message);
        console.error('ℹ️ [SMTP] Verifique se as credenciais no .env estão corretas.');
    } else {
        console.log('✅ [SMTP] Conexão estabelecida com sucesso!');
    }
});

app.use(cors());
app.use(express.json());

const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    console.log('📁 [SISTEMA] Pasta dist encontrada. Servindo arquivos estáticos.');
    app.use(express.static(distPath));
}

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Rota manual
app.post('/api/send-email', async (req, res) => {
    const { to, subject, html } = req.body;
    console.log(`📩 [API] Solicitação de envio manual para: ${to}`);

    if (!to || !subject || !html) {
        console.log('⚠️ [API] Campos obrigatórios ausentes.');
        return res.status(400).json({ error: 'Faltam campos.' });
    }

    try {
        await transporter.sendMail({
            from: `"Alerta Vigia" <${smtpConfig.auth.user}>`,
            to,
            subject,
            html
        });
        console.log(`✅ [API] E-mail manual enviado para ${to}`);
        res.status(200).json({ message: 'OK' });
    } catch (error) {
        console.error(`❌ [API] Erro no envio manual:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get(/(.*)/, (req, res) => {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    if (fs.existsSync(indexPath)) res.sendFile(indexPath);
    else res.status(404).send('Not Found');
});

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 [SISTEMA] Servidor ativo na porta ${port}`);
    console.log(`🔗 [SISTEMA] URL Local: http://localhost:${port}`);
});
