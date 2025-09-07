#!/usr/bin/env node

/**
 * Script de prueba para el Bot de Kale
 * Ejecutar: node test-discord.js
 */

const axios = require('axios');
require('dotenv').config();

const KALE_TOKEN_ADDRESS = 'CB23WRDQWGSP6YPMY4UV5C4OW5CBTXKYN3XEATG7KJEZCXMJBYEHOUOV';
const KALE_API_URL = `https://api.hoops.finance/tokens/${KALE_TOKEN_ADDRESS}/balances?excludezero=true&excludeid=true&excludetoken=true&excludelastupdated=true`;
const WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1414049159354384486/8JFjuf_6VMnc9KmNf9pX8UNJO9qaIwdLN1gGQkOTVTF77rMw-OCbxbo-dmw8OghOBE4X';
const TOP_LIMIT = 5;

async function getTopHolders() {
    try {
        console.log('📡 Obteniendo datos de holders de Kale...');
        const response = await axios.get(KALE_API_URL);
        const holders = response.data;
        
        if (!Array.isArray(holders) || holders.length === 0) {
            throw new Error('No se recibieron datos de holders de la API');
        }
        
        const totalSupply = holders.reduce((sum, holder) => sum + holder.balance, 0);
        
        const sortedHolders = holders
            .sort((a, b) => b.balance - a.balance)
            .slice(0, TOP_LIMIT)
            .map(holder => {
                const percentage = ((holder.balance / totalSupply) * 100).toFixed(2);
                return {
                    address: `${holder.address.slice(0, 6)}...${holder.address.slice(-6)}`,
                    fullAddress: holder.address,
                    rawBalance: holder.balance,
                    percentage: `${percentage}%`
                };
            });
        
        console.log(`✅ Se obtuvieron ${sortedHolders.length} top holders exitosamente`);
        console.log(`📊 Total supply: ${(totalSupply / 1000000).toLocaleString()} KALE`);
        return sortedHolders;
        
    } catch (error) {
        console.error('❌ Error obteniendo holders:', error.message);
        throw error;
    }
}

async function createEmbed() {
    const holders = await getTopHolders();
    
    const embed = {
        title: '📊 Ranking Top 5 Holders - PRUEBA',
        color: 3447003,
        fields: [],
        footer: {
            text: 'Datos actualizados 🤖 - Prueba del Bot'
        },
        timestamp: new Date().toISOString()
    };
    
    holders.forEach((holder, index) => {
        let medal;
        if (index === 0) medal = '🥇 1';
        else if (index === 1) medal = '🥈 2';
        else if (index === 2) medal = '🥉 3';
        else medal = `${index + 1}️⃣`;
        
        embed.fields.push({
            name: medal,
            value: `\`${holder.fullAddress}\`\n💰 **${holder.rawBalance.toLocaleString('en-US')}**`,
            inline: false
        });
    });
    
    return embed;
}

async function sendTestToDiscord() {
    try {
        console.log('🧪 Preparando prueba para Discord...');
        const embed = await createEmbed();
        
        console.log('📤 Enviando al servidor de Discord...');
        const response = await axios.post(WEBHOOK_URL, {
            content: '🌿 **PRUEBA DEL BOT DE KALE** - Ranking en tiempo real',
            embeds: [embed]
        });
        
        if (response.status === 204) {
            console.log('✅ ¡Prueba enviada exitosamente al servidor!');
            console.log('👀 Revisa tu canal de Discord para ver el ranking');
            console.log('⚡️Datos obtenidos en tiempo real desde la API de Kale');
        } else {
            console.log('⚠️ Respuesta inesperada del servidor:', response.status);
        }
        
    } catch (error) {
        console.error('❌ Error enviando prueba a Discord:', error.message);
        if (error.response) {
            console.error('🕵️‍♀️ Detalles del error:', error.response.data);
        }
    }
}

async function showPreview() {
    try {
        console.log('🎨 Preview del embed que se enviará:');
        console.log('='.repeat(60));
        
        const embed = await createEmbed();
        console.log(JSON.stringify({ embeds: [embed] }, null, 2));
        
    } catch (error) {
        console.error('❌ Error creando preview:', error.message);
    }
}

// Función principal
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--preview') || args.includes('-p')) {
        console.log('💁 Modo preview activado');
        await showPreview();
    } else if (args.includes('--help') || args.includes('-h')) {
        console.log(`
🌿 Bot de Kale - Script de Prueba

Uso: node test-discord.js [opciones]

Opciones:
  --preview, -p    Solo mostrar preview del embed (no enviar)
  --help, -h       Mostrar esta ayuda
  (sin opciones)   Enviar prueba al servidor de Discord

Ejemplos:
  node test-discord.js              # Enviar prueba
  node test-discord.js --preview    # Solo preview
  node test-discord.js -p           # Solo preview
        `);
    } else {
        console.log('🚀 Iniciando prueba del bot de Kale...');
        await sendTestToDiscord();
    }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    getTopHolders,
    createEmbed,
    sendTestToDiscord,
    showPreview
};