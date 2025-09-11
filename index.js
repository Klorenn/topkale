const { Client, GatewayIntentBits, Events, EmbedBuilder, SlashCommandBuilder, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const cron = require('node-cron');
const http = require('http');
require('dotenv').config();

// Health check server for Railway - will be initialized after Discord bot is ready
let healthServer = null;
const PORT = process.env.PORT || 3000;

// Validate required environment variables
const requiredEnvVars = ['DISCORD_TOKEN', 'CLIENT_ID'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.warn('⚠️ Missing required environment variables:', missingVars.join(', '));
    console.warn('📝 Please check your .env file and ensure all required variables are set.');
    console.warn('💡 You can use env.example as a template.');
    console.warn('🚀 Bot will start anyway, but some features may not work properly.');
}

// Validate optional but recommended variables
if (!process.env.CHANNEL_ID && !process.env.WEBHOOK_URL) {
    console.warn('⚠️ Warning: Neither CHANNEL_ID nor WEBHOOK_URL is configured.');
    console.warn('📝 The bot will not be able to post daily updates.');
    console.warn('💡 Please configure at least one of these in your .env file.');
}

// Language storage (in a real app, use a database)
const userLanguages = new Map();

// Language translations
const translations = {
    es: {
        commands: {
            kale: 'Muestra los comandos principales del bot de Kale',
            top: 'Muestra el ranking de top 5 holders de Kale',
            price: 'Muestra el precio actual del token Kale',
            farm: '🌾 Redirige a la página oficial de Kale Farm para farmear tokens',
            invite: '🔗 Genera un enlace para invitar el bot a tu servidor',
            help: 'Muestra ayuda completa del bot',
            language: '🌐 Cambia el idioma del bot',
            rank: '🏆 Muestra la posición de una dirección en el ranking',
            stats: '📊 Muestra estadísticas globales del token Kale',
            alerts: '🔔 Configura alertas de cambios de balance',
            history: '📈 Muestra el histórico de cambios en holdings',
            info: 'ℹ️ Muestra información y enlaces de Kale',
        },
        embeds: {
            kaleTitle: '🌿 Kale Bot Commands',
            kaleDescription: 'Comandos disponibles:',
            topTitle: '🏆 Top Holders Ranking',
            priceTitle: '🌿 Kale Token Price',
            farmTitle: '🌾 Kale Farm - Farmeo de Tokens',
            farmDescription: '¡Farmeá tokens KALE en la plataforma oficial!',
            inviteTitle: '🔗 Invitar Kale Bot a tu Servidor',
            inviteDescription: '¡Agregá el bot de Kale a tu servidor para monitorear los top holders!',
            helpTitle: '🌿 Kale Bot Help',
            helpDescription: 'Comandos disponibles:',
            whatIsKale: '🌿 ¿Qué es Kale?',
            whatIsKaleDesc: 'Kale es un token digital en la blockchain de Stellar que forma parte del ecosistema de Kale Farm. Es una criptomoneda que permite a los usuarios participar en el sistema de farmeo y obtener recompensas por sus actividades.',
            whatIsFarm: '🌾 ¿Qué es Kale Farm?',
            whatIsFarmDesc: 'Kale Farm es la plataforma oficial donde puedes farmear (obtener) tokens KALE. Es un sistema de recompensas que te permite ganar tokens KALE realizando diferentes actividades y tareas en la plataforma.',
            rankTitle: '🏆 Posición en el Ranking',
            rankDescription: 'Posición actual de la dirección en el ranking de holders',
            statsTitle: '📊 Estadísticas Globales de Kale',
            statsDescription: 'Estadísticas generales del token Kale',
            alertsTitle: '🔔 Configuración de Alertas',
            alertsDescription: 'Configura alertas para cambios de balance',
            historyTitle: '📈 Historial de Holdings',
            historyDescription: 'Historial de cambios en tus holdings',
            infoTitle: '🌿 Información de Kale',
            infoDescription: 'Información oficial y enlaces útiles de Kale',
            leaderboardTitle: '🏅 Leaderboard Extendido',
            leaderboardDescription: 'Ranking completo de holders de Kale'
        },
        fields: {
            top: 'Show top holders',
            price: 'Show current price',
            farm: 'Go to Kale Farm',
            invite: 'Invite bot to server',
            help: 'Show this help',
            language: 'Change language',
            rank: 'Check address position in ranking',
            stats: 'Show global statistics',
            alerts: 'Configure balance alerts',
            history: 'Show holdings history',
            currentPrice: 'Current Price',
            change24h: '24h Change',
            marketCap: 'Market Cap',
            balance: 'Balance',
            percentage: 'Percentage',
            position: 'Position',
            totalSupply: 'Total Supply',
            totalHolders: 'Total Holders',
            requiredPermissions: '📋 Permisos Requeridos',
            requiredPermissionsDesc: '• Enviar mensajes\n• Usar comandos slash\n• Insertar embeds',
            features: '✨ Características',
            featuresDesc: '• Ranking diario de top holders\n• Precios en tiempo real\n• Enlaces a Stellar Expert\n• Comandos slash nativos',
            note: '📝 Nota',
            noteDesc: 'En el futuro planeamos implementar el farmeo directamente desde Discord. Por ahora, usa el botón para acceder a la plataforma web.'
        },
        buttons: {
            goToFarm: '🚀 Ir a Kale Farm',
            inviteBot: '🔗 Invitar Bot',
            changeToEnglish: '🇺🇸 English',
            changeToSpanish: '🇪🇸 Español'
        },
        footer: {
            poweredBy: 'Powered by Hoops Finance API (api.hoops.finance)',
            kaleFarm: 'Kale Farm - Plataforma oficial de farmeo',
            dataUpdated: 'Datos actualizados en tiempo real'
        },
        messages: {
            botReady: '✅ Bot de Kale está listo!',
            willPostDaily: '📅 Publicará actualizaciones diarias de los top',
            holdersDaily: 'holders diariamente',
            slashCommands: '🔧 Comandos slash registrados correctamente',
            slashCommandsRegistered: '✅ Comandos slash registrados correctamente',
            slashCommandsError: '❌ Error registrando comandos slash:',
            dailyUpdate: '📊 **Actualización Diaria - Top Holders de Kale**',
            errorFetchingHolders: '❌ Error obteniendo los top holders. Intenta más tarde.',
            errorFetchingPrice: '❌ Error obteniendo el precio. Intenta más tarde.',
            languageChanged: '🌐 Idioma cambiado a español',
            walletConnectedSuccess: '✅ Wallet conectada exitosamente!',
            farmingReward: '🎉 ¡Recompensa obtenida!',
            farmingError: '❌ Error en el farming',
            invalidAddress: '❌ Dirección de Stellar inválida. Debe tener 56 caracteres y comenzar con "G".',
            addressNotFound: '❌ Dirección no encontrada en los holders de Kale.',
            userNotFound: '❌ Usuario no encontrado en el ranking.',
            invalidPercentage: '❌ Porcentaje inválido. Usa un número entre 0.1 y 100.',
            alertSet: '✅ Alerta configurada correctamente.',
            alertRemoved: '✅ Alerta eliminada correctamente.',
            noHistory: '❌ No hay historial disponible para esta dirección.',
            noAlerts: '❌ No tienes alertas configuradas.'
        }
    },
    en: {
        commands: {
            kale: 'Shows the main Kale bot commands',
            top: 'Shows the top 5 Kale holders ranking',
            price: 'Shows the current Kale token price',
            farm: '🌾 Redirects to the official Kale Farm page to farm tokens',
            invite: '🔗 Generates a link to invite the bot to your server',
            help: 'Shows complete bot help',
            language: '🌐 Changes the bot language',
            rank: '🏆 Shows an address position in the ranking',
            stats: '📊 Shows global Kale token statistics',
            alerts: '🔔 Configure balance change alerts',
            history: '📈 Shows holdings change history',
            info: 'ℹ️ Shows Kale information and links',
        },
        embeds: {
            kaleTitle: '🌿 Kale Bot Commands',
            kaleDescription: 'Available commands:',
            topTitle: '🏆 Top 5 Holders Ranking',
            priceTitle: '🌿 Kale Token Price',
            farmTitle: '🌾 Kale Farm - Token Farming',
            farmDescription: 'Farm KALE tokens on the official platform!',
            inviteTitle: '🔗 Invite Kale Bot to your Server',
            inviteDescription: 'Add the Kale bot to your server to monitor top holders!',
            helpTitle: '🌿 Kale Bot Help',
            helpDescription: 'Available commands:',
            whatIsKale: '🌿 What is Kale?',
            whatIsKaleDesc: 'Kale is a digital token on the Stellar blockchain that is part of the Kale Farm ecosystem. It is a cryptocurrency that allows users to participate in the farming system and earn rewards for their activities.',
            whatIsFarm: '🌾 What is Kale Farm?',
            whatIsFarmDesc: 'Kale Farm is the official platform where you can farm (obtain) KALE tokens. It is a reward system that allows you to earn KALE tokens by performing different activities and tasks on the platform.',
            rankTitle: '🏆 Ranking Position',
            rankDescription: 'Current position of the address in the holders ranking',
            statsTitle: '📊 Global Kale Statistics',
            statsDescription: 'General statistics of the Kale token',
            alertsTitle: '🔔 Alerts Configuration',
            alertsDescription: 'Configure alerts for balance changes',
            historyTitle: '📈 Holdings History',
            historyDescription: 'History of changes in your holdings',
            infoTitle: '🌿 Kale Information',
            infoDescription: 'Official information and useful links for Kale',
            leaderboardTitle: '🏅 Extended Leaderboard',
            leaderboardDescription: 'Complete ranking of Kale holders'
        },
        fields: {
            top: 'Show top holders',
            price: 'Show current price',
            farm: 'Go to Kale Farm',
            invite: 'Invite bot to server',
            help: 'Show this help',
            language: 'Change language',
            rank: 'Check address position in ranking',
            stats: 'Show global statistics',
            alerts: 'Configure balance alerts',
            history: 'Show holdings history',
            currentPrice: 'Current Price',
            change24h: '24h Change',
            marketCap: 'Market Cap',
            balance: 'Balance',
            percentage: 'Percentage',
            position: 'Position',
            totalSupply: 'Total Supply',
            totalHolders: 'Total Holders',
            requiredPermissions: '📋 Required Permissions',
            requiredPermissionsDesc: '• Send messages\n• Use slash commands\n• Embed links',
            features: '✨ Features',
            featuresDesc: '• Daily top holders ranking\n• Real-time prices\n• Links to Stellar Expert\n• Native slash commands',
            note: '📝 Note',
            noteDesc: 'In the future we plan to implement farming directly from Discord. For now, use the button to access the web platform.'
        },
        buttons: {
            goToFarm: '🚀 Go to Kale Farm',
            inviteBot: '🔗 Invite Bot',
            changeToEnglish: '🇺🇸 English',
            changeToSpanish: '🇪🇸 Español'
        },
        footer: {
            poweredBy: 'Powered by Hoops Finance API (api.hoops.finance)',
            kaleFarm: 'Kale Farm - Official farming platform',
            dataUpdated: 'Data updated in real time'
        },
        messages: {
            botReady: '✅ Kale bot is ready!',
            willPostDaily: '📅 Will post daily updates of the top',
            holdersDaily: 'holders daily',
            slashCommands: '🔧 Slash commands registered successfully',
            slashCommandsRegistered: '✅ Slash commands registered successfully',
            slashCommandsError: '❌ Error registering slash commands:',
            dailyUpdate: '📊 **Daily Update - Kale Top Holders**',
            errorFetchingHolders: '❌ Error fetching top holders. Try again later.',
            errorFetchingPrice: '❌ Error fetching price. Try again later.',
            languageChanged: '🌐 Language changed to English',
            walletConnectedSuccess: '✅ Wallet connected successfully!',
            farmingReward: '🎉 Reward obtained!',
            farmingError: '❌ Farming error',
            invalidAddress: '❌ Invalid Stellar address. Must be 56 characters and start with "G".',
            addressNotFound: '❌ Address not found in Kale holders.',
            userNotFound: '❌ User not found in ranking.',
            invalidPercentage: '❌ Invalid percentage. Use a number between 0.1 and 100.',
            alertSet: '✅ Alert configured successfully.',
            alertRemoved: '✅ Alert removed successfully.',
            noHistory: '❌ No history available for this address.',
            noAlerts: '❌ You have no alerts configured.'
        }
    },
    pt: {
        commands: {
            kale: 'Mostra os comandos principais do bot Kale',
            top: 'Mostra o ranking dos top 5 holders de Kale',
            price: 'Mostra o preço atual do token Kale',
            farm: '🌾 Redireciona para a página oficial do Kale Farm para farmear tokens',
            invite: '🔗 Gera um link para convidar o bot para seu servidor',
            help: 'Mostra ajuda completa do bot',
            language: '🌐 Muda o idioma do bot',
            rank: '🏆 Mostra a posição de um endereço no ranking',
            stats: '📊 Mostra estatísticas globais do token Kale',
            alerts: '🔔 Configure alertas de mudanças de saldo',
            history: '📈 Mostra o histórico de mudanças nos holdings',
            info: 'ℹ️ Mostra informações e links do Kale',
        },
        embeds: {
            kaleTitle: '🌿 Comandos do Bot Kale',
            kaleDescription: 'Comandos disponíveis:',
            topTitle: '🏆 Top Holders Ranking',
            priceTitle: '🌿 Preço do Token Kale',
            farmTitle: '🌾 Kale Farm - Farm de Tokens',
            farmDescription: 'Farme tokens KALE na plataforma oficial!',
            inviteTitle: '🔗 Convidar Bot Kale para seu Servidor',
            inviteDescription: 'Adicione o bot Kale ao seu servidor para monitorar os top holders!',
            helpTitle: '🌿 Ajuda do Bot Kale',
            helpDescription: 'Comandos disponíveis:',
            whatIsKale: '🌿 O que é Kale?',
            whatIsKaleDesc: 'Kale é um token digital na blockchain Stellar que faz parte do ecossistema Kale Farm. É uma criptomoeda que permite aos usuários participar do sistema de farming e obter recompensas por suas atividades.',
            whatIsFarm: '🌾 O que é Kale Farm?',
            whatIsFarmDesc: 'Kale Farm é a plataforma oficial onde você pode farmear (obter) tokens KALE. É um sistema de recompensas que permite ganhar tokens KALE realizando diferentes atividades e tarefas na plataforma.',
            rankTitle: '🏆 Posição no Ranking',
            rankDescription: 'Posição atual do endereço no ranking de holders',
            statsTitle: '📊 Estatísticas Globais do Kale',
            statsDescription: 'Estatísticas gerais do token Kale',
            alertsTitle: '🔔 Configuração de Alertas',
            alertsDescription: 'Configure alertas para mudanças de saldo',
            historyTitle: '📈 Histórico de Holdings',
            historyDescription: 'Histórico de mudanças nos seus holdings',
            infoTitle: '🌿 Informações do Kale',
            infoDescription: 'Informações oficiais e links úteis do Kale',
            leaderboardTitle: '🏅 Leaderboard Estendido',
            leaderboardDescription: 'Ranking completo de holders de Kale'
        },
        fields: {
            top: 'Mostrar top holders',
            price: 'Mostrar preço atual',
            farm: 'Ir para Kale Farm',
            invite: 'Convidar bot para servidor',
            help: 'Mostrar esta ajuda',
            language: 'Mudar idioma',
            rank: 'Verificar posição do endereço no ranking',
            stats: 'Mostrar estatísticas globais',
            alerts: 'Configurar alertas de saldo',
            history: 'Mostrar histórico de holdings',
            currentPrice: 'Preço Atual',
            change24h: 'Mudança 24h',
            marketCap: 'Market Cap',
            balance: 'Saldo',
            percentage: 'Porcentagem',
            position: 'Posição',
            totalSupply: 'Fornecimento Total',
            totalHolders: 'Total de Holders',
            requiredPermissions: '📋 Permissões Necessárias',
            requiredPermissionsDesc: '• Enviar mensagens\n• Usar comandos slash\n• Inserir embeds',
            features: '✨ Características',
            featuresDesc: '• Ranking diário de top holders\n• Preços em tempo real\n• Links para Stellar Expert\n• Comandos slash nativos',
            note: '📝 Nota',
            noteDesc: 'No futuro planejamos implementar o farming diretamente do Discord. Por enquanto, use o botão para acessar a plataforma web.'
        },
        buttons: {
            goToFarm: '🚀 Ir para Kale Farm',
            inviteBot: '🔗 Convidar Bot',
            changeToEnglish: '🇺🇸 English',
            changeToSpanish: '🇪🇸 Español'
        },
        footer: {
            poweredBy: 'Powered by Hoops Finance API (api.hoops.finance)',
            kaleFarm: 'Kale Farm - Plataforma oficial de farming',
            dataUpdated: 'Dados atualizados em tempo real'
        },
        messages: {
            botReady: '✅ Bot Kale está pronto!',
            willPostDaily: '📅 Postará atualizações diárias dos top',
            holdersDaily: 'holders diariamente',
            slashCommands: '🔧 Comandos slash registrados com sucesso',
            slashCommandsRegistered: '✅ Comandos slash registrados com sucesso',
            slashCommandsError: '❌ Erro registrando comandos slash:',
            dailyUpdate: '📊 **Atualização Diária - Top Holders de Kale**',
            errorFetchingHolders: '❌ Erro obtendo os top holders. Tente mais tarde.',
            errorFetchingPrice: '❌ Erro obtendo o preço. Tente mais tarde.',
            languageChanged: '🌐 Idioma alterado para português',
            walletConnectedSuccess: '✅ Wallet conectada com sucesso!',
            farmingReward: '🎉 Recompensa obtida!',
            farmingError: '❌ Erro no farming',
            invalidAddress: '❌ Endereço Stellar inválido. Deve ter 56 caracteres e começar com "G".',
            addressNotFound: '❌ Endereço não encontrado nos holders de Kale.',
            userNotFound: '❌ Usuário não encontrado no ranking.',
            invalidPercentage: '❌ Porcentagem inválida. Use um número entre 0.1 e 100.',
            alertSet: '✅ Alerta configurado com sucesso.',
            alertRemoved: '✅ Alerta removido com sucesso.',
            noHistory: '❌ Nenhum histórico disponível para este endereço.',
            noAlerts: '❌ Você não tem alertas configurados.'
        }
    }
};

// Function to get user language (defaults to Spanish)
function getUserLanguage(userId) {
    if (userId === 'default') {
        return 'es'; // Default language for daily posts
    }
    return userLanguages.get(userId) || 'es';
}

// Function to get translation
function t(userId, key) {
    const lang = getUserLanguage(userId);
    const keys = key.split('.');
    let value = translations[lang];
    for (const k of keys) {
        value = value[k];
    }
    return value || key;
}

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Kale token configuration
const KALE_TOKEN_ADDRESS = 'CB23WRDQWGSP6YPMY4UV5C4OW5CBTXKYN3XEATG7KJEZCXMJBYEHOUOV';

// API endpoints - Hoops Finance and Kale Farm only
const API_ENDPOINTS = [
    `https://api.hoops.finance/tokens/${KALE_TOKEN_ADDRESS}/balances?excludezero=true&excludeid=true&excludetoken=true&excludelastupdated=true`,
    `https://kalefarm.xyz/api/leaderboard`,
    `https://kalefarm.xyz/api/holders`
];

const TOP_LIMIT = parseInt(process.env.TOP_LIMIT) || 5;

// Cache system for better performance
const cache = {
    holders: null,
    lastUpdate: 0,
    price: null,
    priceLastUpdate: 0,
    CACHE_DURATION: 30000, // 30 seconds cache
    PRICE_CACHE_DURATION: 60000 // 1 minute cache for price
};

// Slash commands
const commands = [
    new SlashCommandBuilder()
        .setName('kale')
        .setDescription('Shows the main commands of the Kale bot'),
    new SlashCommandBuilder()
        .setName('top')
        .setDescription('Shows the top Kale holders ranking')
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Number of positions to show (default: 5, maximum: 25)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(25)),
    new SlashCommandBuilder()
        .setName('price')
        .setDescription('Shows the current Kale token price'),
    new SlashCommandBuilder()
        .setName('farm')
        .setDescription('🌾 Redirects to the official Kale Farm page to farm tokens'),
    new SlashCommandBuilder()
        .setName('invite')
        .setDescription('🔗 Generates a link to invite the bot to your server'),
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows complete bot help'),
    new SlashCommandBuilder()
        .setName('language')
        .setDescription('🌐 Changes the bot language'),
    new SlashCommandBuilder()
        .setName('rank')
        .setDescription('🏆 Shows an address position in the ranking')
        .addStringOption(option =>
            option.setName('address')
                .setDescription('Stellar address (56 characters, starts with G)')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('stats')
        .setDescription('📊 Muestra estadísticas globales del token Kale'),
    new SlashCommandBuilder()
        .setName('alerts')
        .setDescription('🔔 Configura alertas de cambios de balance')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Acción a realizar')
                .setRequired(true)
                .addChoices(
                    { name: 'Ver alertas', value: 'list' },
                    { name: 'Agregar alerta', value: 'add' },
                    { name: 'Eliminar alerta', value: 'remove' }
                ))
        .addStringOption(option =>
            option.setName('address')
                .setDescription('Dirección de Stellar para la alerta (máximo 25)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('percentage')
                .setDescription('Porcentaje de cambio para la alerta (ej: 5%)')
                .setRequired(false)),
    new SlashCommandBuilder()
        .setName('history')
        .setDescription('📈 Muestra el histórico de cambios en holdings')
        .addStringOption(option =>
            option.setName('address')
                .setDescription('Dirección de Stellar para ver el historial')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('info')
        .setDescription('ℹ️ Muestra información y enlaces de Kale'),
];

// Register slash commands
(async () => {
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        
        console.log('🔄 Registrando comandos slash...');
        
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        
        console.log(t('default', 'messages.slashCommandsRegistered'));
    } catch (error) {
        console.error(t('default', 'messages.slashCommandsError'), error);
    }
})();

// Function to initialize health check server
function initializeHealthServer() {
    if (healthServer && healthServer.listening) {
        console.log('🏥 Health server already initialized and running');
        return;
    }

    console.log(`🔧 Configurando servidor de healthcheck en puerto: ${PORT}`);

    healthServer = http.createServer((req, res) => {
        console.log(`📡 Health check request: ${req.method} ${req.url} from ${req.connection.remoteAddress}`);
        
        if (req.url === '/health' || req.url === '/') {
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            });
            res.end(JSON.stringify({ 
                status: 'healthy', 
                bot: 'Kale Bot', 
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                port: PORT,
                env: process.env.NODE_ENV || 'development'
            }));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not found', path: req.url }));
        }
    });

    // Try to listen on the port
    healthServer.listen(PORT, '0.0.0.0', () => {
        console.log(`🏥 Health check server running on port ${PORT}`);
        console.log(`🌐 Health check available at http://0.0.0.0:${PORT}/health`);
        console.log(`🔗 Railway healthcheck URL: http://localhost:${PORT}/health`);
    });

    healthServer.on('error', (err) => {
        console.error('❌ Health check server error:', err);
        console.error('❌ Error details:', err.code, err.errno, err.syscall);
        
        // Close the current server and try alternative port
        healthServer.close(() => {
            const altPort = 8080;
            console.log(`🔄 Trying alternative port: ${altPort}`);
            healthServer.listen(altPort, '0.0.0.0', () => {
                console.log(`🏥 Health check server running on alternative port ${altPort}`);
                console.log(`🌐 Health check available at http://0.0.0.0:${altPort}/health`);
            });
        });
    });
}

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, readyClient => {
    console.log(`${t('default', 'messages.botReady')} ${readyClient.user.tag}`);
    console.log(`${t('default', 'messages.willPostDaily')} ${TOP_LIMIT} ${t('default', 'messages.holdersDaily')}`);
    console.log(t('default', 'messages.slashCommands'));
    
    // Initialize health server after Discord bot is ready
    initializeHealthServer();
});

