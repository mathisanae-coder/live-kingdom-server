const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

app.get('/', (_, res) => res.send('Live Kingdom OK ✅'));

io.on('connection', socket => {
  socket.on('start', async ({ username }) => {
    const tiktok = new WebcastPushConnection(username);
    tiktok.on('chat',      d => io.emit('chat',      { user: d.uniqueId, comment: d.comment }));
    tiktok.on('gift',      d => io.emit('gift',      { user: d.uniqueId, gift: d.giftName, diamonds: d.diamondCount }));
    tiktok.on('like',      d => io.emit('like',      { count: d.totalLikeCount }));
    tiktok.on('member',    d => io.emit('viewer',    { user: d.uniqueId, count: d.viewerCount }));
    tiktok.on('subscribe', d => io.emit('subscribe', { user: d.uniqueId }));
    try { await tiktok.connect(); } catch(e) { console.error(e.message); }
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log('Server OK port ' + PORT));