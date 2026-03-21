
import React from 'react';

const emailContainerStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  backgroundColor: '#f4f4f7',
  margin: '0',
  padding: '0',
  color: '#333',
};

const mainStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '30px auto',
  padding: '30px',
  width: '100%',
  maxWidth: '600px',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  paddingBottom: '20px',
  borderBottom: '1px solid #e0e0e0',
};

const contentStyle: React.CSSProperties = {
  padding: '30px 0',
  lineHeight: '1.6',
  fontSize: '16px',
};

const buttonStyle: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#1d4ed8',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 'bold',
  marginTop: '20px',
};

const footerStyle: React.CSSProperties = {
  textAlign: 'center',
  paddingTop: '20px',
  borderTop: '1px solid #e0e0e0',
  fontSize: '14px',
  color: '#888',
};

export const WelcomeEmail: React.FC<{ companyName: string; username: string }> = ({ companyName, username }) => (
  <div style={emailContainerStyle}>
    <div style={mainStyle}>
      <div style={headerStyle}>
        <h1 style={{ color: '#1d4ed8', margin: '0' }}>Bem-vindo ao Supervisor Digital!</h1>
        <p style={{ color: '#555', fontSize: '14px', margin: '5px 0 0' }}>DeltaNuvem Tecnologia</p>
      </div>
      <div style={contentStyle}>
        <p>Olá {companyName},</p>
        <p>Sua conta na plataforma <strong>Alert Vigia — Supervisor Digital</strong> foi criada com sucesso. Estamos felizes em ter você a bordo para revolucionar o monitoramento de segurança.</p>
        <p>Seu nome de usuário é: <strong>{username}</strong></p>
        <p>Para começar, acesse a plataforma através do botão abaixo:</p>
        <a href="#" style={buttonStyle}>Acessar Plataforma</a>
      </div>
      <div style={footerStyle}>
        <p>Precisa de ajuda? Entre em contato conosco.</p>
        <p><strong>Support WhatsApp: (11) 99803-7370</strong></p>
        <p style={{ fontSize: '12px' }}>&copy; {new Date().getFullYear()} DeltaNuvem Tecnologia. Todos os direitos reservados.</p>
      </div>
    </div>
  </div>
);

export const NewCompanyAdminNotificationEmail: React.FC<{ companyName: string; cnpj: string; email: string }> = ({ companyName, cnpj, email }) => (
  <div style={emailContainerStyle}>
    <div style={mainStyle}>
      <div style={headerStyle}>
        <h1 style={{ color: '#1d4ed8', margin: '0' }}>Nova Empresa Registrada</h1>
      </div>
      <div style={contentStyle}>
        <p>Olá Administrador,</p>
        <p>Uma nova empresa foi registrada na plataforma <strong>Supervisor Digital</strong>.</p>
        <p><strong>Detalhes da Empresa:</strong></p>
        <ul style={{ listStyleType: 'none', padding: '0', margin: '10px 0' }}>
          <li style={{ marginBottom: '5px' }}><strong>Nome:</strong> {companyName}</li>
          <li style={{ marginBottom: '5px' }}><strong>CNPJ:</strong> {cnpj}</li>
          <li><strong>Email:</strong> {email}</li>
        </ul>
        <p>Você pode gerenciar esta empresa no painel de administração.</p>
      </div>
      <div style={footerStyle}>
        <p>Este é um email de notificação automático.</p>
      </div>
    </div>
  </div>
);

export const NewPostRegisteredEmail: React.FC<{ companyName: string; postName: string; location: string }> = ({ companyName, postName, location }) => (
  <div style={emailContainerStyle}>
    <div style={mainStyle}>
      <div style={headerStyle}>
        <h1 style={{ color: '#1d4ed8', margin: '0' }}>Novo Posto de Serviço Registrado</h1>
      </div>
      <div style={contentStyle}>
        <p>Olá {companyName},</p>
        <p>Um novo posto de serviço foi registrado com sucesso para sua empresa.</p>
        <p><strong>Detalhes do Posto:</strong></p>
        <ul style={{ listStyleType: 'none', padding: '0', margin: '10px 0' }}>
          <li style={{ marginBottom: '5px' }}><strong>Nome do Posto:</strong> {postName}</li>
          <li style={{ marginBottom: '5px' }}><strong>Localização:</strong> {location}</li>
          <li><strong>Data/Hora do Registro:</strong> {new Date().toLocaleString('pt-BR')}</li>
        </ul>
        <p>O monitoramento para este posto já está ativo.</p>
        <a href="#" style={buttonStyle}>Ver Meus Postos</a>
      </div>
      <div style={footerStyle}>
         <p><strong>Support WhatsApp: (11) 99803-7370</strong></p>
         <p style={{ fontSize: '12px' }}>&copy; {new Date().getFullYear()} DeltaNuvem Tecnologia.</p>
      </div>
    </div>
  </div>
);