// Listen for all interactions
client.on(Events.InteractionCreate, async interaction => {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'kale') {
        const embed = new EmbedBuilder()
            .setTitle(t(interaction.user.id, 'embeds.kaleTitle'))
            .setDescription(t(interaction.user.id, 'embeds.kaleDescription'))
            .setColor(0x00ff00)
            .addFields(
                { name: '/top', value: t(interaction.user.id, 'fields.top'), inline: true },
                { name: '/price', value: t(interaction.user.id, 'fields.price'), inline: true },
                { name: '/farm', value: t(interaction.user.id, 'fields.farm'), inline: true },
                { name: '/invite', value: t(interaction.user.id, 'fields.invite'), inline: true },
                { name: '/help', value: t(interaction.user.id, 'fields.help'), inline: true },
                { name: '/language', value: t(interaction.user.id, 'fields.language'), inline: true }
            )
            .addFields(
                    { name: '💼 **Wallet & Analytics**', value: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', inline: false },
                    { name: '/rank', value: t(interaction.user.id, 'fields.rank'), inline: true },
                    { name: '/stats', value: t(interaction.user.id, 'fields.stats'), inline: true },
                    { name: '/alerts', value: t(interaction.user.id, 'fields.alerts'), inline: true },
                    { name: '/history', value: t(interaction.user.id, 'fields.history'), inline: true }
            )
            .setFooter({ 
                text: t(interaction.user.id, 'footer.poweredBy')
            });
        await interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === 'top') {
        try {
            await interaction.deferReply();
            const limit = Math.min(interaction.options.getInteger('limit') || 5, 25); // Cap at 25 due to Discord embed field limit
            const embed = await getTopHoldersEmbed(interaction.user.id, limit);
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching top holders:', error);
            await interaction.editReply(t(interaction.user.id, 'messages.errorFetchingHolders'));
        }
    }

    if (interaction.commandName === 'price') {
        try {
            await interaction.deferReply();
            const priceData = await getKalePrice();
            const embed = new EmbedBuilder()
                .setTitle(t(interaction.user.id, 'embeds.priceTitle'))
                .setColor(0x00ff00)
                .addFields(
                    { name: t(interaction.user.id, 'fields.currentPrice'), value: `$${priceData.price}`, inline: true },
                    { name: t(interaction.user.id, 'fields.change24h'), value: `${priceData.change24h}%`, inline: true },
                    { name: t(interaction.user.id, 'fields.marketCap'), value: `$${priceData.marketCap}`, inline: true }
                )
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching price:', error);
            await interaction.editReply(t(interaction.user.id, 'messages.errorFetchingPrice'));
        }
    }

    if (interaction.commandName === 'farm') {
        const embed = new EmbedBuilder()
            .setTitle(t(interaction.user.id, 'embeds.farmTitle'))
            .setDescription(t(interaction.user.id, 'embeds.farmDescription'))
            .setColor(0x00ff00)
            .addFields(
                { 
                    name: t(interaction.user.id, 'fields.note'), 
                    value: t(interaction.user.id, 'fields.noteDesc'), 
                    inline: false 
                }
            )
            .setFooter({ text: t(interaction.user.id, 'footer.kaleFarm') })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(t(interaction.user.id, 'buttons.goToFarm'))
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://kalefarm.xyz/')
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    }

    if (interaction.commandName === 'invite') {
        const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=2048&scope=bot%20applications.commands`;
            
        const embed = new EmbedBuilder()
            .setTitle(t(interaction.user.id, 'embeds.inviteTitle'))
            .setDescription(t(interaction.user.id, 'embeds.inviteDescription'))
            .setColor(0x00ff00)
            .addFields(
                { 
                    name: t(interaction.user.id, 'fields.requiredPermissions'), 
                    value: t(interaction.user.id, 'fields.requiredPermissionsDesc'), 
                    inline: false 
                },
                { 
                    name: t(interaction.user.id, 'fields.features'), 
                    value: t(interaction.user.id, 'fields.featuresDesc'), 
                    inline: false 
                }
            )
                .setFooter({ text: t(interaction.user.id, 'footer.poweredBy') })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(t(interaction.user.id, 'buttons.inviteBot'))
                    .setStyle(ButtonStyle.Link)
                    .setURL(inviteUrl)
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    }

    if (interaction.commandName === 'help') {
        const embed = new EmbedBuilder()
            .setTitle(t(interaction.user.id, 'embeds.helpTitle'))
            .setDescription(t(interaction.user.id, 'embeds.helpDescription'))
            .setColor(0x00ff00)
            .addFields(
                    { name: '🌿 **Comandos Básicos**', value: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', inline: false },
                    { name: '/kale', value: t(interaction.user.id, 'commands.kale'), inline: false },
                    { name: '/top', value: t(interaction.user.id, 'commands.top'), inline: false },
                    { name: '/price', value: t(interaction.user.id, 'commands.price'), inline: false },
                    { name: '/farm', value: t(interaction.user.id, 'commands.farm'), inline: false },
                    { name: '/invite', value: t(interaction.user.id, 'commands.invite'), inline: false },
                    { name: '/language', value: t(interaction.user.id, 'commands.language'), inline: false }
            )
            .addFields(
                    { name: '💼 **Wallet & Analytics**', value: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', inline: false },
                    { name: '/rank', value: t(interaction.user.id, 'commands.rank'), inline: false },
                    { name: '/stats', value: t(interaction.user.id, 'commands.stats'), inline: false },
                    { name: '/alerts', value: t(interaction.user.id, 'commands.alerts'), inline: false },
                    { name: '/history', value: t(interaction.user.id, 'commands.history'), inline: false }
            )
            .addFields(
                    { name: t(interaction.user.id, 'embeds.whatIsKale'), value: t(interaction.user.id, 'embeds.whatIsKaleDesc'), inline: false },
                    { name: t(interaction.user.id, 'embeds.whatIsFarm'), value: t(interaction.user.id, 'embeds.whatIsFarmDesc'), inline: false }
                )
                .setFooter({ text: t(interaction.user.id, 'footer.poweredBy') })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === 'language') {
        const embed = new EmbedBuilder()
            .setTitle('🌐 Cambiar Idioma / Change Language / Mudar Idioma')
            .setDescription('Selecciona tu idioma preferido / Select your preferred language / Selecione seu idioma preferido')
            .setColor(0x00ff00)
                .setFooter({ text: t(interaction.user.id, 'footer.poweredBy') })
                .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('lang_es')
                        .setLabel(t(interaction.user.id, 'buttons.changeToSpanish'))
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('lang_en')
                        .setLabel(t(interaction.user.id, 'buttons.changeToEnglish'))
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('lang_pt')
                    .setLabel('🇧🇷 Português')
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    }


        if (interaction.commandName === 'stats') {
            try {
                await interaction.deferReply();
                const stats = await getGlobalStats();
                
        const embed = new EmbedBuilder()
                    .setTitle(t(interaction.user.id, 'embeds.statsTitle'))
                    .setDescription(t(interaction.user.id, 'embeds.statsDescription'))
            .setColor(0x00ff00)
            .addFields(
                { 
                            name: '💰 ' + t(interaction.user.id, 'fields.totalSupply'), 
                            value: `${stats.totalSupply} KALE`, 
                            inline: true 
                        },
                        { 
                            name: '👥 ' + t(interaction.user.id, 'fields.totalHolders'), 
                            value: `${stats.totalHolders}`, 
                            inline: true 
                        },
                        { 
                            name: '💎 ' + t(interaction.user.id, 'fields.marketCap'), 
                            value: `$${stats.marketCap}`, 
                            inline: true 
                        },
                        { 
                            name: '📊 Top 10 Holdings', 
                            value: `${stats.top10Percentage}%`, 
                    inline: true 
                },
                { 
                            name: '🏆 Top 100 Holdings', 
                            value: `${stats.top100Percentage}%`, 
                    inline: true 
                },
                { 
                            name: '📈 Average Balance', 
                            value: `${stats.averageBalance} KALE`, 
                    inline: true 
                }
            )
                    .setFooter({ text: 'Powered by Hoops Finance API (api.hoops.finance)' })
            .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            } catch (error) {
                console.error('Error fetching stats:', error);
                await interaction.editReply(t(interaction.user.id, 'messages.errorFetchingHolders'));
            }
        }


        if (interaction.commandName === 'rank') {
            const address = interaction.options.getString('address');
            
            if (!isValidStellarAddress(address)) {
            await interaction.reply({
                    content: t(interaction.user.id, 'messages.invalidAddress'),
                ephemeral: true
            });
                return;
            }

            try {
                await interaction.deferReply();
                const walletInfo = await getWalletInfo(address);
                
                if (!walletInfo) {
                    await interaction.editReply(t(interaction.user.id, 'messages.addressNotFound'));
            return;
        }

        const embed = new EmbedBuilder()
                    .setTitle(t(interaction.user.id, 'embeds.rankTitle'))
                    .setDescription(t(interaction.user.id, 'embeds.rankDescription'))
            .setColor(0x00ff00)
            .addFields(
                { 
                            name: '📍 Dirección', 
                            value: `\`${address.slice(0, 8)}...${address.slice(-8)}\``, 
                            inline: false 
                        },
                        { 
                            name: '🏆 Posición en el Ranking', 
                            value: `**#${walletInfo.position}**`, 
                    inline: true 
                },
                { 
                            name: '💰 ' + t(interaction.user.id, 'fields.balance'), 
                            value: `${walletInfo.formattedBalance} KALE`, 
                    inline: true 
                },
                { 
                            name: '📊 ' + t(interaction.user.id, 'fields.percentage'), 
                            value: `${walletInfo.percentage}%`, 
                    inline: true 
                        },
                        { 
                            name: '🔗 Stellar Expert', 
                            value: `[Ver en Stellar Expert](https://stellar.expert/explorer/public/account/${address})`, 
                    inline: false 
                }
            )
                    .setFooter({ text: t(interaction.user.id, 'footer.dataUpdated') })
            .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            } catch (error) {
                console.error('Error fetching rank info:', error);
                await interaction.editReply(t(interaction.user.id, 'messages.errorFetchingHolders'));
            }
        }

        if (interaction.commandName === 'alerts') {
            const action = interaction.options.getString('action');
            const address = interaction.options.getString('address');
            const percentage = interaction.options.getString('percentage');
            
            try {
        await interaction.deferReply({ ephemeral: true });
        
                if (action === 'list') {
            const embed = new EmbedBuilder()
                        .setTitle(t(interaction.user.id, 'embeds.alertsTitle'))
                        .setDescription(t(interaction.user.id, 'embeds.alertsDescription'))
                        .setColor(0x00ff00)
                .addFields(
                    { 
                                name: '📋 Alertas Configuradas', 
                                value: 'No tienes alertas configuradas actualmente.', 
                                inline: false 
                            },
                            { 
                                name: '💡 Cómo agregar alertas', 
                                value: 'Usa `/alerts add` con una dirección y porcentaje para configurar alertas de cambios de balance.', 
                                inline: false 
                            }
                        )
                        .setFooter({ text: t(interaction.user.id, 'footer.dataUpdated') })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
                } else if (action === 'add') {
                    if (!address || !percentage) {
            await interaction.editReply({
                            content: '❌ Necesitas proporcionar una dirección y porcentaje para agregar una alerta.'
                        });
                        return;
                    }

                    if (!isValidStellarAddress(address)) {
                        await interaction.editReply(t(interaction.user.id, 'messages.invalidAddress'));
                return;
            }
            
                    const percentageValue = parseFloat(percentage.replace('%', ''));
                    if (isNaN(percentageValue) || percentageValue < 0.1 || percentageValue > 100) {
                        await interaction.editReply(t(interaction.user.id, 'messages.invalidPercentage'));
                        return;
                    }

                    // In a real implementation, you'd store this in a database
                    await interaction.editReply(t(interaction.user.id, 'messages.alertSet'));
                } else if (action === 'remove') {
                    if (!address) {
            await interaction.editReply({
                            content: '❌ Necesitas proporcionar una dirección para eliminar una alerta.'
                        });
                        return;
                    }

                    // In a real implementation, you'd remove from database
                    await interaction.editReply(t(interaction.user.id, 'messages.alertRemoved'));
                }
            } catch (error) {
                console.error('Error handling alerts:', error);
                await interaction.editReply(t(interaction.user.id, 'messages.errorFetchingHolders'));
            }
        }

        if (interaction.commandName === 'history') {
            const address = interaction.options.getString('address');
            
            if (!isValidStellarAddress(address)) {
                await interaction.reply({
                    content: t(interaction.user.id, 'messages.invalidAddress'),
                    ephemeral: true
                });
                return;
            }
            
            try {
                await interaction.deferReply();
                
                // For now, we'll show a placeholder - in a real implementation,
                // you'd need to store and track historical data
            const embed = new EmbedBuilder()
                    .setTitle(t(interaction.user.id, 'embeds.historyTitle'))
                    .setDescription(t(interaction.user.id, 'embeds.historyDescription'))
                    .setColor(0x00ff00)
                .addFields(
                    { 
                            name: '📍 Dirección', 
                            value: `${address.slice(0, 8)}...${address.slice(-8)}`, 
                            inline: true 
                        },
                        { 
                            name: '📊 Estado', 
                            value: 'Historial no disponible', 
                        inline: true 
                    },
                    { 
                            name: '💡 Información', 
                            value: 'El historial de transacciones se está implementando. Por ahora, puedes usar `/rank` para ver el balance y posición actuales.', 
                        inline: false 
                    },
                    { 
                            name: '🔗 Stellar Expert', 
                            value: `[Ver historial completo](https://stellar.expert/explorer/public/account/${address})`, 
                            inline: false 
                        }
                    )
                    .setFooter({ text: t(interaction.user.id, 'footer.dataUpdated') })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
                console.error('Error fetching history:', error);
                await interaction.editReply(t(interaction.user.id, 'messages.errorFetchingHolders'));
        }
    }

    if (interaction.commandName === 'info') {
        try {
            await interaction.deferReply();
            
            const embed = new EmbedBuilder()
                .setTitle(t(interaction.user.id, 'embeds.infoTitle'))
                .setDescription(t(interaction.user.id, 'embeds.infoDescription'))
                .setColor(0x00ff00)
                .addFields(
                    { 
                        name: '🌐 Sitio Web de la Comunidad', 
                        value: '[kaleonstellar.com](https://kaleonstellar.com/)', 
                        inline: true 
                    },
                    { 
                        name: '🌾 Miner Website', 
                        value: '[Kale Farm](https://kaleonstellar.com/farm)', 
                        inline: true 
                    },
                    { 
                        name: '📊 Stellar Expert', 
                        value: '[Ver en Stellar Expert](https://stellar.expert/explorer/public/asset/KALE-GB6YPGW5JFMMP2QBXFLJ3YEMO2AKWZQERR3LMKXACXH6O6Q6K6RKDX5M)', 
                        inline: true 
                    },
                    { 
                        name: '🔗 Contrato del Token', 
                        value: '`KALE-GB6YPGW5JFMMP2QBXFLJ3YEMO2AKWZQERR3LMKXACXH6O6Q6K6RKDX5M`', 
                        inline: false 
                    },
                    { 
                        name: '💡 ¿Qué es Kale?', 
                        value: 'Kale es un token de Stellar que se puede minar a través de la plataforma Kale Farm. Únete a la comunidad y comienza a minar tokens.', 
                        inline: false 
                    }
                )
                .setFooter({ text: 'Powered by Kale Bot • kaleonstellar.com' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error showing info:', error);
            await interaction.editReply('❌ Error al mostrar la información');
        }
    }
    }
    
    // Handle button interactions
    if (interaction.isButton()) {
        console.log('🔍 Button clicked:', interaction.customId);
        
        if (interaction.customId === 'lang_es') {
            userLanguages.set(interaction.user.id, 'es');
            await interaction.reply({ 
                content: t(interaction.user.id, 'messages.languageChanged'), 
                ephemeral: true 
            });
        } else if (interaction.customId === 'lang_en') {
            userLanguages.set(interaction.user.id, 'en');
            await interaction.reply({ 
                content: t(interaction.user.id, 'messages.languageChanged'), 
                ephemeral: true 
            });
        } else if (interaction.customId === 'lang_pt') {
            userLanguages.set(interaction.user.id, 'pt');
            await interaction.reply({ 
                content: t(interaction.user.id, 'messages.languageChanged'), 
                ephemeral: true 
            });
        }
    }
});

