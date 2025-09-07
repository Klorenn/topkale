import { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'

interface BotStats {
  servers: number
  users: number
  uptime: string
}

export default function Home() {
  const [botStats, setBotStats] = useState<BotStats>({
    servers: 0,
    users: 0,
    uptime: '99.9%'
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular carga de estadísticas
    const timer = setTimeout(() => {
      setBotStats({
        servers: 150,
        users: 2500,
        uptime: '99.9%'
      })
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const features = [
    {
      icon: '🏆',
      title: 'Ranking en Tiempo Real',
      description: 'Monitorea los top holders del token Kale con actualizaciones automáticas cada 6 horas.'
    },
    {
      icon: '💰',
      title: 'Precios Actualizados',
      description: 'Obtén el precio actual del token Kale, cambios de 24h y capitalización de mercado.'
    },
    {
      icon: '🔗',
      title: 'Enlaces a Stellar Expert',
      description: 'Verifica cada dirección directamente en Stellar Expert para total transparencia.'
    },
    {
      icon: '🌐',
      title: 'Multiidioma',
      description: 'Soporte completo en español, inglés y portugués con comandos intuitivos.'
    },
    {
      icon: '📊',
      title: 'Estadísticas Avanzadas',
      description: 'Analiza la distribución de tokens, posiciones de ranking y alertas personalizadas.'
    },
    {
      icon: '⚡',
      title: 'Comandos Slash',
      description: 'Comandos nativos de Discord con autocompletado y validación automática.'
    }
  ]

  const commands = [
    { command: '/kale', description: 'Muestra los comandos principales del bot' },
    { command: '/top [limit]', description: 'Ranking de top holders (1-25 posiciones)' },
    { command: '/price', description: 'Precio actual del token Kale' },
    { command: '/rank [address]', description: 'Posición de una dirección específica' },
    { command: '/stats', description: 'Estadísticas globales del token' },
    { command: '/farm', description: 'Acceso directo a Kale Farm' },
    { command: '/alerts', description: 'Configurar alertas de balance' },
    { command: '/language', description: 'Cambiar idioma del bot' }
  ]

  // URL de invitación - Client ID del bot Kale configurado
  const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID || '1414030545083433001'
  const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&permissions=2048&scope=bot%20applications.commands`

  return (
    <>
      <Head>
        <title>Kale Bot - Monitoreo de Top Holders en Discord</title>
        <meta name="description" content="Bot de Discord para monitorear los top holders del token Kale en la blockchain de Stellar. Ranking en tiempo real, precios y estadísticas." />
        <meta name="keywords" content="discord bot, kale token, stellar blockchain, cryptocurrency, top holders, ranking" />
        <meta property="og:title" content="Kale Bot - Monitoreo de Top Holders en Discord" />
        <meta property="og:description" content="Bot de Discord para monitorear los top holders del token Kale en la blockchain de Stellar." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Kale Bot - Monitoreo de Top Holders en Discord" />
        <meta name="twitter:description" content="Bot de Discord para monitorear los top holders del token Kale en la blockchain de Stellar." />
      </Head>

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 px-4 text-center">
          <div className="max-w-6xl mx-auto">
            <div className="animate-fadeInUp">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                🌿 <span className="gradient-text">Kale Bot</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                Monitorea los top holders del token Kale en la blockchain de Stellar directamente desde Discord
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href={inviteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary text-lg px-8 py-4 animate-pulse"
                >
                  🚀 Invitar Bot a Discord
                </a>
                <a
                  href="#features"
                  className="btn btn-secondary text-lg px-8 py-4"
                >
                  📋 Ver Características
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="stats-grid">
              <div className="card text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  {isLoading ? '...' : botStats.servers.toLocaleString()}
                </div>
                <div className="text-white/80">Servidores</div>
              </div>
              <div className="card text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  {isLoading ? '...' : botStats.users.toLocaleString()}
                </div>
                <div className="text-white/80">Usuarios</div>
              </div>
              <div className="card text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  {isLoading ? '...' : botStats.uptime}
                </div>
                <div className="text-white/80">Uptime</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                ✨ Características Principales
              </h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Un bot completo para el monitoreo y análisis del token Kale en la blockchain de Stellar
              </p>
            </div>
            
            <div className="feature-grid">
              {features.map((feature, index) => (
                <div key={index} className="card animate-fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-white/80 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Commands Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                🎮 Comandos Disponibles
              </h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Comandos slash nativos de Discord para una experiencia fluida
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {commands.map((cmd, index) => (
                <div key={index} className="card animate-fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg font-mono text-sm font-bold">
                      {cmd.command}
                    </div>
                    <p className="text-white/80 flex-1">{cmd.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="card text-center">
              <h2 className="text-4xl font-bold text-white mb-8">
                🌿 ¿Qué es Kale?
              </h2>
              <div className="text-white/80 text-lg leading-relaxed space-y-6">
                <p>
                  Kale es un token digital en la blockchain de Stellar que forma parte del ecosistema de Kale Farm. 
                  Es una criptomoneda que permite a los usuarios participar en el sistema de farmeo y obtener 
                  recompensas por sus actividades.
                </p>
                <p>
                  Kale Farm es la plataforma oficial donde puedes farmear (obtener) tokens KALE. Es un sistema de 
                  recompensas que te permite ganar tokens KALE realizando diferentes actividades y tareas en la plataforma.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <a
                    href="https://kalefarm.xyz/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    🌾 Ir a Kale Farm
                  </a>
                  <a
                    href="https://stellar.expert/explorer/public/asset/CB23WRDQWGSP6YPMY4UV5C4OW5CBTXKYN3XEATG7KJEZCXMJBYEHOUOV"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                  >
                    🔗 Ver en Stellar Expert
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="card">
              <h2 className="text-4xl font-bold text-white mb-6">
                🚀 ¡Comienza Ahora!
              </h2>
              <p className="text-xl text-white/80 mb-8">
                Agrega el bot de Kale a tu servidor de Discord y mantente al día con los top holders
              </p>
              <a
                href={inviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary text-xl px-12 py-6 animate-float"
              >
                🎯 Invitar Bot a Discord
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-white/10">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-white/60 mb-4">
              <p>Powered by Hoops Finance API (api.hoops.finance)</p>
              <p className="mt-2">Desarrollado con ❤️ para la comunidad Kale</p>
            </div>
            <div className="flex justify-center gap-6 mt-6">
              <a
                href="https://github.com/Klorenn/topkale"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://discord.gg/bDakpsnCzA"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
              >
                Discord
              </a>
              <a
                href="mailto:pau@telluscoop.com"
                className="text-white/60 hover:text-white transition-colors"
              >
                Contacto
              </a>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}

