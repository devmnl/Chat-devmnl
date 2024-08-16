const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");

dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });
let onlineUsers = 0; // Contador para usuários online

wss.on("connection", (ws) => {
    onlineUsers++; // Incrementa ao conectar um novo usuário
    broadcastOnlineCount(); // Envia a contagem atualizada para todos os clientes

    ws.on("error", console.error);

    ws.on("message", (data) => {
        // Reenvia a mensagem recebida para todos os clientes
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === ws.OPEN) {
                client.send(data.toString());
            }
        });
    });

    ws.on("close", () => {
        onlineUsers--; // Decrementa ao desconectar um usuário
        broadcastOnlineCount(); // Envia a contagem atualizada para todos os clientes
    });

    console.log("Client connected");
});

function broadcastOnlineCount() {
    const data = JSON.stringify({ type: 'onlineCount', count: onlineUsers });
    console.log("Broadcasting online count:", data); // Log para diagnóstico
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