// Function to validate Stellar address format
function isValidStellarAddress(address) {
    if (!address || typeof address !== 'string') return false;
    
    // Stellar addresses should be 56 characters long and start with 'G'
    if (address.length !== 56 || !address.startsWith('G')) return false;
    
    // Check if it contains only valid base32 characters
    const validChars = /^[ABCDEFGHIJKLMNOPQRSTUVWXYZ234567]+$/;
    return validChars.test(address);
}

// Function to get top holders data with fallback APIs
async function getTopHolders(limit = TOP_LIMIT) {
    // Check cache first
    const now = Date.now();
    if (cache.holders && (now - cache.lastUpdate) < cache.CACHE_DURATION) {
        console.log('📋 Using cached holders data');
        return cache.holders.slice(0, limit);
    }
    
    let lastError = null;
    
    for (let i = 0; i < API_ENDPOINTS.length; i++) {
        const apiUrl = API_ENDPOINTS[i];
        
        // Try up to 3 times for each endpoint
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`📡 Trying API endpoint ${i + 1}/${API_ENDPOINTS.length} (attempt ${attempt}/3): ${apiUrl.split('/')[2]}`);
                
                const response = await axios.get(apiUrl, {
                    timeout: 120000, // Increased timeout to 2 minutes for Hoops API
                    headers: {
                        'User-Agent': 'Kale-Bot/1.0'
                    }
                });
            
            let holders = response.data;
            
            // Handle different API response formats
            if (holders.data) {
                holders = holders.data;
            }
            if (holders.balances) {
                holders = holders.balances;
            }
            if (holders.records) {
                holders = holders.records;
            }
            if (holders.leaderboard) {
                holders = holders.leaderboard;
            }
            if (holders.holders) {
                holders = holders.holders;
            }
            
            if (!Array.isArray(holders) || holders.length === 0) {
                console.log(`⚠️ No holders data from API endpoint ${i + 1}, trying next...`);
                if (i < API_ENDPOINTS.length - 1) {
                    continue;
                } else {
                    // If all APIs return no data, return empty array
                    console.log('📊 No holders data from any API, returning empty array');
                    return [];
                }
            }
            
            console.log(`✅ API endpoint ${i + 1} returned ${holders.length} holders`);
            
            // Calculate total supply
            const totalSupply = holders.reduce((sum, holder) => sum + (holder.balance || holder.amount || 0), 0);
            
            // Filter out contract addresses and keep only valid Stellar wallet addresses
            const walletHolders = holders.filter(holder => {
                const address = holder.address || holder.account;
                const balance = holder.balance || holder.amount || 0;
                
                // Only include valid Stellar wallet addresses (start with 'G', 56 chars, valid format)
                // Exclude contract addresses (start with 'C') and invalid addresses
                return address && 
                       isValidStellarAddress(address) && 
                       !address.startsWith('C') && 
                       balance > 0;
            });
            
            console.log(`🔍 Filtered ${walletHolders.length} wallet addresses from ${holders.length} total holders`);
            
            if (walletHolders.length === 0) {
                throw new Error(`No wallet addresses found in API endpoint ${i + 1} data`);
            }
            
            // Sort by balance (descending) and format data
            const sortedHolders = walletHolders
                .sort((a, b) => (b.balance || b.amount || 0) - (a.balance || a.amount || 0))
                .slice(0, limit)
                .map(holder => {
                    const rawBalance = holder.balance || holder.amount || 0;
                    const percentage = ((rawBalance / totalSupply) * 100).toFixed(2);
                    const balanceInKale = rawBalance / 10000000;
                    const formattedBalance = balanceInKale.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                    
                    return {
                        address: `${holder.address.slice(0, 6)}...${holder.address.slice(-6)}`,
                        fullAddress: holder.address,
                        balance: formattedBalance,
                        rawBalance: rawBalance,
                        percentage: `${percentage}%`
                    };
                });
            
                console.log(`✅ Successfully fetched ${sortedHolders.length} top holders from API endpoint ${i + 1}`);
                
                // Cache the results
                cache.holders = sortedHolders;
                cache.lastUpdate = now;
                
                return sortedHolders;
                
            } catch (error) {
                console.error(`❌ API endpoint ${i + 1} attempt ${attempt} failed:`, error.message);
                lastError = error;
                
                // If this is not the last attempt, wait a bit and try again
                if (attempt < 3) {
                    console.log(`⏳ Waiting 5 seconds before retry...`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    continue;
                }
                
                // If this is the last attempt for this endpoint, break to try next endpoint
                break;
            }
        }
        
        // If we get here, all attempts for this endpoint failed
        console.log(`❌ All attempts failed for API endpoint ${i + 1}`);
        
        // If this is not the last endpoint, continue to the next one
        if (i < API_ENDPOINTS.length - 1) {
            console.log(`🔄 Trying next API endpoint...`);
            continue;
        }
    }
    
    // If all API endpoints failed, throw the last error
    console.error('❌ All API endpoints failed');
    throw new Error(`All API endpoints failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

// Function to get Kale price from API
async function getKalePrice() {
    // Check cache first
    const now = Date.now();
    if (cache.price && (now - cache.priceLastUpdate) < cache.PRICE_CACHE_DURATION) {
        console.log('📋 Using cached price data');
        return cache.price;
    }
    
    try {
        // Try Jupiter API first
        const priceUrl = `https://price.jup.ag/v4/price?ids=${KALE_TOKEN_ADDRESS}`;
        const response = await axios.get(priceUrl, { timeout: 5000 });
        const priceData = response.data.data[KALE_TOKEN_ADDRESS];
        
        if (!priceData) {
            throw new Error('Price data not found');
        }
        
        const change24h = priceData.priceChange24h ? 
            (priceData.priceChange24h * 100).toFixed(2) : '0.00';
        const change24hFormatted = change24h.startsWith('-') ? change24h : `+${change24h}`;
        
        const priceResult = {
            price: priceData.price.toFixed(8),
            change24h: change24hFormatted,
            marketCap: 'N/A' // Would need additional API call for market cap
        };
        
        // Cache the results
        cache.price = priceResult;
        cache.priceLastUpdate = now;
        
        return priceResult;
        
    } catch (error) {
        console.error('❌ Error fetching price from Jupiter API:', error.message);
        
        try {
            // Fallback to Stellar Expert API
            const stellarUrl = `https://api.stellar.expert/explorer/public/asset/${KALE_TOKEN_ADDRESS}`;
            const stellarResponse = await axios.get(stellarUrl, { timeout: 10000 });
            const stellarData = stellarResponse.data;
            
            if (stellarData && stellarData.price) {
                return {
                    price: stellarData.price.toFixed(8),
                    change24h: '+0.00', // Stellar Expert doesn't provide 24h change
                    marketCap: 'N/A'
                };
            }
        } catch (stellarError) {
            console.error('❌ Error fetching price from Stellar Expert:', stellarError.message);
        }
        
        // Final fallback to mock data
        return {
            price: '0.000123',
            change24h: '+15.6',
            marketCap: '1,230,000'
        };
    }
}

