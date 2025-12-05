import { sendEmail } from './emailService';

// Email do Admin para notificações administrativas
const ADMIN_EMAIL = 'deltanuvem1@gmail.com';

const generateEmailHtml = (title: string, details: Record<string, string>, footerNote?: string) => {
    const detailsHtml = Object.entries(details).map(([key, value]) => `
        <div style="margin-bottom: 16px; line-height: 1.6;">
            <span style="font-weight: 600; color: #1f2937; font-size: 14px;">${key}:</span>
            <span style="color: #374151; margin-left: 4px; font-size: 14px;">${value}</span>
        </div>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0;">
    <div style="background-color: #ffffff; margin: 40px auto; padding: 0; width: 100%; max-width: 540px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); text-align: center; padding: 32px 24px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                DeltaNuvem
            </h1>
            <p style="color: #e0e7ff; margin: 8px 0 0; font-size: 15px; font-weight: 400;">
                Tecnologia
            </p>
        </div>

        <!-- Content -->
        <div style="padding: 32px 24px;">
            <div style="border-left: 4px solid #3b82f6; padding-left: 20px; background-color: #f9fafb; padding: 20px; border-radius: 6px;">
                ${detailsHtml}
            </div>

            <!-- Footer Note -->
            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: left; line-height: 1.5;">
                    <strong style="color: #991b1b;">Atenção:</strong> ${footerNote || 'Email automático, não responda esse email.'}
                </p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

export const sendEventNotification = async (
    companyEmail: string,
    companyName: string,
    postName: string,
    eventType: string,
    timestamp: Date
) => {
    console.log(`📧 [EMAIL] Preparando notificação de evento:`);
    console.log(`   → Para: ${companyEmail}`);
    console.log(`   → Empresa: ${companyName}`);
    console.log(`   → Posto: ${postName}`);
    console.log(`   → Evento: ${eventType}`);

    const dateStr = timestamp.toLocaleDateString('pt-BR');
    const timeStr = timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const html = generateEmailHtml(
        'Alerta Vigia Digital',
        {
            'Empresa': companyName,
            'Posto de serviço': postName,
            'Evento': eventType,
            'Data': dateStr,
            'Horário': timeStr
        }
    );

    try {
        await sendEmail(companyEmail, `DeltaNuvem - ${eventType}`, html);
        console.log(`✅ [EMAIL] Notificação enviada com sucesso para ${companyEmail}`);
    } catch (error) {
        console.error(`❌ [EMAIL] Falha ao enviar para ${companyEmail}:`, error);
        throw error;
    }
};

export const sendAdminNotification = async (subject: string, details: Record<string, string>) => {
    const html = generateEmailHtml(subject, details);
    await sendEmail(ADMIN_EMAIL, `DeltaNuvem - ${subject}`, html);
};

export const sendCompanyNotification = async (companyEmail: string, subject: string, details: Record<string, string>) => {
    const html = generateEmailHtml(subject, details);
    await sendEmail(companyEmail, `DeltaNuvem - ${subject}`, html);
};
