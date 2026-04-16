import json
import asyncio
from track_selector import select_track
from mixer import execute_schedule

async def dispatch(raw_message: str, websocket) -> str | None:
    try:
        msg = json.loads(raw_message)
    except:
        return ""
        
    method = msg.get('method')
    params = msg.get('params')
    req_id = msg.get('id')

    def make_response(result=None, error=None):
        if not req_id: return None
        return json.dumps({"jsonrpc": "2.0", "result": result, "error": error, "id": req_id})
    
    if method == 'session.queryContext':
        return make_response(result="ok")
        
    elif method == 'user.setPreferences':
        mood = params.get('mood')
        genre = params.get('genre')
        language = params.get('language')
        
        # RAG Local AI call
        track = select_track(mood, genre, language, 128.0)
        deck_target = 'B' # simple alternating strategy
        
        # Action 1: Load Track
        load_cmd = json.dumps({
            "jsonrpc": "2.0",
            "method": "deck.loadTrack",
            "params": {"deckId": deck_target, "streamUrl": track['url'], "title": track['title'], "bpm": track['bpm']}
        })
        await websocket.send_text(load_cmd)
        
        # Action 2: Schedule Mix
        asyncio.create_task(execute_schedule(deck_target, track['bpm'], websocket))
        
        return make_response(result="Preferences accepted")
        
    elif method == 'user.correction':
        # Feedback storage for RLHF
        return make_response(result="Feedback stored")
    
    return make_response(error={"code": -32601, "message": "Method not found"})
