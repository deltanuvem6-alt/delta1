-- Script para atualizar a constraint de eventos para incluir monitoramento de energia
-- 1. Remover a constraint atual
ALTER TABLE monitoring_events 
DROP CONSTRAINT IF EXISTS monitoring_events_type_check;

-- 2. Criar nova constraint incluindo os novos eventos
ALTER TABLE monitoring_events 
ADD CONSTRAINT monitoring_events_type_check 
CHECK (type IN (
  'Portaria Online',
  'Portaria Offline',
  'Botão de Pânico',
  'Vigia Adormeceu',
  'Sistema Ativado',
  'Sistema Desativado',
  'Sem Comunicação',
  'Fonte Conectada',
  'Fonte Desconectada'
));
