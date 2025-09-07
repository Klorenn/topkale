# 🌾 Sistema de Farming Automático con Wallet

## ✅ **Problemas Solucionados**

### 1. **Botón de Portugués Corregido**
- ✅ Ahora muestra "🇧🇷 Português" correctamente
- ✅ Todos los botones de idioma funcionan perfectamente

### 2. **Sistema de Wallet Farming Implementado**
- ✅ Conexión con llaves de acceso de Kale Farm
- ✅ Farming automático en background
- ✅ Soporte para múltiples wallets compatibles
- ✅ Notificaciones de recompensas en tiempo real

## 🚀 **Nuevas Funcionalidades**

### **Comandos de Wallet:**
- `/wallet` - Información general sobre el sistema de wallet
- `/wallet-connect <llave-acceso>` - Conectar wallet con llave de acceso
- `/wallet-disconnect` - Desconectar wallet
- `/wallet-status` - Ver estado de la wallet y farming

### **Comandos de Farming:**
- `/farm-start` - Iniciar farming automático
- `/farm-stop` - Detener farming automático
- `/farm-status` - Ver estado del farming y recompensas

## 🔧 **Cómo Funciona**

### **1. Conexión de Wallet**
```bash
/wallet-connect tu-llave-de-acceso-aqui
```
- El bot valida la llave de acceso con Kale Farm
- Almacena la información de forma segura
- Confirma la conexión exitosa

### **2. Farming Automático**
```bash
/farm-start
```
- Abre una sesión invisible en el navegador
- Navega a https://kalefarm.xyz/
- Ejecuta acciones de farming cada 5 minutos
- Notifica recompensas obtenidas

### **3. Monitoreo**
```bash
/wallet-status
/farm-status
```
- Muestra estado de la wallet conectada
- Información del farming activo
- Recompensas acumuladas

## 🌐 **Soporte Multiidioma**

El sistema está completamente traducido a:
- 🇪🇸 **Español** (por defecto)
- 🇺🇸 **English**
- 🇧🇷 **Português**

## 🔒 **Seguridad**

- ✅ Las llaves de acceso se validan antes de almacenar
- ✅ No se almacenan claves privadas
- ✅ Sesiones de farming aisladas por usuario
- ✅ Manejo seguro de errores

## 📊 **Características Técnicas**

### **Tecnologías Utilizadas:**
- **Puppeteer**: Para automatización del navegador
- **Stellar SDK**: Para integración con blockchain
- **Discord.js**: Para comandos y notificaciones
- **Axios**: Para comunicación con APIs

### **Flujo de Farming:**
1. Usuario conecta wallet con `/wallet-connect`
2. Usuario inicia farming con `/farm-start`
3. Bot abre navegador invisible
4. Navega a Kale Farm automáticamente
5. Ejecuta acciones de farming cada 5 minutos
6. Notifica recompensas obtenidas
7. Usuario puede monitorear con `/farm-status`

## 🎯 **Próximos Pasos**

Para usar el sistema:

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   - `DISCORD_TOKEN`: Token del bot de Discord
   - `CLIENT_ID`: ID de la aplicación de Discord

3. **Iniciar el bot:**
   ```bash
   npm start
   ```

4. **Usar los comandos:**
   - `/wallet` para información
   - `/wallet-connect <llave>` para conectar
   - `/farm-start` para iniciar farming

## 🆘 **Soporte**

Si tienes problemas:
- Verifica que la llave de acceso sea válida
- Asegúrate de que Kale Farm esté accesible
- Revisa los logs del bot para errores
- Usa `/wallet-status` para verificar el estado

---

**¡El sistema está listo para usar!** 🎉
