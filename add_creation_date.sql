-- SCRIPT PARA ADICIONAR DATA DE CRIAÇÃO AUTOMÁTICA NAS TABELAS
-- DeltaNuvem - Supervisor Digital

-- 1. ADICIONAR COLUNA created_at NA TABELA DE EMPRESAS (Se não existir)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='created_at') THEN
        ALTER TABLE companies ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
    END IF;
END $$;

-- 2. ADICIONAR COLUNA created_at NA TABELA DE POSTOS (Se não existir)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service_posts' AND column_name='created_at') THEN
        ALTER TABLE service_posts ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
    END IF;
END $$;

-- 3. GARANTIR QUE OS DADOS ANTIGOS TENHAM UMA DATA (OPCIONAL)
UPDATE companies SET created_at = now() WHERE created_at IS NULL;
UPDATE service_posts SET created_at = now() WHERE created_at IS NULL;
