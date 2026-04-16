import asyncio
import json

def compute_crossfade_schedule(from_bpm, to_bpm, duration_ms, steps=10):
    """Computes a smooth BPM ramp over the duration of a crossfade."""
    schedule = []
    interval = duration_ms / steps
    for i in range(1, steps + 1):
        # Linear interpolation of BPM
        current_target = from_bpm + (to_bpm - from_bpm) * (i / steps)
        schedule.append({
            "t_ms": interval * i,
            "rate": current_target / from_bpm
        })
    return schedule

async def execute_schedule(deck_target, target_bpm, websocket):
    await asyncio.sleep(2) # Simulate processing/cueing wait
    
    # 1. Announce intent
    msg = json.dumps({
         "jsonrpc": "2.0",
         "method": "agent.announce",
         "params": {"message": f"DJ_404: Analyzing energy... Pre-syncing Deck {deck_target} to {target_bpm} BPM."}
    })
    await websocket.send_text(msg)
    
    # 2. Sync BPM
    cmd1 = json.dumps({
         "jsonrpc": "2.0",
         "method": "deck.setBpm",
         "params": {"deckId": deck_target, "targetBpm": target_bpm}
    })
    await websocket.send_text(cmd1)
    
    await asyncio.sleep(3) # Let listeners hear the sync
    
    # 3. Announce Crossfade
    msg2 = json.dumps({
         "jsonrpc": "2.0",
         "method": "agent.announce",
         "params": {"message": f"DJ_404: Phase alignment complete. Executing spatial crossfade."}
    })
    await websocket.send_text(msg2)
    
    # 4. Trigger crossfade spatial movement
    # In a high-fidelity implementation, we'd iterate through compute_crossfade_schedule here
    # but for simplicity we trigger the global crossfade logic in the store.
    cmd2 = json.dumps({
         "jsonrpc": "2.0",
         "method": "mix.crossfade",
         "params": {"from": "A" if deck_target == 'B' else 'B', "to": deck_target, "durationMs": 4000}
    })
    await websocket.send_text(cmd2)
