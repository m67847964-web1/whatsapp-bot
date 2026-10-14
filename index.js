const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

// ==========================================
// 👑 إعدادات المالك والرتب
// ==========================================
const CONFIG = {
  ownerNumber: "201000000000@s.whatsapp.net", // رقمك هنا برمز الدولة (مثلاً 201200000000)
  botPrefix: ".",                             // رمز الأوامر
  developers: [],                             
};

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const connection = update.connection;
        const lastDisconnect = update.lastDisconnect;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ تم اتصال البوت بنجاح!');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        if (body === `${CONFIG.botPrefix}فحص`) {
            await sock.sendMessage(from, { text: "👑 أهلاً بك يا مالك البوت! البوت يعمل بنجاح." });
        }
    });
}

startBot();