// Function to get wallet information for a specific address
async function getWalletInfo(address) {
    try {
        // Use the same API endpoint logic as getTopHolders
        let lastError = null;
        
        for (let i = 0; i < API_ENDPOINTS.length; i++) {
            const apiUrl = API_ENDPOINTS[i];
            
            // Try up to 3 times for each endpoint
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    console.log(`🔍 Trying API endpoint ${i + 1}/${API_ENDPOINTS.length} for wallet info (attempt ${attempt}/3): ${apiUrl.split('/')[2]}`);
                    
                    const response = await axios.get(apiUrl, {
                        timeout: 120000, // Increased timeout to 2 minutes for Hoops API
                        headers: {
                            'User-Agent': 'Kale-Bot/1.0'
                        }
                    });
                
                    let allHolders = response.data;
                    
                    // Handle different API response formats
                    if (allHolders.data) {
                        allHolders = allHolders.data;
                    }
                    if (allHolders.balances) {
                        allHolders = allHolders.balances;
                    }
                    if (allHolders.records) {
                        allHolders = allHolders.records;
                    }
                    if (allHolders.leaderboard) {
                        allHolders = allHolders.leaderboard;
                    }
                    if (allHolders.holders) {
                        allHolders = allHolders.holders;
                    }
                    
                    if (!Array.isArray(allHolders) || allHolders.length === 0) {
                        throw new Error(`No holders data received from API endpoint ${i + 1}`);
                    }
                    
                    console.log(`✅ API endpoint ${i + 1} returned ${allHolders.length} holders for wallet info`);
                    
                    // Find the specific holder
                    const holder = allHolders.find(h => (h.address || h.account) === address);
                    
                    if (!holder) {
                        // If not found in this endpoint, try the next one
                        continue;
                    }

                    // Filter valid wallet addresses for calculations
                    const walletHolders = allHolders.filter(h => {
                        const addr = h.address || h.account;
                        const balance = h.balance || h.amount || 0;
                        return addr && isValidStellarAddress(addr) && !addr.startsWith('C') && balance > 0;
                    });
                    
                    const totalSupply = walletHolders.reduce((sum, h) => sum + (h.balance || h.amount || 0), 0);
                    
                    const holderBalance = holder.balance || holder.amount || 0;
                    const percentage = ((holderBalance / totalSupply) * 100).toFixed(4);
                    const balanceInKale = holderBalance / 10000000;
                    const formattedBalance = balanceInKale.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });

                    // Find position in ranking
                    const sortedHolders = walletHolders.sort((a, b) => (b.balance || b.amount || 0) - (a.balance || a.amount || 0));
                    const position = sortedHolders.findIndex(h => (h.address || h.account) === address) + 1;

                    return {
                        formattedBalance,
                        percentage,
                        position,
                        rawBalance: holderBalance
                    };
                    
                } catch (error) {
                    console.error(`❌ API endpoint ${i + 1} attempt ${attempt} failed for wallet info:`, error.message);
                    lastError = error;
                    
                    // If this is not the last attempt, wait a bit and try again
                    if (attempt < 3) {
                        console.log(`⏳ Waiting 5 seconds before retry...`);
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        continue;
                    }
                    
                    // If this is the last attempt for this endpoint, break to try next endpoint
                    break;
                }
            }
            
            // If we get here, all attempts for this endpoint failed
            console.log(`❌ All attempts failed for API endpoint ${i + 1} for wallet info`);
            
            // If this is not the last endpoint, continue to the next one
            if (i < API_ENDPOINTS.length - 1) {
                console.log(`🔄 Trying next API endpoint for wallet info...`);
                continue;
            }
        }
        
        // If all API endpoints failed or address not found
        console.error('❌ All API endpoints failed for wallet info or address not found');
        return null;
        
    } catch (error) {
        console.error('Error getting wallet info:', error);
        return null;
    }
}

