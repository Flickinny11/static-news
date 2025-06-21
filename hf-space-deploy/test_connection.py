import asyncio
import websockets
import json

async def test_connection():
    uri = "wss://alledged-static-news-backend.hf.space/ws"
    try:
        async with websockets.connect(uri) as websocket:
            # Send test message
            await websocket.send(json.dumps({
                "type": "status_request"
            }))
            
            # Wait for response
            response = await websocket.recv()
            data = json.loads(response)
            print(f"✅ Connected! Status: {data}")
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
