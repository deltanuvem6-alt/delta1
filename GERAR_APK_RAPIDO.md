# 🚀 Gerar APK - Guia Rápido (Android Studio)

**Data:** 11/12/2025  
**Tempo estimado:** 5-10 minutos

---

## ✅ **Preparação Concluída**

Tudo já está pronto! Eu já fiz:
- ✅ `npm install` - Dependências instaladas
- ✅ `npm run build` - Projeto compilado
- ✅ `npx cap sync android` - Sincronizado com Capacitor
- ✅ Plugin `@capacitor/device@6.0.3` instalado

---

## 📱 **Passos para Gerar o APK**

### **1. Abrir o Projeto no Android Studio**

```
1. Abra o Android Studio
2. Clique em "Open"
3. Navegue até:
   C:\Users\lenovo\Downloads\delta2-main (2)\delta1-main\android
4. Clique em "OK"
```

### **2. Aguardar Gradle Sync**

```
- O Android Studio vai sincronizar automaticamente
- Aguarde a mensagem: "Gradle sync finished"
- Pode levar 2-5 minutos na primeira vez
```

### **3. Gerar o APK**

```
1. No menu superior: Build → Build Bundle(s) / APK(s) → Build APK(s)
2. Aguarde a compilação (2-5 minutos)
3. Quando aparecer "APK(s) generated successfully", clique em "locate"
```

### **4. Localizar o APK**

O APK estará em:
```
C:\Users\lenovo\Downloads\delta2-main (2)\delta1-main\android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 🎯 **Testar o APK**

### **No Tablet:**
```
1. Copie app-debug.apk para o tablet
2. Instale o APK
3. Abra o app "DeltaNuvem"
4. Faça login no Alerta Vigia
5. Teste desconectar/conectar o carregador
6. Verifique:
   ✅ Evento "Fonte Desconectada" aparece
   ✅ Email recebido
   ✅ Evento "Fonte Conectada" ao reconectar
```

---

## ⚡ **Novidades Neste APK**

### **Monitoramento de Energia:**
- ✅ Detecta quando carregador é desconectado
- ✅ Detecta quando carregador é conectado
- ✅ Envia email automático para supervisor
- ✅ Registra eventos na tabela de Monitoramento

### **Todos os Eventos com Email:**
1. Sistema Ativado/Desativado
2. Portaria Online/Offline
3. Botão de Pânico
4. Vigia Adormeceu
5. Sem Comunicação
6. **Fonte Conectada** ⚡ NOVO
7. **Fonte Desconectada** ⚡ NOVO

---

## 🔧 **Se Encontrar Problemas**

### **Gradle Sync Failed:**
```
1. File → Invalidate Caches / Restart
2. Aguarde reiniciar
3. Tente novamente
```

### **SDK não encontrado:**
```
1. File → Project Structure
2. SDK Location → Verifique se está preenchido
3. Se não estiver, aponte para: C:\Users\lenovo\AppData\Local\Android\Sdk
```

### **Build Failed:**
```
1. Build → Clean Project
2. Build → Rebuild Project
3. Tente gerar APK novamente
```

---

## 📊 **Informações do APK**

- **Nome:** DeltaNuvem
- **Package:** com.deltanuvem.app
- **Tipo:** Debug APK (para testes)
- **Tamanho:** ~10-15 MB
- **Compatibilidade:** Android 5.0+

---

## 🎊 **Pronto!**

Depois de gerar o APK, você terá a versão mais atualizada do app com:
- ✅ Monitoramento de energia completo
- ✅ Notificações por email ativas
- ✅ Todas as funcionalidades anteriores

**Qualquer dúvida durante o processo, me avise!** 😊
