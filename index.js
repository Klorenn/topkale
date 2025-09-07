const { Client, GatewayIntentBits, Events, EmbedBuilder, SlashCommandBuilder, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const cron = require('node-cron');
require('dotenv').config();

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
            language: '🌐 Cambia el idioma del bot'
        },
        embeds: {
            kaleTitle: '🌿 Kale Bot Commands',
            kaleDescription: 'Comandos disponibles:',
            topTitle: '🏆 Ranking Top 5 Holders',
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
            whatIsFarmDesc: 'Kale Farm es la plataforma oficial donde puedes farmear (obtener) tokens KALE. Es un sistema de recompensas que te permite ganar tokens KALE realizando diferentes actividades y tareas en la plataforma.'
        },
        fields: {
            top: 'Show top holders',
            price: 'Show current price',
            farm: 'Go to Kale Farm',
            invite: 'Invite bot to server',
            help: 'Show this help',
            language: 'Change language',
            currentPrice: 'Current Price',
            change24h: '24h Change',
            marketCap: 'Market Cap',
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
            kaleBot: 'Kale Bot - Monitoreo de holders en tiempo real',
            dailyUpdates: 'Kale Bot - Daily top holders updates • Powered by Hoops Finance API (api.hoops.finance)',
            dataUpdated: 'Datos actualizados 📊 • Haz clic en las direcciones para verificar en Stellar Expert'
        },
        messages: {
            dailyUpdate: '🌿 **Daily Top Holders Update**',
            errorFetchingHolders: '❌ Error fetching top holders data. Please try again later.',
            errorFetchingPrice: '❌ Error fetching price data. Please try again later.',
            languageChanged: '🌐 Idioma cambiado a español',
            slashCommandsRegistered: '✅ Comandos slash registrados exitosamente',
            slashCommandsError: '❌ Error registrando comandos slash:',
            botReady: '🌿 Kale Bot Ready! Logged in as',
            willPostDaily: '📊 Will post top',
            holdersDaily: 'holders daily',
            slashCommands: 'Slash Commands: /kale, /top, /price, /farm, /invite, /help'
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
            language: '🌐 Changes the bot language'
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
            whatIsFarmDesc: 'Kale Farm is the official platform where you can farm (earn) KALE tokens. It is a reward system that allows you to earn KALE tokens by performing different activities and tasks on the platform.'
        },
        fields: {
            top: 'Show top holders',
            price: 'Show current price',
            farm: 'Go to Kale Farm',
            invite: 'Invite bot to server',
            help: 'Show this help',
            language: 'Change language',
            currentPrice: 'Current Price',
            change24h: '24h Change',
            marketCap: 'Market Cap',
            requiredPermissions: '📋 Required Permissions',
            requiredPermissionsDesc: '• Send messages\n• Use slash commands\n• Embed links',
            features: '✨ Features',
            featuresDesc: '• Daily top holders ranking\n• Real-time prices\n• Stellar Expert links\n• Native slash commands',
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
            kaleBot: 'Kale Bot - Real-time holders monitoring',
            dailyUpdates: 'Kale Bot - Daily top holders updates • Powered by Hoops Finance API (api.hoops.finance)',
            dataUpdated: 'Data updated 📊 • Click on addresses to verify on Stellar Expert'
        },
        messages: {
            dailyUpdate: '🌿 **Daily Top Holders Update**',
            errorFetchingHolders: '❌ Error fetching top holders data. Please try again later.',
            errorFetchingPrice: '❌ Error fetching price data. Please try again later.',
            languageChanged: '🌐 Language changed to English',
            slashCommandsRegistered: '✅ Slash commands registered successfully',
            slashCommandsError: '❌ Error registering slash commands:',
            botReady: '🌿 Kale Bot Ready! Logged in as',
            willPostDaily: '📊 Will post top',
            holdersDaily: 'holders daily',
            slashCommands: 'Slash Commands: /kale, /top, /price, /farm, /invite, /help'
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
            language: '🌐 Muda o idioma do bot'
        },
        embeds: {
            kaleTitle: '🌿 Comandos do Kale Bot',
            kaleDescription: 'Comandos disponíveis:',
            topTitle: '🏆 Ranking Top 5 Holders',
            priceTitle: '🌿 Preço do Token Kale',
            farmTitle: '🌾 Kale Farm - Farm de Tokens',
            farmDescription: 'Farme tokens KALE na plataforma oficial!',
            inviteTitle: '🔗 Convidar Kale Bot para seu Servidor',
            inviteDescription: 'Adicione o bot Kale ao seu servidor para monitorar os top holders!',
            helpTitle: '🌿 Ajuda do Kale Bot',
            helpDescription: 'Comandos disponíveis:',
            whatIsKale: '🌿 O que é Kale?',
            whatIsKaleDesc: 'Kale é um token digital na blockchain Stellar que faz parte do ecossistema Kale Farm. É uma criptomoeda que permite aos usuários participar do sistema de farming e ganhar recompensas por suas atividades.',
            whatIsFarm: '🌾 O que é Kale Farm?',
            whatIsFarmDesc: 'Kale Farm é a plataforma oficial onde você pode farmear (ganhar) tokens KALE. É um sistema de recompensas que permite ganhar tokens KALE realizando diferentes atividades e tarefas na plataforma.'
        },
        fields: {
            top: 'Mostrar top holders',
            price: 'Mostrar preço atual',
            farm: 'Ir para Kale Farm',
            invite: 'Convidar bot para servidor',
            help: 'Mostrar esta ajuda',
            language: 'Mudar idioma',
            currentPrice: 'Preço Atual',
            change24h: 'Mudança 24h',
            marketCap: 'Market Cap',
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
            changeToSpanish: '🇪🇸 Español',
            changeToPortuguese: '🇧🇷 Português'
        },
        footer: {
            poweredBy: 'Powered by Hoops Finance API (api.hoops.finance)',
            kaleFarm: 'Kale Farm - Plataforma oficial de farming',
            kaleBot: 'Kale Bot - Monitoramento de holders em tempo real',
            dailyUpdates: 'Kale Bot - Atualizações diárias de top holders • Powered by Hoops Finance API (api.hoops.finance)',
            dataUpdated: 'Dados atualizados 📊 • Clique nos endereços para verificar no Stellar Expert'
        },
        messages: {
            dailyUpdate: '🌿 **Atualização Diária de Top Holders**',
            errorFetchingHolders: '❌ Erro ao buscar dados dos top holders. Tente novamente mais tarde.',
            errorFetchingPrice: '❌ Erro ao buscar dados de preço. Tente novamente mais tarde.',
            languageChanged: '🌐 Idioma alterado para português',
            slashCommandsRegistered: '✅ Comandos slash registrados com sucesso',
            slashCommandsError: '❌ Erro ao registrar comandos slash:',
            botReady: '🌿 Kale Bot Ready! Logged in as',
            willPostDaily: '📊 Will post top',
            holdersDaily: 'holders daily',
            slashCommands: 'Slash Commands: /kale, /top, /price, /farm, /invite, /help'
        }
    }
};

