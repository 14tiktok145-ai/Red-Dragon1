const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();
const port = process.env.PORT || 10000; // اتأكد إن البورت هو نفسه اللي ظهر في الـ Logs

app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(port, () => console.log(`Server listening on port ${port}`));

async function startBot() {
    console.log("جاري تشغيل البوت...");
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: true // السطر ده مهم جداً عشان يطبع الكود
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update;
        if (qr) {
            console.log('--- QR CODE ---');
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'open') {
            console.log('تم الاتصال بالواتساب بنجاح!');
        }
        if (connection === 'close') {
            console.log('الاتصال انقطع، جاري إعادة المحاولة...');
            startBot(); // يعيد التشغيل لو فصل
        }
    });
}

// تأكد إن الدالة دي بتتنادى فعلاً
startBot();
