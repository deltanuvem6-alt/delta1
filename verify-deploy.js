#!/usr/bin/env node

/**
 * Script de Verificação Pré-Deploy
 * Verifica se todos os requisitos para deploy no Render.com estão atendidos
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verificando requisitos para deploy no Render.com...\n');

let hasErrors = false;
let warnings = 0;

// Verificar arquivos essenciais
const requiredFiles = [
    'package.json',
    'vite.config.ts',
    'index.html',
    'App.tsx',
    'supabaseClient.ts',
    'render.yaml',
    '.node-version',
    'public/_redirects'
];

console.log('📁 Verificando arquivos essenciais:');
requiredFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, file));
    if (exists) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ❌ ${file} - FALTANDO!`);
        hasErrors = true;
    }
});

// Verificar package.json
console.log('\n📦 Verificando package.json:');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    if (packageJson.scripts && packageJson.scripts.build) {
        console.log('  ✅ Script "build" encontrado');
    } else {
        console.log('  ❌ Script "build" não encontrado!');
        hasErrors = true;
    }

    if (packageJson.engines) {
        console.log('  ✅ Engines especificados');
    } else {
        console.log('  ⚠️  Engines não especificados (recomendado)');
        warnings++;
    }

    const requiredDeps = ['react', 'react-dom', '@supabase/supabase-js'];
    requiredDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
            console.log(`  ✅ ${dep} instalado`);
        } else {
            console.log(`  ❌ ${dep} não encontrado!`);
            hasErrors = true;
        }
    });
} catch (error) {
    console.log('  ❌ Erro ao ler package.json:', error.message);
    hasErrors = true;
}

// Verificar supabaseClient.ts
console.log('\n🔌 Verificando configuração do Supabase:');
try {
    const supabaseClient = fs.readFileSync('supabaseClient.ts', 'utf8');

    if (supabaseClient.includes('supabaseUrl') && supabaseClient.includes('supabaseAnonKey')) {
        console.log('  ✅ Variáveis de configuração encontradas');
    } else {
        console.log('  ❌ Configuração do Supabase incompleta!');
        hasErrors = true;
    }

    if (supabaseClient.includes('https://') && supabaseClient.includes('.supabase.co')) {
        console.log('  ✅ URL do Supabase configurada');
    } else {
        console.log('  ⚠️  URL do Supabase pode não estar configurada corretamente');
        warnings++;
    }
} catch (error) {
    console.log('  ❌ Erro ao ler supabaseClient.ts:', error.message);
    hasErrors = true;
}

// Verificar render.yaml
console.log('\n⚙️  Verificando render.yaml:');
try {
    const renderYaml = fs.readFileSync('render.yaml', 'utf8');

    if (renderYaml.includes('type: web')) {
        console.log('  ✅ Tipo de serviço configurado');
    }

    if (renderYaml.includes('env: static')) {
        console.log('  ✅ Ambiente estático configurado');
    }

    if (renderYaml.includes('buildCommand')) {
        console.log('  ✅ Comando de build configurado');
    }

    if (renderYaml.includes('staticPublishPath')) {
        console.log('  ✅ Diretório de publicação configurado');
    }
} catch (error) {
    console.log('  ❌ Erro ao ler render.yaml:', error.message);
    hasErrors = true;
}

// Verificar .node-version
console.log('\n🟢 Verificando .node-version:');
try {
    const nodeVersion = fs.readFileSync('.node-version', 'utf8').trim();
    console.log(`  ✅ Versão do Node.js: ${nodeVersion}`);
} catch (error) {
    console.log('  ⚠️  .node-version não encontrado (usará versão padrão do Render)');
    warnings++;
}

// Verificar public/_redirects
console.log('\n🔀 Verificando redirects:');
try {
    const redirects = fs.readFileSync('public/_redirects', 'utf8');
    if (redirects.includes('/* /index.html 200')) {
        console.log('  ✅ Redirecionamento SPA configurado');
    } else {
        console.log('  ⚠️  Redirecionamento pode não estar configurado corretamente');
        warnings++;
    }
} catch (error) {
    console.log('  ❌ Erro ao ler public/_redirects:', error.message);
    hasErrors = true;
}

// Verificar se node_modules existe
console.log('\n📚 Verificando dependências:');
if (fs.existsSync('node_modules')) {
    console.log('  ✅ node_modules existe (dependências instaladas)');
} else {
    console.log('  ⚠️  node_modules não encontrado. Execute: npm install');
    warnings++;
}

// Verificar se dist existe (build foi executado)
console.log('\n🏗️  Verificando build:');
if (fs.existsSync('dist')) {
    console.log('  ✅ Pasta dist existe (build executado)');

    if (fs.existsSync('dist/index.html')) {
        console.log('  ✅ index.html gerado no build');
    } else {
        console.log('  ❌ index.html não encontrado no build!');
        hasErrors = true;
    }
} else {
    console.log('  ⚠️  Pasta dist não encontrada. Execute: npm run build');
    warnings++;
}

// Resumo final
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMO DA VERIFICAÇÃO');
console.log('='.repeat(60));

if (hasErrors) {
    console.log('❌ ERROS ENCONTRADOS! Corrija os problemas antes do deploy.');
    process.exit(1);
} else if (warnings > 0) {
    console.log(`⚠️  ${warnings} aviso(s) encontrado(s). Recomenda-se revisar.`);
    console.log('✅ Mas o deploy pode prosseguir.');
} else {
    console.log('✅ TUDO PRONTO PARA DEPLOY!');
    console.log('\n🚀 Próximos passos:');
    console.log('   1. git add .');
    console.log('   2. git commit -m "Preparar para deploy"');
    console.log('   3. git push origin main');
    console.log('   4. Criar Static Site no Render.com');
    console.log('\n📖 Consulte DEPLOY.md para instruções detalhadas.');
}

console.log('='.repeat(60) + '\n');
