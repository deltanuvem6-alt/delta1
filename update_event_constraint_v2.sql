-- Script ALTERNATIVO para atualizar a constraint (versão forçada)
-- Execute este script se o primeiro não funcionou

-- 1. Remover TODAS as constraints de check da tabela
DO $$ 
DECLARE
    constraint_name text;
BEGIN
    FOR constraint_name IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'monitoring_events'::regclass 
        AND contype = 'c'
    LOOP
        EXECUTE 'ALTER TABLE monitoring_events DROP CONSTRAINT IF EXISTS ' || constraint_name;
    END LOOP;
END $$;

-- 2. Criar a nova constraint com o nome correto
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

-- 3. Verificar se foi criada corretamente
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'monitoring_events'::regclass 
AND conname = 'monitoring_events_type_check';

-- 4. Atualizar eventos antigos
UPDATE monitoring_events 
SET type = 'Sem Comunicação' 
WHERE type = 'Local sem Internet';
