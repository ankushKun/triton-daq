const WebSocket = require('ws');
const dgram = require('dgram');
const fs = require('fs');

// Create WebSocket server for signaling
const wss = new WebSocket.Server({ port: 8080 });
const udpServer = dgram.createSocket('udp4');

// Store connected clients
let webClients = new Set();
let espClient = null;
let messageCounter = 0;

// Add this line after the messageCounter initialization
const csvFile = 'udp_messages.csv';

// Initialize CSV file with headers if it doesn't exist
if (!fs.existsSync(csvFile)) {
    fs.writeFileSync(csvFile, '\n');
}

// Handle UDP messages from ESP32
udpServer.on('message', (msg, rinfo) => {
    messageCounter++;
    console.log(`[UDP] Received from ${rinfo.address}:${rinfo.port}: ${msg.toString()}`);
    console.log(`[UDP] Message #${messageCounter}`);

    // Append message to CSV file
    const timestamp = new Date().toISOString();
    const csvLine = `${timestamp},${messageCounter},${msg.toString()}\n`;
    fs.appendFileSync(csvFile, csvLine);

    espClient = rinfo;
    // Forward data to all connected web clients
    let forwardedCount = 0;
    webClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client.dataChannel) {
            client.dataChannel.send(msg.toString());
            forwardedCount++;
        }
    });
    console.log(`[UDP] Forwarded to ${forwardedCount} web clients`);
});

udpServer.on('listening', () => {
    const address = udpServer.address();
    console.log(`[UDP] Server listening on ${address.address}:${address.port}`);
});

udpServer.on('error', (err) => {
    console.error(`[UDP] Server error: ${err}`);
});

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
    console.log(`[WS] New connection from ${req.socket.remoteAddress}`);
    webClients.add(ws);
    console.log(`[WS] Total connected clients: ${webClients.size}`);

    ws.on('message', (message) => {
        const msg = JSON.parse(message);
        console.log(`[WS] Received message type: ${msg.type}`);

        if (msg.type === 'offer') {
            console.log('[WS] Received WebRTC offer');
            // Store data channel info
            ws.dataChannel = {
                send: (data) => {
                    ws.send(JSON.stringify({
                        type: 'data',
                        data: data
                    }));
                }
            };

            // Send back dummy answer
            ws.send(JSON.stringify({
                type: 'answer',
                sdp: {
                    type: 'answer',
                    sdp: 'v=0\r\n...' // Simplified SDP
                }
            }));
            console.log('[WS] Sent WebRTC answer');
        }
    });

    ws.on('close', () => {
        webClients.delete(ws);
        console.log(`[WS] Client disconnected. Remaining clients: ${webClients.size}`);
    });

    ws.on('error', (error) => {
        console.error(`[WS] Client error: ${error}`);
    });
});

wss.on('error', (error) => {
    console.error(`[WS] Server error: ${error}`);
});

console.log('[Server] Starting...');
console.log('[Server] Signaling server running on port 8080');
console.log('[Server] UDP server running on port 50001');

udpServer.bind(50001);
