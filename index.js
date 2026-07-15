const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Bot is active!'));
app.listen(process.env.PORT || 10000);

async function startBot() {
    console.log("جاري محاولة الاتصال...");
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (update) => {
        const { qr, connection } = update;
        if (qr) {
            console.log('--- ظهر الـ QR كود في الـ Terminal أدناه ---');
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'open') console.log('تم الاتصال بالواتساب!');
    });
}

startBot();
