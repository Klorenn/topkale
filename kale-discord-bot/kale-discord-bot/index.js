import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import axios from "axios";
import cron from "node-cron";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

// Endpoint de Hoops (KALE balances)
const API_URL = "https://api.hoops.finance/tokens/CB23WRDQWGSP6YPMY4UV5C4OW5CBTXKYN3XEATG7KJEZCXMJBYEHOUOV/balances?excludezero=true&excludeid=true&excludetoken=true&excludelastupdated=true";

// --- Función para traer Top 5 ---
async function getKaleTop(limit = 5) {
  try {
    const { data } = await axios.get(API_URL, { timeout: 10000 });

    // Ordenar de mayor a menor balance
    const sorted = data
      .sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance))
      .slice(0, limit);

    return sorted;
  } catch (err) {
    console.error("❌ Error consultando KALE:", err.message);
    return [];
  }
}

// --- Función para publicar en Discord ---
async function postDailyTop() {
  const top = await getKaleTop(5);
  if (!top.length) return;

  const embed = new EmbedBuilder()
    .setColor("#00ff66")
    .setTitle("🌱 KALE - Top 5 Holders (Diario)")
    .setDescription("Datos obtenidos desde Hoops Finance API")
    .setTimestamp();

  top.forEach((user, index) => {
    embed.addFields({
      name: `#${index + 1}`,
      value: `🪙 **${parseFloat(user.balance).toLocaleString()} KALE**\n📌 ${user.address}`,
      inline: false
    });
  });

  const channel = await client.channels.fetch(CHANNEL_ID);
  channel.send({ embeds: [embed] });
}

// --- Cronjob: ejecutar cada día a las 20:00 UTC ---
cron.schedule("0 20 * * *", () => {
  console.log("📊 Posteando Top 5 diario...");
  postDailyTop();
});

client.once("ready", () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
  // Para prueba inmediata, descomenta la línea de abajo:
  // postDailyTop();
});

client.login(TOKEN);
