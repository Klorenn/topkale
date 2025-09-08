# 🚀 Configuración de Railway para Bot Kale

## ❌ Problema actual
El bot no puede conectarse a Discord porque faltan las variables de entorno en Railway.

## ✅ Solución paso a paso

### 1. Ir a Railway Dashboard
1. Ve a [railway.app](https://railway.app)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto "lucid-charm" o "topkale"

### 2. Configurar Variables de Entorno
1. En tu proyecto, ve a la pestaña **"Variables"**
2. Haz clic en **"New Variable"** para cada una:

#### Variables REQUERIDAS:

**DISCORD_TOKEN**
- **Valor:** Tu token del bot de Discord
- **Cómo obtenerlo:**
  1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
  2. Selecciona tu aplicación "Kale Bot"
  3. Ve a "Bot" → "Token"
  4. Copia el token (empieza con algo como `MTIzNDU2Nzg5...`)

**CLIENT_ID**
- **Valor:** Tu Application ID
- **Cómo obtenerlo:**
  1. En Discord Developer Portal
  2. Ve a "General Information"
  3. Copia el "Application ID" (números como `123456789012345678`)

**CHANNEL_ID**
- **Valor:** ID del canal donde quieres que publique
- **Cómo obtenerlo:**
  1. En Discord, haz clic derecho en el canal
  2. "Copy Channel ID" (números como `1234567890123456789`)

#### Variables OPCIONALES:

**WEBHOOK_URL**
- **Valor:** URL del webhook (opcional)
- **Cómo obtenerlo:**
  1. En Discord, ve a Configuración del canal
  2. "Integrations" → "Webhooks"
  3. "Create Webhook"
  4. Copia la URL

**TOP_LIMIT**
- **Valor:** `5` (número de holders a mostrar)

### 3. Verificar Configuración
Después de agregar todas las variables, deberías ver:
```
DISCORD_TOKEN: ✅ Configurado
CLIENT_ID: ✅ Configurado  
CHANNEL_ID: ✅ Configurado
WEBHOOK_URL: ✅ Configurado (opcional)
```

### 4. Redesplegar
1. Ve a la pestaña **"Deployments"**
2. Haz clic en **"Redeploy"** o espera a que se redesplegue automáticamente

### 5. Verificar Logs
1. Ve a la pestaña **"Deployments"**
2. Haz clic en **"View Logs"**
3. Deberías ver:
   ```
   ✅ Kale bot is ready!
   🤖 Bot: Kale Bot#1234
   🌐 Servidores: 1
   ```

## 🔧 Si sigue fallando

### Verificar Token
- Asegúrate de que el token sea correcto
- No debe tener espacios extra
- Debe empezar con letras/números

### Verificar Permisos del Bot
1. Ve a Discord Developer Portal
2. "Bot" → "Privileged Gateway Intents"
3. Activa:
   - ✅ Message Content Intent
   - ✅ Server Members Intent (opcional)

### Verificar Invitación del Bot
1. Ve a "OAuth2" → "URL Generator"
2. Selecciona: `bot`, `Send Messages`, `Use Slash Commands`
3. Copia la URL y úsala para invitar el bot a tu servidor

## 📞 Soporte
Si sigues teniendo problemas, verifica:
1. ✅ Variables de entorno configuradas
2. ✅ Bot invitado al servidor
3. ✅ Permisos correctos del bot
4. ✅ Token válido y no expirado