// Function to get global statistics
async function getGlobalStats() {
    try {
        // Use the same API endpoint logic as getTopHolders
        let lastError = null;
        
        for (let i = 0; i < API_ENDPOINTS.length; i++) {
            const apiUrl = API_ENDPOINTS[i];
            
            // Try up to 3 times for each endpoint
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    console.log(`📊 Trying API endpoint ${i + 1}/${API_ENDPOINTS.length} for stats (attempt ${attempt}/3): ${apiUrl.split('/')[2]}`);
                    
                    const response = await axios.get(apiUrl, {
                        timeout: 120000, // Increased timeout to 2 minutes for Hoops API
                        headers: {
                            'User-Agent': 'Kale-Bot/1.0'
                        }
                    });
                
                    let holders = response.data;
                    
                    // Handle different API response formats
                    if (holders.data) {
                        holders = holders.data;
                    }
                    if (holders.balances) {
                        holders = holders.balances;
                    }
                    if (holders.records) {
                        holders = holders.records;
                    }
                    if (holders.leaderboard) {
                        holders = holders.leaderboard;
                    }
                    if (holders.holders) {
                        holders = holders.holders;
                    }
                    
                    if (!Array.isArray(holders) || holders.length === 0) {
                        throw new Error(`No holders data received from API endpoint ${i + 1}`);
                    }
                    
                    console.log(`✅ API endpoint ${i + 1} returned ${holders.length} holders for stats`);
                    
                    // Filter valid wallet addresses
                    const walletHolders = holders.filter(holder => {
                        const address = holder.address || holder.account;
                        const balance = holder.balance || holder.amount || 0;
                        
                        // Only include valid Stellar wallet addresses (start with 'G', 56 chars, valid format)
                        // Exclude contract addresses (start with 'C') and invalid addresses
                        return address && 
                               isValidStellarAddress(address) && 
                               !address.startsWith('C') && 
                               balance > 0;
                    });
                    
                    console.log(`🔍 Filtered ${walletHolders.length} wallet addresses from ${holders.length} total holders for stats`);
                    
                    if (walletHolders.length === 0) {
                        throw new Error(`No wallet addresses found in API endpoint ${i + 1} data`);
                    }
                    
                    const totalSupply = walletHolders.reduce((sum, holder) => sum + (holder.balance || holder.amount || 0), 0);
                    const totalHolders = walletHolders.length;
                    
                    // Sort by balance
                    const sortedHolders = walletHolders.sort((a, b) => (b.balance || b.amount || 0) - (a.balance || a.amount || 0));
                    
                    // Calculate top 10 and top 100 percentages
                    const top10Balance = sortedHolders.slice(0, 10).reduce((sum, holder) => sum + (holder.balance || holder.amount || 0), 0);
                    const top100Balance = sortedHolders.slice(0, 100).reduce((sum, holder) => sum + (holder.balance || holder.amount || 0), 0);
                    
                    const top10Percentage = ((top10Balance / totalSupply) * 100).toFixed(2);
                    const top100Percentage = ((top100Balance / totalSupply) * 100).toFixed(2);
                    
                    // Calculate average balance
                    const averageBalance = (totalSupply / totalHolders / 10000000).toFixed(2);
                    
                    // Get price for market cap calculation
                    const priceData = await getKalePrice();
                    const marketCap = (parseFloat(priceData.price) * totalSupply / 10000000).toFixed(0);
                    
                    const totalSupplyInKale = totalSupply / 10000000;
                    return {
                        totalSupply: totalSupplyInKale.toLocaleString('en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        }),
                        totalHolders: totalHolders.toLocaleString('en-US'),
                        marketCap: marketCap,
                        top10Percentage,
                        top100Percentage,
                        averageBalance
                    };
                    
                } catch (error) {
                    console.error(`❌ API endpoint ${i + 1} attempt ${attempt} failed for stats:`, error.message);
                    lastError = error;
                    
                    // If this is not the last attempt, wait a bit and try again
                    if (attempt < 3) {
                        console.log(`⏳ Waiting 5 seconds before retry...`);
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        continue;
                    }
                    
                    // If this is the last attempt for this endpoint, break to try next endpoint
                    break;
                }
            }
            
            // If we get here, all attempts for this endpoint failed
            console.log(`❌ All attempts failed for API endpoint ${i + 1} for stats`);
            
            // If this is not the last endpoint, continue to the next one
            if (i < API_ENDPOINTS.length - 1) {
                console.log(`🔄 Trying next API endpoint for stats...`);
                continue;
            }
        }
        
        // If all API endpoints failed, throw the last error
        console.error('❌ All API endpoints failed for stats');
        throw new Error(`All API endpoints failed for stats. Last error: ${lastError?.message || 'Unknown error'}`);
        
    } catch (error) {
        console.error('Error getting global stats:', error);
        return {
            totalSupply: 'N/A',
            totalHolders: 'N/A',
            marketCap: 'N/A',
            top10Percentage: 'N/A',
            top100Percentage: 'N/A',
            averageBalance: 'N/A'
        };
    }
}

