-- Script para atualizar a constraint do tipo de evento no Supabase
-- Execute este script no SQL Editor do seu projeto Supabase

-- 1. Remover a constraint antiga
ALTER TABLE monitoring_events 
DROP CONSTRAINT IF EXISTS monitoring_events_type_check;

-- 2. Criar nova constraint com o nome atualizado
ALTER TABLE monitoring_events 
ADD CONSTRAINT monitoring_events_type_check 
CHECK (type IN (
  'Portaria Online',
  'Portaria Offline',
  'Botão de Pânico',
  'Vigia Adormeceu',
  'Sistema Ativado',
  'Sistema Desativado',
  'Sem Comunicação'
));

-- 3. (Opcional) Atualizar eventos existentes com o nome antigo
UPDATE monitoring_events 
SET type = 'Sem Comunicação' 
WHERE type = 'Local sem Internet';
