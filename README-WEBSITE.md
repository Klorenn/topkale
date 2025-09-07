# 🌿 Kale Bot Website

Página web moderna para el bot de Discord Kale - Monitoreo de top holders del token Kale en la blockchain de Stellar.

## ✨ Características

- **Diseño Moderno**: Interfaz atractiva con efectos glassmorphism y animaciones
- **Responsive**: Optimizado para dispositivos móviles y desktop
- **Botón de Invitación**: Integración directa con Discord para invitar el bot
- **Información Completa**: Documentación de comandos y características
- **SEO Optimizado**: Meta tags y estructura optimizada para motores de búsqueda

## 🚀 Despliegue en Vercel

### Opción 1: Despliegue Automático (Recomendado)

1. **Fork este repositorio** en GitHub
2. **Ve a [Vercel](https://vercel.com)** y conéctate con GitHub
3. **Importa el proyecto** desde tu repositorio
4. **Configura las variables de entorno**:
   - `NEXT_PUBLIC_CLIENT_ID`: Tu Client ID de Discord
5. **Despliega** - Vercel lo hará automáticamente

### Opción 2: Despliegue Manual

1. **Instala Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Configura las variables de entorno**:
   ```bash
   cp env.local.example .env.local
   # Edita .env.local con tu CLIENT_ID de Discord
   ```

3. **Despliega**:
   ```bash
   vercel
   ```

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env.local` con:

```env
NEXT_PUBLIC_CLIENT_ID=tu_client_id_de_discord
```

### Obtener Client ID de Discord

1. Ve al [Discord Developer Portal](https://discord.com/developers/applications)
2. Selecciona tu aplicación (o crea una nueva)
3. Ve a "General Information"
4. Copia el "Application ID" (este es tu Client ID)

## 🛠️ Desarrollo Local

1. **Instala dependencias**:
   ```bash
   npm install
   ```

2. **Configura variables de entorno**:
   ```bash
   cp env.local.example .env.local
   # Edita .env.local con tu CLIENT_ID
   ```

3. **Ejecuta en modo desarrollo**:
   ```bash
   npm run dev
   ```

4. **Abre** [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
kale-bot-website/
├── pages/
│   ├── _app.tsx          # Configuración de la app
│   └── index.tsx         # Página principal
├── styles/
│   └── globals.css       # Estilos globales
├── public/               # Archivos estáticos
├── next.config.js        # Configuración de Next.js
├── package.json          # Dependencias
└── vercel.json          # Configuración de Vercel
```

## 🎨 Personalización

### Cambiar Colores

Edita `styles/globals.css` y modifica las variables de gradiente:

```css
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* Cambia estos colores por los tuyos */
}
```

### Modificar Contenido

Edita `pages/index.tsx` para cambiar:
- Textos y descripciones
- Características del bot
- Comandos disponibles
- Enlaces y URLs

### Añadir Nuevas Secciones

Puedes añadir nuevas secciones en `pages/index.tsx` siguiendo el patrón existente.

## 🔗 Enlaces Útiles

- [Discord Developer Portal](https://discord.com/developers/applications)
- [Vercel](https://vercel.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Kale Farm](https://kalefarm.xyz/)
- [Stellar Expert](https://stellar.expert/)

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

- **Discord**: [https://discord.gg/bDakpsnCzA](https://discord.gg/bDakpsnCzA)
- **Email**: pau@telluscoop.com
- **GitHub Issues**: [Crear un issue](https://github.com/Klorenn/topkale/issues)

---

**¡Disfruta tu nueva página web para el bot de Kale! 🚀**