// Function to get user language (defaults to Spanish)
function getUserLanguage(userId) {
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
const KALE_API_URL = `https://api.hoops.finance/tokens/${KALE_TOKEN_ADDRESS}/balances?excludezero=true&excludeid=true&excludetoken=true&excludelastupdated=true`;
const TOP_LIMIT = parseInt(process.env.TOP_LIMIT) || 5;

// Slash Commands
const commands = [
    new SlashCommandBuilder()
        .setName('kale')
        .setDescription('Muestra los comandos principales del bot de Kale'),
    
    new SlashCommandBuilder()
        .setName('top')
        .setDescription('Muestra el ranking de top 5 holders de Kale'),
    
    new SlashCommandBuilder()
        .setName('price')
        .setDescription('Muestra el precio actual del token Kale'),
    
    new SlashCommandBuilder()
        .setName('farm')
        .setDescription('🌾 Redirige a la página oficial de Kale Farm para farmear tokens'),
    
    new SlashCommandBuilder()
        .setName('invite')
        .setDescription('🔗 Genera un enlace para invitar el bot a tu servidor'),
    
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Muestra ayuda completa del bot'),
    
    new SlashCommandBuilder()
        .setName('language')
        .setDescription('🌐 Cambia el idioma del bot')
];

// Register slash commands
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(' Registrando comandos slash...');
        
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        
        console.log(t('default', 'messages.slashCommandsRegistered'));
    } catch (error) {
        console.error(t('default', 'messages.slashCommandsError'), error);
    }
})();

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, readyClient => {
    console.log(`${t('default', 'messages.botReady')} ${readyClient.user.tag}`);
    console.log(`${t('default', 'messages.willPostDaily')} ${TOP_LIMIT} ${t('default', 'messages.holdersDaily')}`);
    console.log(t('default', 'messages.slashCommands'));
});

