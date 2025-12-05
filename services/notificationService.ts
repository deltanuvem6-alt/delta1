import { sendEmail } from './emailService';

// Email do Admin para notificações administrativas
const ADMIN_EMAIL = 'deltanuvem1@gmail.com';

const generateEmailHtml = (title: string, details: Record<string, string>, footerNote?: string) => {
    const detailsHtml = Object.entries(details).map(([key, value]) => `
        <tr>
            <td style="padding: 8px 0; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; line-height: 1.6;">
                <span style="font-weight: 600; color: #1f2937;">${key}:</span>
                <span style="color: #374151; margin-left: 4px;">${value}</span>
            </td>
        </tr>
    `).join('');

    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="pt-BR">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Arial, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table border="0" cellpadding="0" cellspacing="0" width="540" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); background-color: #1e3a8a; padding: 32px 24px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; font-family: 'Segoe UI', Arial, sans-serif;">
                                DeltaNuvem
                            </h1>
                            <p style="color: #e0e7ff; margin: 8px 0 0; font-size: 15px; font-weight: 400; font-family: 'Segoe UI', Arial, sans-serif;">
                                Tecnologia
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 32px 24px;">
                            <!-- Info Box -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb; border-left: 4px solid #3b82f6; border-radius: 6px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            ${detailsHtml}
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Footer Note -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                                <tr>
                                    <td style="padding: 0;">
                                        <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.5; font-family: 'Segoe UI', Arial, sans-serif;">
                                            <strong style="color: #991b1b;">Atenção:</strong> ${footerNote || 'Email automático, não responda esse email.'}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
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
