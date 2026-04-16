from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from rpc_handler import dispatch
import asyncio

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            response = await dispatch(data, websocket)
            if response:
                await websocket.send_text(response)
    except WebSocketDisconnect:
        print("Client disconnected")