// Listen for slash command interactions
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

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
            .setFooter({ 
                text: t(interaction.user.id, 'footer.poweredBy')
            });
        await interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === 'top') {
        try {
            await interaction.deferReply();
            const embed = await getTopHoldersEmbed(interaction.user.id);
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
            .setFooter({ text: t(interaction.user.id, 'footer.kaleBot') })
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
                { name: '/kale', value: t(interaction.user.id, 'fields.top'), inline: true },
                { name: '/top', value: t(interaction.user.id, 'fields.top'), inline: true },
                { name: '/price', value: t(interaction.user.id, 'fields.price'), inline: true },
                { name: '/farm', value: t(interaction.user.id, 'fields.farm'), inline: true },
                { name: '/invite', value: t(interaction.user.id, 'fields.invite'), inline: true },
                { name: '/help', value: t(interaction.user.id, 'fields.help'), inline: true },
                { name: '/language', value: t(interaction.user.id, 'fields.language'), inline: true }
            )
            .addFields(
                { 
                    name: t(interaction.user.id, 'embeds.whatIsKale'), 
                    value: t(interaction.user.id, 'embeds.whatIsKaleDesc'), 
                    inline: false 
                },
                { 
                    name: t(interaction.user.id, 'embeds.whatIsFarm'), 
                    value: t(interaction.user.id, 'embeds.whatIsFarmDesc'), 
                    inline: false 
                }
            )
            .setFooter({ 
                text: t(interaction.user.id, 'footer.dailyUpdates')
            });

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
                    .setLabel(t(interaction.user.id, 'buttons.changeToPortuguese'))
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    }

    if (interaction.commandName === 'language') {
        const embed = new EmbedBuilder()
            .setTitle('🌐 Cambiar Idioma / Change Language / Mudar Idioma')
            .setDescription('Selecciona tu idioma preferido / Select your preferred language / Selecione seu idioma preferido')
            .setColor(0x00ff00)
            .addFields(
                { 
                    name: '🇪🇸 Español', 
                    value: 'Cambiar a español', 
                    inline: true 
                },
                { 
                    name: '🇺🇸 English', 
                    value: 'Change to English', 
                    inline: true 
                },
                { 
                    name: '🇧🇷 Português', 
                    value: 'Mudar para português', 
                    inline: true 
                }
            )
            .setFooter({ 
                text: 'Kale Bot - Language Settings / Configurações de Idioma' 
            });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('lang_es')
                    .setLabel('🇪🇸 Español')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('lang_en')
                    .setLabel('🇺🇸 English')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('lang_pt')
                    .setLabel('🇧🇷 Português')
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
});

// Handle button interactions
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;

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
});

