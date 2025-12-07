-- ============================================
-- Script SQL para Habilitar Realtime no Supabase
-- Tabela: service_posts
-- Data: 05/12/2025
-- ============================================

-- 1. Verificar se a publicação 'supabase_realtime' existe
-- (Normalmente já existe por padrão no Supabase)

-- 2. Adicionar a tabela service_posts à publicação realtime
-- Isso permite que as mudanças na tabela sejam transmitidas em tempo real
ALTER PUBLICATION supabase_realtime ADD TABLE service_posts;

-- 3. Verificar se foi adicionado corretamente
-- Execute esta query para confirmar:
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- ============================================
-- IMPORTANTE: Execute este script no SQL Editor do Supabase
-- ============================================
-- 
-- Passo a Passo:
-- 1. Acesse: https://supabase.com/dashboard/project/hrubgwggnnxyqeomhhyc/sql/new
-- 2. Cole este script
-- 3. Clique em "Run" ou pressione Ctrl+Enter
-- 4. Verifique se apareceu "Success. No rows returned"
-- 
-- Alternativamente, você pode habilitar via interface:
-- 1. Acesse: https://supabase.com/dashboard/project/hrubgwggnnxyqeomhhyc/database/replication
-- 2. Procure pela tabela "service_posts"
-- 3. Clique no toggle "Enable Realtime"
-- 
-- ============================================
