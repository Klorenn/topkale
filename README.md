# 🌿 Kale Discord Bot - Documentación Completa

Un bot de Discord avanzado que monitorea y publica automáticamente los top holders del token Kale en la blockchain de Solana, utilizando datos en tiempo real de la API de hoops.finance.

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Nuevas Características](#-nuevas-características)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Mecanismos Internos](#-mecanismos-internos)
- [Instalación Local](#-instalación-local)
- [Configuración](#-configuración)
- [Despliegue en Servidor](#-despliegue-en-servidor)
- [Dependencias Críticas](#-dependencias-críticas)
- [API y Fuentes de Datos](#-api-y-fuentes-de-datos)
- [Comandos Disponibles](#-comandos-disponibles)
- [Programación de Tareas](#-programación-de-tareas)
- [Manejo de Errores](#-manejo-de-errores)
- [Monitoreo y Logs](#-monitoreo-y-logs)
- [Troubleshooting](#-troubleshooting)
- [Contribución](#-contribución)

## ✨ Características Principales

### 🎯 Funcionalidades Core
- **Monitoreo en Tiempo Real**: Obtiene datos actualizados de holders desde la API de hoops.finance
- **Publicaciones Automáticas**: Ranking diario a las 9:00 AM y 6:00 PM
- **Slash Commands**: Sistema de comandos nativos de Discord (`/kale`, `/top`, `/price`, `/help`)
- **Formato Profesional**: Embeds con medallas, colores y formato optimizado
- **Webhook Integration**: Publicación directa via webhooks de Discord
- **Fallback System**: Sistema de respaldo en caso de fallos
- **Verificación Externa**: Enlaces clickeables a Stellar Expert para verificación

### 📊 Datos Mostrados
- **Top 5 Holders**: Ranking con medallas (🥇🥈🥉)
- **Direcciones Verificables**: Enlaces clickeables a Stellar Expert
- **Balances Formateados**: Cantidades con decimales correctos (2 decimales)
- **Formato de Miles**: Separadores de miles con comas bien expresadas
- **Unidad KALE**: Identificación clara de la moneda
- **Timestamps**: Fecha y hora de actualización

## 🆕 Nuevas Características

### ✨ Mejoras Implementadas (Última Actualización)

#### **1. Slash Commands Nativos**
- **Migración completa** de comandos `!` a comandos `/`
- **Autocompletado automático** en Discord
- **Validación nativa** de parámetros
- **Interfaz más profesional** y moderna

#### **2. Enlaces de Verificación a Stellar Expert**
- **Direcciones clickeables** para cada holder
- **Verificación directa** de balances y transacciones
- **Transparencia total** de los datos mostrados
- **Enlaces automáticos** a `stellar.expert/explorer/public/account/`

#### **3. Formato de Balances Mejorado**
- **Decimales correctos**: 2 decimales fijos (.00)
- **Separadores de miles**: Comas bien expresadas
- **Unidad KALE**: Identificación clara de la moneda
- **Formato consistente**: Todos los holders con el mismo formato

#### **4. Estructura de Código Optimizada**
- **Slash Commands**: Implementación con `SlashCommandBuilder`
- **Registro automático**: Comandos se registran al iniciar
- **Manejo de interacciones**: Sistema robusto de respuestas
- **Código modular**: Funciones bien organizadas

### 📊 Ejemplo de Salida Actualizada

```
🏆 Ranking Top 5 Holders

🥇 1
[CDL74RF5BLYR2YBLCCI7F5FB6TPSCLKEJUBSD2RSVWZ4YHF3VMFAIGWA](https://stellar.expert/explorer/public/account/CDL74RF5BLYR2YBLCCI7F5FB6TPSCLKEJUBSD2RSVWZ4YHF3VMFAIGWA)
💰 **244,905,600,010.00 KALE**

🥈 2
[GARARLMQ64D6LUXYMSAR7I2S6DPNZ6LPR7QOVBO3Y5XPW25GR757TWVT](https://stellar.expert/explorer/public/account/GARARLMQ64D6LUXYMSAR7I2S6DPNZ6LPR7QOVBO3Y5XPW25GR757TWVT)
💰 **105,600,244,131.07 KALE**
```

## 🏗️ Arquitectura del Sistema

### Estructura de Archivos
```
kale-discord-bot/
├── index.js              # Archivo principal del bot
├── package.json          # Dependencias y scripts
├── .env                  # Variables de entorno (sensible)
├── .gitignore           # Archivos a ignorar en git
└── README.md            # Documentación
```

### Flujo de Datos
```
API hoops.finance → Bot Node.js → Procesamiento → Discord Webhook → Canal
     ↓                    ↓              ↓              ↓
  Datos Raw          Validación      Formateo      Publicación
```

## ⚙️ Mecanismos Internos

### 1. Sistema de Obtención de Datos

```javascript
// Función principal de obtención de datos
async function getTopHolders() {
    // 1. Llamada a la API de hoops.finance
    const response = await axios.get(KALE_API_URL);
    
    // 2. Validación de datos
    if (!Array.isArray(holders) || holders.length === 0) {
        throw new Error('No holders data received from API');
    }
    
    // 3. Cálculo del supply total
    const totalSupply = holders.reduce((sum, holder) => sum + holder.balance, 0);
    
    // 4. Ordenamiento y formateo
    const sortedHolders = holders
        .sort((a, b) => b.balance - a.balance)
        .slice(0, TOP_LIMIT)
        .map(holder => {
            // Cálculo de porcentajes y formateo
            const percentage = ((holder.balance / totalSupply) * 100).toFixed(2);
            return {
                address: `${holder.address.slice(0, 6)}...${holder.address.slice(-6)}`,
                fullAddress: holder.address,
                rawBalance: holder.balance,
                percentage: `${percentage}%`
            };
        });
}
```

### 2. Sistema de Embeds de Discord

```javascript
// Creación de embeds optimizados
async function getTopHoldersEmbed() {
    const embed = new EmbedBuilder()
        .setTitle('🏆 Ranking Top 5 Holders')
        .setColor(3447003) // Color azul profesional
        .setTimestamp();

    holders.forEach((holder, index) => {
        let medal = index === 0 ? '🥇 1' : 
                   index === 1 ? '🥈 2' : 
                   index === 2 ? '🥉 3' : `${index + 1}️⃣`;
        
        embed.addFields({
            name: medal,
            value: `\`${holder.fullAddress}\`\n💰 **${holder.rawBalance.toLocaleString('en-US')}**`,
            inline: false
        });
    });
}
```

### 3. Sistema de Programación de Tareas

```javascript
// Tareas programadas con node-cron
cron.schedule('0 9 * * *', async () => {
    console.log('🕘 Running daily top holders update...');
    await postDailyTopHolders();
});

cron.schedule('0 18 * * *', async () => {
    console.log('🕕 Running evening top holders update...');
    await postDailyTopHolders();
});
```

### 4. Sistema de Webhooks con Fallback

```javascript
async function postDailyTopHolders() {
    try {
        // Intento principal: Webhook
        const response = await axios.post(WEBHOOK_URL, {
            content: '🌿 **Daily Top Holders Update**',
            embeds: [embed]
        });
        
        if (response.status === 204) {
            console.log('✅ Posted via webhook');
        }
    } catch (error) {
        // Fallback: Canal de Discord
        const channel = client.channels.cache.get(process.env.CHANNEL_ID);
        if (channel) {
            await channel.send({ embeds: [embed] });
            console.log('✅ Fallback: Posted via channel');
        }
    }
}
```

## 🚀 Instalación Local

### Prerrequisitos
- **Node.js** v16.0.0 o superior
- **npm** v7.0.0 o superior
- **Cuenta de Discord** con permisos de desarrollador
- **Acceso a internet** para APIs

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd kale-discord-bot
```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus valores
```

4. **Ejecutar el bot**
```bash
npm start
# o
node index.js
```

## ⚙️ Configuración

### Variables de Entorno (.env)

```env
# Token del bot de Discord (OBLIGATORIO)
DISCORD_TOKEN=tu_token_del_bot_aqui

# ID del canal de Discord (para fallback)
CHANNEL_ID=1414030545083433001

# Application ID para Slash Commands (OBLIGATORIO)
CLIENT_ID=tu_application_id_aqui

# Número de holders a mostrar (opcional, default: 5)
TOP_LIMIT=5

# URL del webhook de Discord (opcional, para publicaciones directas)
WEBHOOK_URL=https://discord.com/api/webhooks/...
```

### Configuración del Bot de Discord

1. **Crear aplicación en Discord**
   - Ve a [Discord Developer Portal](https://discord.com/developers/applications)
   - Crea nueva aplicación
   - Nombre: "Kale Bot" (o el que prefieras)

2. **Configurar el bot**
   - Ve a la sección "Bot"
   - Genera token y cópialo
   - Habilita intents necesarios:
     - ✅ **Message Content Intent** (para comandos)
     - ✅ **Server Members Intent** (opcional)

3. **Invitar el bot al servidor**
   - Ve a "OAuth2" → "URL Generator"
   - Selecciona: `bot`, `Send Messages`, `Use Slash Commands`
   - Copia la URL y úsala para invitar

## 🌐 Despliegue en Servidor

### Opción 1: VPS/Cloud Server (Recomendado)

#### Preparación del Servidor
```bash
# Actualizar sistema (Ubuntu/Debian)
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 para gestión de procesos
sudo npm install -g pm2

# Instalar Git
sudo apt install git -y
```

#### Despliegue del Bot
```bash
# Clonar repositorio
git clone <tu-repositorio>
cd kale-discord-bot

# Instalar dependencias
npm install --production

# Configurar variables de entorno
nano .env
# Editar con tus valores

# Iniciar con PM2
pm2 start index.js --name "kale-bot"

# Configurar auto-inicio
pm2 startup
pm2 save
```

#### Monitoreo con PM2
```bash
# Ver estado del bot
pm2 status

# Ver logs en tiempo real
pm2 logs kale-bot

# Reiniciar bot
pm2 restart kale-bot

# Detener bot
pm2 stop kale-bot
```

### Opción 2: Docker

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
```

#### docker-compose.yml
```yaml
version: '3.8'
services:
  kale-bot:
    build: .
    container_name: kale-discord-bot
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - ./logs:/app/logs
```

#### Comandos Docker
```bash
# Construir imagen
docker build -t kale-bot .

# Ejecutar contenedor
docker run -d --name kale-bot --env-file .env kale-bot

# Ver logs
docker logs -f kale-bot

# Detener
docker stop kale-bot
```

### Opción 3: Heroku

#### Configuración
   ```bash
# Instalar Heroku CLI
npm install -g heroku

# Login
heroku login

# Crear app
heroku create kale-discord-bot

# Configurar variables
heroku config:set DISCORD_TOKEN=tu_token
heroku config:set CHANNEL_ID=tu_canal_id

# Desplegar
git push heroku main
```

#### Procfile
```
worker: node index.js
```

## 📦 Dependencias Críticas

### Dependencias Principales

| Paquete | Versión | Propósito | Crítico |
|---------|---------|-----------|---------|
| `discord.js` | ^14.14.1 | Cliente de Discord | ✅ |
| `axios` | ^1.6.2 | Cliente HTTP para APIs | ✅ |
| `node-cron` | ^3.0.3 | Programación de tareas | ✅ |
| `dotenv` | ^16.3.1 | Variables de entorno | ✅ |

### Dependencias de Desarrollo

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `nodemon` | ^3.0.0 | Auto-reload en desarrollo |
| `eslint` | ^8.0.0 | Linting de código |

### Análisis de Dependencias

#### discord.js
- **Función**: Interfaz principal con Discord
- **Uso**: Cliente, eventos, embeds, mensajes
- **Crítico**: Sin esto el bot no funciona

#### axios
- **Función**: Cliente HTTP para APIs externas
- **Uso**: Obtener datos de hoops.finance y Jupiter
- **Crítico**: Sin esto no hay datos de holders

#### node-cron
- **Función**: Programación de tareas temporales
- **Uso**: Publicaciones automáticas diarias
- **Crítico**: Sin esto no hay automatización

#### dotenv
- **Función**: Gestión de variables de entorno
- **Uso**: Tokens, IDs, configuraciones sensibles
- **Crítico**: Sin esto no hay configuración segura

## 🔌 API y Fuentes de Datos

### API Principal: hoops.finance

**Endpoint**: `https://api.hoops.finance/tokens/{TOKEN_ADDRESS}/balances`

**Parámetros**:
- `excludezero=true` - Excluir balances cero
- `excludeid=true` - Excluir IDs innecesarios
- `excludetoken=true` - Excluir metadatos del token
- `excludelastupdated=true` - Excluir timestamps

**Respuesta**:
```json
[
  {
    "address": "CDL74RF5BLYR2YBLCCI7F5FB6TPSCLKEJUBSD2RSVWZ4YHF3VMFAIGWA",
    "balance": 244905600010000
  }
]
```

### API Secundaria: Jupiter (Precios)

**Endpoint**: `https://price.jup.ag/v4/price?ids={TOKEN_ADDRESS}`

**Uso**: Obtener precios actuales del token

### Token de Kale

**Dirección**: `CB23WRDQWGSP6YPMY4UV5C4OW5CBTXKYN3XEATG7KJEZCXMJBYEHOUOV`

**Blockchain**: Solana

**Tipo**: SPL Token

## 🎮 Comandos Disponibles

### Slash Commands (Nativos de Discord)

| Comando | Función | Ejemplo |
|---------|---------|---------|
| `/kale` | Muestra comandos disponibles | `/kale` |
| `/top` | Ranking actual de holders con enlaces a Stellar Expert | `/top` |
| `/price` | Precio actual del token | `/price` |
| `/help` | Ayuda completa | `/help` |

### Características de los Slash Commands
- ✅ **Autocompletado**: Discord sugiere comandos automáticamente
- ✅ **Validación**: Parámetros validados por Discord
- ✅ **Interfaz Nativa**: Integración perfecta con la UI de Discord
- ✅ **Menos Errores**: No hay problemas de escritura o formato

### Implementación de Comandos

```javascript
client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;

    if (message.content === '!top') {
        try {
            const embed = await getTopHoldersEmbed();
            await message.reply({ embeds: [embed] });
        } catch (error) {
            await message.reply('❌ Error fetching data');
        }
    }
});
```

## ⏰ Programación de Tareas

### Horarios Configurados

- **9:00 AM UTC**: Publicación matutina
- **6:00 PM UTC**: Publicación vespertina

### Expresiones Cron

```javascript
// Todos los días a las 9:00 AM
'0 9 * * *'

// Todos los días a las 6:00 PM  
'0 18 * * *'

// Cada hora (para testing)
'0 * * * *'

// Cada 30 minutos (para testing)
'*/30 * * * *'
```

### Personalización de Horarios

```javascript
// Cambiar a cada 6 horas
cron.schedule('0 */6 * * *', async () => {
    await postDailyTopHolders();
});

// Solo días laborables
cron.schedule('0 9 * * 1-5', async () => {
    await postDailyTopHolders();
});
```

## 🛡️ Manejo de Errores

### Estrategias de Error Handling

#### 1. Errores de API
```javascript
try {
    const response = await axios.get(API_URL);
    // Procesar datos
} catch (error) {
    console.error('API Error:', error.message);
    // Fallback o retry
}
```

#### 2. Errores de Discord
```javascript
try {
    await channel.send({ embeds: [embed] });
} catch (error) {
    console.error('Discord Error:', error);
    // Intentar webhook como fallback
}
```

#### 3. Errores de Conexión
```javascript
client.on('error', error => {
    console.error('Discord Client Error:', error);
});

client.on('disconnect', () => {
    console.log('Bot disconnected, attempting reconnect...');
});
```

### Sistema de Reintentos

```javascript
async function retryOperation(operation, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}
```

## 📊 Monitoreo y Logs

### Sistema de Logging

```javascript
// Logs estructurados
console.log(`🌿 Kale Bot Ready! Logged in as ${client.user.tag}`);
console.log(`📊 Will post top ${TOP_LIMIT} holders daily`);
console.log(`📡 Fetching Kale holders data from API...`);
console.log(`✅ Successfully fetched ${holders.length} top holders`);
console.log(`✅ Daily top holders posted successfully via webhook`);
```

### Métricas Importantes

- **Uptime del bot**
- **Frecuencia de actualizaciones**
- **Errores de API**
- **Latencia de respuestas**
- **Número de holders procesados**

### Herramientas de Monitoreo

#### PM2 Monitoring
```bash
# Dashboard web
pm2 monit

# Métricas en tiempo real
pm2 show kale-bot
```

#### Logs Externos
```bash
# Enviar logs a archivo
pm2 start index.js --name kale-bot --log /var/log/kale-bot.log

# Rotación de logs
pm2 install pm2-logrotate
```

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. "TokenInvalid" Error
**Causa**: Token de Discord incorrecto
**Solución**: 
- Verificar token en .env
- Regenerar token en Discord Developer Portal
- Asegurar que no hay espacios extra

#### 2. "Used disallowed intents" Error
**Causa**: Intents no habilitados
**Solución**:
- Ir a Discord Developer Portal
- Habilitar "Message Content Intent"
- Reiniciar el bot

#### 3. "Channel not found" Error
**Causa**: CHANNEL_ID incorrecto
**Solución**:
- Verificar ID del canal
- Asegurar que el bot tiene permisos
- Usar webhook como alternativa

#### 4. API Rate Limiting
**Causa**: Demasiadas llamadas a la API
**Solución**:
- Implementar delays entre llamadas
- Usar cache para datos
- Monitorear límites de API

### Comandos de Diagnóstico

   ```bash
# Verificar estado del bot
pm2 status kale-bot

# Ver logs en tiempo real
pm2 logs kale-bot --lines 100

# Verificar conectividad
curl -I https://api.hoops.finance/tokens/CB23WRDQWGSP6YPMY4UV5C4OW5CBTXKYN3XEATG7KJEZCXMJBYEHOUOV/balances

# Verificar webhook
curl -X POST https://discord.com/api/webhooks/YOUR_WEBHOOK_URL
```

### Logs de Debug

```javascript
// Habilitar logs detallados
process.env.DEBUG = 'discord.js:*';

// Logs personalizados
console.log('🔍 Debug:', {
    holdersCount: holders.length,
    totalSupply: totalSupply,
    topHolder: sortedHolders[0]
});
```

## 🤝 Contribución

### Estructura para Contribuciones

1. **Fork del repositorio**
2. **Crear rama feature**: `git checkout -b feature/nueva-funcionalidad`
3. **Hacer cambios y commits**
4. **Push a la rama**: `git push origin feature/nueva-funcionalidad`
5. **Crear Pull Request**

### Áreas de Mejora

- [ ] **Cache de datos** para reducir llamadas a API
- [ ] **Métricas avanzadas** (gráficos, estadísticas)
- [ ] **Comandos slash** de Discord
- [ ] **Notificaciones push** para cambios importantes
- [ ] **Dashboard web** para monitoreo
- [ ] **Soporte multi-token**

### Estándares de Código

```javascript
// Usar async/await
async function getData() {
    try {
        const response = await api.call();
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Documentar funciones
/**
 * Obtiene los top holders del token Kale
 * @param {number} limit - Número de holders a retornar
 * @returns {Promise<Array>} Array de holders ordenados
 */
async function getTopHolders(limit = 5) {
    // Implementación
}
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/kale-discord-bot/issues)
- **Discord**: [Servidor de Soporte](https://discord.gg/tu-servidor)
- **Email**: soporte@tu-dominio.com

---

**🌿 ¡Disfruta tu bot de Kale!** 🚀

*Última actualización: $(date)*