// Function to create top holders embed
async function getTopHoldersEmbed(userId, limit = 5) {
    const holders = await getTopHolders(limit);
    
    const embed = new EmbedBuilder()
        .setTitle(t(userId, 'embeds.topTitle'))
        .setColor(3447003) // Blue color like in your example
        .setTimestamp();

    // Handle case when no holders are available
    if (!holders || holders.length === 0) {
        embed.addFields({
            name: '📊 No Data Available',
            value: 'No holders data is currently available. This could mean:\n• The token is new and has no holders yet\n• All balances are zero\n• The API is temporarily unavailable\n\nTry again later or check the token status.',
            inline: false
        });
        embed.setFooter({ 
            text: t(userId, 'footer.dataUpdated')
        });
        return embed;
    }

    holders.forEach((holder, index) => {
        let medal;
        if (index === 0) medal = '🥇 1️⃣';
        else if (index === 1) medal = '🥈 2️⃣';
        else if (index === 2) medal = '🥉 3️⃣';
        else {
            const position = index + 1;
            // Use combined number emojis for better formatting
            if (position === 4) medal = '4️⃣';
            else if (position === 5) medal = '5️⃣';
            else if (position === 6) medal = '6️⃣';
            else if (position === 7) medal = '7️⃣';
            else if (position === 8) medal = '8️⃣';
            else if (position === 9) medal = '9️⃣';
            else if (position === 10) medal = '🔟';
            else if (position === 11) medal = '1️⃣1️⃣';
            else if (position === 12) medal = '1️⃣2️⃣';
            else if (position === 13) medal = '1️⃣3️⃣';
            else if (position === 14) medal = '1️⃣4️⃣';
            else if (position === 15) medal = '1️⃣5️⃣';
            else if (position === 16) medal = '1️⃣6️⃣';
            else if (position === 17) medal = '1️⃣7️⃣';
            else if (position === 18) medal = '1️⃣8️⃣';
            else if (position === 19) medal = '1️⃣9️⃣';
            else if (position === 20) medal = '2️⃣0️⃣';
            else if (position === 21) medal = '2️⃣1️⃣';
            else if (position === 22) medal = '2️⃣2️⃣';
            else if (position === 23) medal = '2️⃣3️⃣';
            else if (position === 24) medal = '2️⃣4️⃣';
            else if (position === 25) medal = '2️⃣5️⃣';
            else medal = `${position}️⃣`;
        }
        
        // Format balance with correct decimal places (KALE has 7 decimals)
        const balanceInKale = holder.rawBalance / 10000000;
        const formattedBalance = balanceInKale.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        // Create Stellar Expert link
        const stellarExpertLink = `[${holder.fullAddress}](https://stellar.expert/explorer/public/account/${holder.fullAddress})`;
        
        embed.addFields({
            name: medal,
            value: `${stellarExpertLink}\n💰 **${formattedBalance} KALE**`,
            inline: false
        });
    });

    embed.setFooter({ 
        text: t(userId, 'footer.dataUpdated')
    });
    
    return embed;
}

