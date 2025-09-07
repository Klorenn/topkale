# 🌿 Kale Discord Bot - Complete Documentation

An advanced Discord bot that monitors and automatically publishes Kale token top holders on the Solana blockchain, using real-time data from the hoops.finance API.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/discord.js-v14.14.1-blue)](https://discord.js.org/)

## 📋 Table of Contents

- [Main Features](#-main-features)
- [New Features](#-new-features)
- [System Architecture](#️-system-architecture)
- [Internal Mechanisms](#-internal-mechanisms)
- [Local Installation](#-local-installation)
- [Configuration](#️-configuration)
- [Server Deployment](#-server-deployment)
- [Critical Dependencies](#-critical-dependencies)
- [APIs and Data Sources](#-apis-and-data-sources)
- [Available Commands](#-available-commands)
- [Task Scheduling](#-task-scheduling)
- [Error Handling](#-error-handling)
- [Monitoring and Logs](#-monitoring-and-logs)
- [Troubleshooting](#-troubleshooting)
- [Contribution](#-contribution)

## ✨ Main Features

### 🎯 Core Features
- **Real-Time Monitoring**: Gets updated holder data from hoops.finance API
- **Automatic Posts**: Daily ranking at 9:00 AM and 6:00 PM
- **Multilingual**: Spanish, English and Portuguese support
- **Slash Commands**: Native Discord commands (`/kale`, `/top`, `/price`, `/farm`, `/invite`, `/help`, `/language`, `/rank`, `/stats`, `/alerts`, `/history`)
- **Interactive Buttons**: Clickable buttons for quick actions (farm, invite, language change)
- **Professional Format**: Embeds with medals, colors and optimized formatting
- **Webhook Integration**: Direct publication via Discord webhooks
- **Fallback System**: Backup system in case of failures
- **External Verification**: Clickable links to Stellar Expert for verification

### 📊 Displayed Data
- **Top Holders**: Ranking with medals (🥇🥈🥉)
- **Verifiable Addresses**: Clickable links to Stellar Expert
- **Formatted Balances**: Amounts with correct decimals (2 decimals)
- **Thousand Separator**: Proper comma formatting
- **KALE Unit**: Clear currency identification
- **Timestamps**: Update date and time

## 🆕 New Features

### ✨ Implemented Improvements (Latest Update)

#### **1. Native Slash Commands**
- **Complete migration** from `!` commands to `/` commands
- **Automatic autocomplete** in Discord
- **Native parameter validation**
- **More professional and modern interface**

#### **2. Stellar Expert Verification Links**
- **Clickable addresses** for each holder
- **Direct verification** of balances and transactions
- **Total transparency** of displayed data
- **Automatic links** to `stellar.expert/explorer/public/account/`

#### **3. Improved Balance Formatting**
- **Correct decimals**: Fixed 2 decimals (.00)
- **Thousand separators**: Properly expressed commas
- **KALE Unit**: Clear currency identification
- **Consistent format**: All holders with same formatting

#### **4. Optimized Code Structure**
- **Slash Commands**: Implementation with SlashCommandBuilder
- **Automatic registration**: Commands register on startup
- **Interaction handling**: Robust response system
- **Modular code**: Well-organized functions

#### **5. Multilingual System**
- **Three supported languages**: Spanish, English, Portuguese
- **Dynamic language change** per individual user
- **Interactive buttons** with flags for language change
- **Preference persistence** - each user maintains their language

#### **6. Advanced Analytics Commands**
- **`/rank [address]`**: Check position of any Stellar address
- **`/stats`**: Global token statistics (supply, holders, distribution)
- **`/alerts`**: Balance change alert system
- **`/history [address]`**: Holdings change history

#### **7. Enhanced `/top` Command**
- **Configurable limit**: 1-25 holders (default: 5)
- **Improved number formatting**: Uses 1️⃣, 2️⃣, etc. for positions 10+
- **Price integration**: Daily posts include token price
- **Better performance**: Optimized API calls and caching

### 📊 Updated Output Example

```
🏆 Top Holders Ranking

🥇 1️⃣
[CDL74RF5BLYR2YBLCCI7F5FB6TPSCLKEJUBSD2RSVWZ4YHF3VMFAIGWA](https://stellar.expert/explorer/public/account/CDL74RF5BLYR2YBLCCI7F5FB6TPSCLKEJUBSD2RSVWZ4YHF3VMFAIGWA)
💰 **244,905,600,010.00 KALE**

🥈 2️⃣
[GARARLMQ64D6LUXYMSAR7I2S6DPNZ6LPR7QOVBO3Y5XPW25GR757TWVT](https://stellar.expert/explorer/public/account/GARARLMQ64D6LUXYMSAR7I2S6DPNZ6LPR7QOVBO3Y5XPW25GR757TWVT)
💰 **105,600,244,131.07 KALE**
```

## 🏗️ System Architecture

### File Structure
```
kale-discord-bot/
├── index.js              # Main bot file
├── package.json          # Dependencies and scripts
├── .env                  # Environment variables (sensitive)
├── .gitignore           # Files to ignore in git
└── README.md            # Documentation
```

### Data Flow
```
API hoops.finance → Node.js Bot → Processing → Discord Webhook → Channel
     ↓                    ↓              ↓              ↓
  Raw Data          Validation      Formatting      Publication
```

## ⚙️ Internal Mechanisms

### 1. Data Retrieval System
```javascript
// Main data retrieval function
async function getTopHolders(limit = 5) {
    // 1. Call to hoops.finance API
    const response = await axios.get(KALE_API_URL);
    
    // 2. Data validation
    if (!Array.isArray(holders) || holders.length === 0) {
        throw new Error('No holders data received from API');
    }
    
    // 3. Total supply calculation
    const totalSupply = holders.reduce((sum, holder) => sum + holder.balance, 0);
    
    // 4. Sorting and formatting
    const sortedHolders = holders
        .sort((a, b) => b.balance - a.balance)
        .slice(0, limit)
        .map(holder => {
            // Percentage calculation and formatting
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

### 2. Discord Embeds System
```javascript
// Creation of optimized embeds
async function getTopHoldersEmbed(userId, limit = 5) {
    const holders = await getTopHolders(limit);

    const embed = new EmbedBuilder()
        .setTitle(t(userId, 'embeds.topTitle'))
        .setColor(3447003) // Professional blue color
        .setTimestamp();

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
```

### 3. Task Scheduling System
```javascript
// Scheduled tasks with node-cron
cron.schedule('0 9 * * *', async () => {
    console.log('🕘 Running daily top holders update...');
    await postDailyTopHolders();
});

cron.schedule('0 18 * * *', async () => {
    console.log('🕕 Running evening top holders update...');
    await postDailyTopHolders();
});
```

### 4. Webhook System with Fallback
```javascript
async function postDailyTopHolders() {
    try {
        const topHoldersEmbed = await getTopHoldersEmbed('default');
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

        // Main attempt: Webhook
        const response = await axios.post(WEBHOOK_URL, {
            content: t('default', 'messages.dailyUpdate'),
            embeds: [topHoldersEmbed, priceEmbed]
        });
        
        if (response.status === 204) {
            console.log('✅ Posted via webhook');
        }
    } catch (error) {
        // Fallback: Discord channel
        const channel = client.channels.cache.get(process.env.CHANNEL_ID);
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
        }
    }
}
```

## 🚀 Local Installation

### Prerequisites
- Node.js v16.0.0 or higher
- npm v7.0.0 or higher
- Discord account with developer permissions
- Internet access for APIs

### Installation Steps

1. **Clone the repository**
```bash
git clone <your-repository>
cd kale-discord-bot
```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your values
```

4. **Run the bot**
```bash
npm start
# or
node index.js
```

## ⚙️ Configuration

### Environment Variables (.env)
```env
# Discord bot token (REQUIRED)
DISCORD_TOKEN=your_bot_token_here

# Discord channel ID (for fallback)
CHANNEL_ID=1414030545083433001

# Application ID for Slash Commands (REQUIRED)
CLIENT_ID=your_application_id_here

# Number of holders to show (optional, default: 5)
TOP_LIMIT=5

# Discord webhook URL (optional, for direct posts)
WEBHOOK_URL=https://discord.com/api/webhooks/...
```

### Discord Bot Configuration

**Create application in Discord**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application
3. Name: "Kale Bot" (or your preference)

**Configure the bot**
1. Go to "Bot" section
2. Generate token and copy it
3. Enable necessary intents:
   - ✅ Message Content Intent (for commands)
   - ✅ Server Members Intent (optional)

**Invite the bot to server**
1. Go to "OAuth2" → "URL Generator"
2. Select: bot, Send Messages, Use Slash Commands
3. Copy URL and use it to invite

## 🔌 APIs and Data Sources

### Main API: hoops.finance
**Endpoint:** `https://api.hoops.finance/tokens/{TOKEN_ADDRESS}/balances`

**Credit:** Credit shown in `/kale` and `/help` commands

**Parameters:**
- `excludezero=true` - Exclude zero balances
- `excludeid=true` - Exclude unnecessary IDs
- `excludetoken=true` - Exclude token metadata
- `excludelastupdated=true` - Exclude timestamps

**Response:**
```json
[
  {
    "address": "CDL74RF5BLYR2YBLCCI7F5FB6TPSCLKEJUBSD2RSVWZ4YHF3VMFAIGWA",
    "balance": 244905600010000
  }
]
```

### Secondary API: Jupiter (Prices)
**Endpoint:** `https://price.jup.ag/v4/price?ids={TOKEN_ADDRESS}`

**Usage:** Get current token prices

### Kale Token
- **Address:** `CB23WRDQWGSP6YPMY4UV5C4OW5CBTXKYN3XEATG7KJEZCXMJBYEHOUOV`
- **Blockchain:** Solana
- **Type:** SPL Token

## 🎮 Available Commands

### Slash Commands (Native Discord)
| Command | Function | Example |
|---------|----------|---------|
| `/kale` | Shows available commands | `/kale` |
| `/top [limit]` | Current holders ranking with Stellar Expert links | `/top` or `/top limit 15` |
| `/price` | Current token price | `/price` |
| `/farm` | Redirects to official Kale Farm page | `/farm` |
| `/invite` | Generates link to invite bot to your server | `/invite` |
| `/help` | Complete help | `/help` |
| `/language` | Change bot language | `/language` |
| `/rank [address]` | Position of specific Stellar address | `/rank address: YOUR_ADDRESS` |
| `/stats` | Global token statistics | `/stats` |
| `/alerts [action]` | Configure balance alerts | `/alerts action: list` |
| `/history [address]` | Holdings change history | `/history address: YOUR_ADDRESS` |

### Slash Command Features
- ✅ **Autocomplete**: Discord automatically suggests commands
- ✅ **Validation**: Parameters validated by Discord
- ✅ **Native Interface**: Perfect integration with Discord UI
- ✅ **Fewer Errors**: No writing or formatting issues

### Detailed Command Descriptions

**🌿 /kale - Main Commands**
Shows a quick list of all available bot commands.

**🏆 /top [limit] - Holders Ranking**
- Shows top holders of KALE (configurable 1-25, default 5)
- Clickable links to Stellar Expert for verification
- Balances formatted with correct decimals
- Medals for top 3 positions (🥇🥈🥉)
- Numbers with proper emoji formatting (1️⃣2️⃣3️⃣...)

**💰 /price - Token Price**
- Current KALE price in USD
- 24-hour price change
- Token market cap
- Real-time data from Jupiter API

**🌾 /farm - Kale Farm**
- Interactive button to access official farming page
- Redirects to kalefarm.xyz with one click
- More intuitive and professional interface

**🔗 /invite - Invite Bot**
- Interactive button to generate invitation link
- Add bot to your server with one click
- Minimum required permissions (send messages, slash commands, embeds)
- Bot features list

**🌐 /language - Language Change**
- Interactive buttons with flags for language selection
- Supports Spanish 🇪🇸, English 🇺🇸, Portuguese 🇧🇷
- Individual user preferences
- Persistent language selection

**🏆 /rank [address] - Address Position**
- Check position of any Stellar address in ranking
- Shows balance, percentage, and Stellar Expert link
- Validates Stellar address format
- Real-time position calculation

**📊 /stats - Global Statistics**
- Total KALE supply
- Total active holders
- Top 10% and 100% distribution
- Average balance statistics
- Market concentration analysis

**🔔 /alerts [action] - Balance Alerts**
- Configure alerts for balance changes
- Actions: list, add, remove alerts
- Customizable percentage thresholds
- Address-specific monitoring

**📈 /history [address] - Holdings History**
- View holdings change history
- Transaction tracking
- Balance evolution over time
- External links to Stellar Expert

### Command Implementation
```javascript
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'top') {
        try {
            await interaction.deferReply();
            const limit = Math.min(interaction.options.getInteger('limit') || 5, 25);
            const embed = await getTopHoldersEmbed(interaction.user.id, limit);
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching top holders:', error);
            await interaction.editReply(t(interaction.user.id, 'messages.errorFetchingHolders'));
        }
    }
});
```

## ⏰ Task Scheduling

### Configured Schedules
- **9:00 AM UTC**: Morning publication
- **6:00 PM UTC**: Evening publication

### Cron Expressions
```javascript
// Every day at 9:00 AM
'0 9 * * *'

// Every day at 6:00 PM
'0 18 * * *'

// Every hour (for testing)
'0 * * * *'

// Every 30 minutes (for testing)
'*/30 * * * *'
```

### Schedule Customization
```javascript
// Change to every 6 hours
cron.schedule('0 */6 * * *', async () => {
    await postDailyTopHolders();
});

// Only weekdays
cron.schedule('0 9 * * 1-5', async () => {
    await postDailyTopHolders();
});
```

## 🛡️ Error Handling

### Error Handling Strategies

#### 1. API Errors
```javascript
try {
    const response = await axios.get(API_URL);
    // Process data
} catch (error) {
    console.error('API Error:', error.message);
    // Fallback or retry
}
```

#### 2. Discord Errors
```javascript
try {
    await channel.send({ embeds: [embed] });
} catch (error) {
    console.error('Discord Error:', error);
    // Try webhook as fallback
}
```

#### 3. Connection Errors
```javascript
client.on('error', error => {
    console.error('Discord Client Error:', error);
});

client.on('disconnect', () => {
    console.log('Bot disconnected, attempting reconnect...');
});
```

### Retry System
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

## 📊 Monitoring and Logs

### Logging System
```javascript
// Structured logs
console.log(`🌿 Kale Bot Ready! Logged in as ${client.user.tag}`);
console.log(`📊 Will post top ${TOP_LIMIT} holders daily`);
console.log(`📡 Fetching Kale holders data from API...`);
console.log(`✅ Successfully fetched ${holders.length} top holders`);
console.log(`✅ Daily top holders posted successfully via webhook`);
```

### Important Metrics
- Bot uptime
- Update frequency
- API errors
- Response latency
- Number of holders processed

### Monitoring Tools

**PM2 Monitoring**
```bash
# Web dashboard
pm2 monit

# Real-time metrics
pm2 show kale-bot
```

**External Logs**
```bash
# Send logs to file
pm2 start index.js --name kale-bot --log /var/log/kale-bot.log

# Log rotation
pm2 install pm2-logrotate
```

## 🔧 Troubleshooting

### Common Issues

#### 1. "TokenInvalid" Error
**Cause:** Incorrect Discord token
**Solution:**
- Verify token in .env
- Regenerate token in Discord Developer Portal
- Ensure no extra spaces

#### 2. "Used disallowed intents" Error
**Cause:** Intents not enabled
**Solution:**
- Go to Discord Developer Portal
- Enable "Message Content Intent"
- Restart the bot

#### 3. "Channel not found" Error
**Cause:** Incorrect CHANNEL_ID
**Solution:**
- Verify channel ID
- Ensure bot has permissions
- Use webhook as alternative

#### 4. API Rate Limiting
**Cause:** Too many API calls
**Solution:**
- Implement delays between calls
- Use cache for data
- Monitor API limits

### Diagnostic Commands
   ```bash
# Check bot status
pm2 status kale-bot

# View real-time logs
pm2 logs kale-bot --lines 100

# Check connectivity
curl -I https://api.hoops.finance/tokens/CB23WRDQWGSP6YPMY4UV5C4OW5CBTXKYN3XEATG7KJEZCXMJBYEHOUOV/balances

# Check webhook
curl -X POST https://discord.com/api/webhooks/YOUR_WEBHOOK_URL
```

### Debug Logs
```javascript
// Enable detailed logs
process.env.DEBUG = 'discord.js:*';

// Custom logs
console.log('🔍 Debug:', {
    holdersCount: holders.length,
    totalSupply: totalSupply,
    topHolder: sortedHolders[0]
});
```

## 🤝 Contribution

### Contribution Structure
1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Make changes and commits
4. Push to branch: `git push origin feature/new-feature`
5. Create Pull Request

### Areas for Improvement
- Data cache to reduce API calls
- Advanced metrics (charts, statistics)
- Discord slash commands
- Push notifications for important changes
- Web dashboard for monitoring
- Multi-token support

### Code Standards
```javascript
// Use async/await
async function getData() {
    try {
        const response = await api.call();
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Document functions
/**
 * Gets top Kale token holders
 * @param {number} limit - Number of holders to return
 * @returns {Promise<Array>} Sorted holders array
 */
async function getTopHolders(limit = 5) {
    // Implementation
}
```

## 📄 License

This project is under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

**Discord:** [https://discord.gg/bDakpsnCzA](https://discord.gg/bDakpsnCzA)  
**Email:** pau@telluscoop.com

## 🌿 Enjoy your Kale bot! 🚀

**Last update:** September, 2025
