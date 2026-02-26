export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        // Em desenvolvimento local (Vite), precisamos garantir que a chamada vá para o servidor Express se estiverem rodando em portas diferentes.
        // Mas em produção (Render), o mesmo servidor serve ambos, então '/api/send-email' funciona.
        // Para dev local, recomenda-se configurar o proxy no vite.config.ts ou rodar o server.js.

        // Usamos caminho relativo para garantir que funcione em qualquer domínio ou subdomínio (com ou sem www)
        const API_URL = '/api/send-email';

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ to, subject, html }),
        });

        // Verificar se a resposta tem conteúdo antes de tentar fazer parse
        const contentType = response.headers.get('content-type');
        const hasJsonContent = contentType && contentType.includes('application/json');

        if (!response.ok) {
            // Tentar obter mensagem de erro
            let errorMessage = 'Falha ao enviar email';

            if (hasJsonContent) {
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.details || errorMessage;
                } catch (jsonError) {
                    console.error('Erro ao fazer parse do JSON de erro:', jsonError);
                }
            } else {
                // Se não for JSON, tentar obter como texto
                const errorText = await response.text();
                if (errorText) {
                    errorMessage = errorText;
                }
            }

            // Verificar se é erro de servidor não encontrado (desenvolvimento local)
            if (response.status === 404) {
                throw new Error('Servidor de email não encontrado. Certifique-se de que o server.js está rodando (npm start) ou que está em produção no Render.');
            }

            throw new Error(errorMessage);
        }

        // Verificar se a resposta de sucesso tem JSON
        if (hasJsonContent) {
            return await response.json();
        } else {
            // Se não retornou JSON mas foi sucesso, retornar objeto padrão
            return { message: 'Email enviado com sucesso!' };
        }
    } catch (error: any) {
        console.error('Erro no serviço de email:', error);

        // Melhorar mensagem de erro para o usuário
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            throw new Error('Não foi possível conectar ao servidor de email. Verifique sua conexão ou se o servidor está rodando.');
        }

        throw error;
    }
};