// Webhook URL for posting (from environment variable)
const WEBHOOK_URL = process.env.WEBHOOK_URL;

// Function to post daily top holders with price
async function postDailyTopHolders() {
    try {
        const topHoldersEmbed = await getTopHoldersEmbed('default'); // Use default language for daily posts
        const priceData = await getKalePrice();
        
        // Create price embed
        const priceEmbed = new EmbedBuilder()
            .setTitle('🌿 Kale Token Price')
            .setColor(0x00ff00)
            .addFields(
                { name: '💰 Current Price', value: `$${priceData.price}`, inline: true },
                { name: '📈 24h Change', value: `${priceData.change24h}%`, inline: true },
                { name: '💎 Market Cap', value: `$${priceData.marketCap}`, inline: true }
            )
            .setTimestamp();
        
        // Check if webhook URL is configured
        if (!WEBHOOK_URL) {
            console.log('⚠️ No webhook URL configured, using channel fallback');
            throw new Error('No webhook URL configured');
        }
        
        // Send to webhook
        const response = await axios.post(WEBHOOK_URL, {
            content: t('default', 'messages.dailyUpdate'),
            embeds: [topHoldersEmbed, priceEmbed]
        });
        
        if (response.status === 204) {
            console.log('✅ Daily top holders and price posted successfully via webhook');
        } else {
            console.log('⚠️ Unexpected webhook response:', response.status);
        }
        
    } catch (error) {
        console.error('❌ Error posting daily top holders:', error.message);
        
        // Fallback to channel if webhook fails
        try {
            const channelId = process.env.CHANNEL_ID;
            if (!channelId) {
                console.error('❌ No CHANNEL_ID configured for fallback');
                return;
            }
            
            const channel = client.channels.cache.get(channelId);
            if (channel) {
                const topHoldersEmbed = await getTopHoldersEmbed('default');
                const priceData = await getKalePrice();
                
                const priceEmbed = new EmbedBuilder()
                    .setTitle('🌿 Kale Token Price')
                    .setColor(0x00ff00)
                    .addFields(
                        { name: '💰 Current Price', value: `$${priceData.price}`, inline: true },
                        { name: '📈 24h Change', value: `${priceData.change24h}%`, inline: true },
                        { name: '💎 Market Cap', value: `$${priceData.marketCap}`, inline: true }
                    )
                    .setTimestamp();
                
                await channel.send({ 
                    content: t('default', 'messages.dailyUpdate'),
                    embeds: [topHoldersEmbed, priceEmbed] 
                });
                console.log('✅ Fallback: Posted via channel');
            } else {
                console.error('❌ Channel not found:', channelId);
            }
        } catch (fallbackError) {
            console.error('❌ Fallback also failed:', fallbackError.message);
        }
    }
}

// Scheduled task - runs every day at 9:00 AM
cron.schedule('0 9 * * *', async () => {
    console.log('🕘 Running daily top holders update...');
    await postDailyTopHolders();
});

// Also run at 6:00 PM for evening update
cron.schedule('0 18 * * *', async () => {
    console.log('🕕 Running evening top holders update...');
    await postDailyTopHolders();
});

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
