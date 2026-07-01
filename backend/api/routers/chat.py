from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
from backend.core.encryption import encrypt_message, decrypt_message

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # Maps chat_id to list of active WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, chat_id: str):
        await websocket.accept()
        if chat_id not in self.active_connections:
            self.active_connections[chat_id] = []
        self.active_connections[chat_id].append(websocket)

    def disconnect(self, websocket: WebSocket, chat_id: str):
        if chat_id in self.active_connections:
            self.active_connections[chat_id].remove(websocket)
            if not self.active_connections[chat_id]:
                del self.active_connections[chat_id]

    async def broadcast(self, message: str, chat_id: str):
        if chat_id in self.active_connections:
            for connection in self.active_connections[chat_id]:
                await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/ws/{chat_id}")
async def websocket_endpoint(websocket: WebSocket, chat_id: str):
    await manager.connect(websocket, chat_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Incoming data is expected to be plaintext from the client for this demo.
            # In a real scenario, the payload might be sent encrypted or we encrypt it before storing.
            payload = json.loads(data)
            message_text = payload.get("text", "")
            
            # Encrypt for storage
            encrypted_text = encrypt_message(message_text)
            
            # Broadcast the plain text back to active users in this chat room
            # (or we could broadcast encrypted and let clients decrypt)
            response = {
                "sender": payload.get("sender", "Unknown"),
                "text": message_text,
                "encrypted_stored": encrypted_text
            }
            await manager.broadcast(json.dumps(response), chat_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, chat_id)
        await manager.broadcast(json.dumps({"system": "A user has left the chat."}), chat_id)
