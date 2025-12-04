import { sendEmail } from './emailService';

// Email do Admin para notificações administrativas
const ADMIN_EMAIL = 'deltanuvem1@gmail.com';

const generateEmailHtml = (title: string, details: Record<string, string>, footerNote?: string) => {
    const detailsHtml = Object.entries(details).map(([key, value]) => `
        <div style="margin-bottom: 12px;">
            <span style="font-weight: 600; color: #4b5563;">${key}:</span>
            <span style="color: #1f2937; margin-left: 8px;">${value}</span>
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
<body style="font-family: 'Inter', 'Segoe UI', Arial, sans-serif; background-color: #f4f4f7; margin: 0; padding: 0; color: #333;">
    <div style="background-color: #ffffff; margin: 30px auto; padding: 0; width: 100%; max-width: 600px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%); text-align: center; padding: 30px; border-bottom: 4px solid #1e40af;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                DeltaNuvem Tecnologia
            </h1>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
            <h2 style="margin: 0 0 25px; color: #1d4ed8; font-size: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">
                ${title}
            </h2>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; border-left: 4px solid #3b82f6;">
                ${detailsHtml}
            </div>

            <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                ${footerNote || 'Atenção: Email automático, Não Responda esse email.'}
            </p>
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

    await sendEmail(companyEmail, `DeltaNuvem - ${eventType}`, html);
};

export const sendAdminNotification = async (subject: string, details: Record<string, string>) => {
    const html = generateEmailHtml(subject, details);
    await sendEmail(ADMIN_EMAIL, `DeltaNuvem - ${subject}`, html);
};

export const sendCompanyNotification = async (companyEmail: string, subject: string, details: Record<string, string>) => {
    const html = generateEmailHtml(subject, details);
    await sendEmail(companyEmail, `DeltaNuvem - ${subject}`, html);
};
