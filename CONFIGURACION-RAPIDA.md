# 🚨 CONFIGURACIÓN RÁPIDA - Botón de Invitación

## ⚡ Solución Inmediata

Para que el botón de invitación funcione AHORA MISMO:

### 1. Obtén tu Client ID de Discord:
1. Ve a: https://discord.com/developers/applications
2. Selecciona tu aplicación "Kale Bot" (o crea una nueva)
3. Ve a "General Information"
4. Copia el "Application ID" (este es tu Client ID)

### 2. Configura la variable de entorno:
```bash
# Crea el archivo .env.local
echo "NEXT_PUBLIC_CLIENT_ID=TU_CLIENT_ID_AQUI" > .env.local
```

### 3. O edita directamente el archivo:
Abre `pages/index.tsx` en la línea 80 y reemplaza:
```javascript
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID || 'YOUR_DISCORD_CLIENT_ID_HERE'
```

Con tu Client ID real:
```javascript
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID || '1234567890123456789'
```

### 4. Reinicia el servidor:
```bash
npm run dev
```

## 🔧 Permisos del Bot

El botón usa estos permisos:
- **2048**: Send Messages (Enviar mensajes)
- **bot**: Permisos básicos del bot
- **applications.commands**: Comandos slash

## ✅ Verificación

Una vez configurado, el enlace debería verse así:
```
https://discord.com/api/oauth2/authorize?client_id=TU_CLIENT_ID&permissions=2048&scope=bot%20applications.commands
```

¡Y funcionará perfectamente! 🚀
