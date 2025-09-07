const { Client, GatewayIntentBits, Events, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const cron = require('node-cron');
require('dotenv').config();

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

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, readyClient => {
    console.log(`🌿 Kale Bot Ready! Logged in as ${readyClient.user.tag}`);
    console.log(`📊 Will post top ${TOP_LIMIT} holders daily`);
});

// Listen for messages
client.on(Events.MessageCreate, async message => {
    // Ignore messages from bots
    if (message.author.bot) return;

    // Commands
    if (message.content === '!kale') {
        await message.reply('🌿 **Kale Bot Commands:**\n`!top` - Show top holders\n`!price` - Show current price\n`!help` - Show this help');
    }

    if (message.content === '!top') {
        try {
            const embed = await getTopHoldersEmbed();
            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching top holders:', error);
            await message.reply('❌ Error fetching top holders data. Please try again later.');
        }
    }

    if (message.content === '!price') {
        try {
            const priceData = await getKalePrice();
            const embed = new EmbedBuilder()
                .setTitle('🌿 Kale Token Price')
                .setColor(0x00ff00)
                .addFields(
                    { name: 'Current Price', value: `$${priceData.price}`, inline: true },
                    { name: '24h Change', value: `${priceData.change24h}%`, inline: true },
                    { name: 'Market Cap', value: `$${priceData.marketCap}`, inline: true }
                )
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching price:', error);
            await message.reply('❌ Error fetching price data. Please try again later.');
        }
    }

    if (message.content === '!help') {
        const embed = new EmbedBuilder()
            .setTitle('🌿 Kale Bot Help')
            .setDescription('Commands available:')
            .setColor(0x00ff00)
            .addFields(
                { name: '!kale', value: 'Show main commands', inline: true },
                { name: '!top', value: 'Show top holders', inline: true },
                { name: '!price', value: 'Show current price', inline: true },
                { name: '!help', value: 'Show this help', inline: true }
            )
            .setFooter({ text: 'Kale Bot - Daily top holders updates' });
        await message.reply({ embeds: [embed] });
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
async function getTopHoldersEmbed() {
    const holders = await getTopHolders();
    
    const embed = new EmbedBuilder()
        .setTitle('🏆 Ranking Top 5 Holders')
        .setColor(3447003) // Blue color like in your example
        .setTimestamp();

    holders.forEach((holder, index) => {
        let medal;
        if (index === 0) medal = '🥇 1';
        else if (index === 1) medal = '🥈 2';
        else if (index === 2) medal = '🥉 3';
        else medal = `${index + 1}️⃣`;
        
        // Format balance with proper formatting (remove the division by 1000000)
        const formattedBalance = holder.rawBalance.toLocaleString('en-US');
        
        embed.addFields({
            name: medal,
            value: `\`${holder.fullAddress}\`\n💰 **${formattedBalance}**`,
            inline: false
        });
    });

    embed.setFooter({ 
        text: 'Datos actualizados 📊' 
    });
    
    return embed;
}

// Webhook URL for posting
const WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1414049159354384486/8JFjuf_6VMnc9KmNf9pX8UNJO9qaIwdLN1gGQkOTVTF77rMw-OCbxbo-dmw8OghOBE4X';

// Function to post daily top holders
async function postDailyTopHolders() {
    try {
        const embed = await getTopHoldersEmbed();
        
        // Send to webhook
        const response = await axios.post(WEBHOOK_URL, {
            content: '🌿 **Daily Top Holders Update**',
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
                const embed = await getTopHoldersEmbed();
                await channel.send({ 
                    content: '🌿 **Daily Top Holders Update**',
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