// Function to get top holders data from real API
async function getTopHolders() {
    try {
        console.log('📡 Fetching Kale holders data from API...');
        const response = await axios.get(KALE_API_URL);
        const holders = response.data;
        
        if (!Array.isArray(holders) || holders.length === 0) {
            throw new Error('No holders data received from API');
        }
        
        // Calculate total supply
        const totalSupply = holders.reduce((sum, holder) => sum + holder.balance, 0);
        
        // Sort by balance (descending) and format data
        const sortedHolders = holders
            .sort((a, b) => b.balance - a.balance)
            .slice(0, TOP_LIMIT)
            .map(holder => {
                const percentage = ((holder.balance / totalSupply) * 100).toFixed(2);
                const formattedBalance = holder.balance.toLocaleString('en-US');
                
                return {
                    address: `${holder.address.slice(0, 6)}...${holder.address.slice(-6)}`,
                    fullAddress: holder.address,
                    balance: formattedBalance,
                    rawBalance: holder.balance,
                    percentage: `${percentage}%`
                };
            });
        
        console.log(`✅ Successfully fetched ${sortedHolders.length} top holders`);
        return sortedHolders;
        
    } catch (error) {
        console.error('❌ Error fetching holders from API:', error.message);
        throw error;
    }
}

// Function to get Kale price from API
async function getKalePrice() {
    try {
        // Using Jupiter API for price data
        const priceUrl = `https://price.jup.ag/v4/price?ids=${KALE_TOKEN_ADDRESS}`;
        const response = await axios.get(priceUrl);
        const priceData = response.data.data[KALE_TOKEN_ADDRESS];
        
        if (!priceData) {
            throw new Error('Price data not found');
        }
        
        return {
            price: priceData.price.toFixed(8),
            change24h: priceData.priceChange24h ? `+${(priceData.priceChange24h * 100).toFixed(2)}` : 'N/A',
            marketCap: 'N/A' // Would need additional API call for market cap
        };
        
    } catch (error) {
        console.error('❌ Error fetching price:', error.message);
        // Fallback to mock data if API fails
        return {
            price: '0.000123',
            change24h: '+15.6',
            marketCap: '1,230,000'
        };
    }
}

// Function to create top holders embed
async function getTopHoldersEmbed(userId) {
    const holders = await getTopHolders();
    
    const embed = new EmbedBuilder()
        .setTitle(t(userId, 'embeds.topTitle'))
        .setColor(3447003) // Blue color like in your example
        .setTimestamp();

    holders.forEach((holder, index) => {
        let medal;
        if (index === 0) medal = '🥇 1';
        else if (index === 1) medal = '🥈 2';
        else if (index === 2) medal = '🥉 3';
        else medal = `${index + 1}️⃣`;
        
        // Format balance with correct decimal places (KALE has 6 decimals)
        const formattedBalance = (holder.rawBalance / 1000000).toLocaleString('en-US', {
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

// Webhook URL for posting
const WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1414049159354384486/8JFjuf_6VMnc9KmNf9pX8UNJO9qaIwdLN1gGQkOTVTF77rMw-OCbxbo-dmw8OghOBE4X';

// Function to post daily top holders
async function postDailyTopHolders() {
    try {
        const embed = await getTopHoldersEmbed('default'); // Use default language for daily posts
        
        // Send to webhook
        const response = await axios.post(WEBHOOK_URL, {
            content: t('default', 'messages.dailyUpdate'),
            embeds: [embed]
        });
        
        if (response.status === 204) {
            console.log('✅ Daily top holders posted successfully via webhook');
        } else {
            console.log('⚠️ Unexpected webhook response:', response.status);
        }
        
    } catch (error) {
        console.error('❌ Error posting daily top holders:', error);
        
        // Fallback to channel if webhook fails
        try {
            const channel = client.channels.cache.get(process.env.CHANNEL_ID);
            if (channel) {
                const embed = await getTopHoldersEmbed('default');
                await channel.send({ 
                    content: t('default', 'messages.dailyUpdate'),
                    embeds: [embed] 
                });
                console.log('✅ Fallback: Posted via channel');
            }
        } catch (fallbackError) {
            console.error('❌ Fallback also failed:', fallbackError);
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
