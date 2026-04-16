import chromadb
from sentence_transformers import SentenceTransformer
import ollama
import json
import logging

try:
    chroma_client = chromadb.Client()
    collection = chroma_client.get_or_create_collection(name="tracks")
    embedder = SentenceTransformer('all-MiniLM-L6-v2')

    # Seed mock data
    placeholder_tracks = [
        {"id": "1", "title": "Dark Techno 130BPM", "url": "/api/sc-proxy?id=123984", "bpm": 130.0, "text": "mood:Dark genre:Hard Techno lang:Instrumental"},
        {"id": "2", "title": "Euphoric Trance", "url": "/api/sc-proxy?id=123985", "bpm": 138.0, "text": "mood:Euphoric genre:Psytrance lang:Instrumental"},
        {"id": "3", "title": "Deep Focus LoFi", "url": "/api/sc-proxy?id=123986", "bpm": 85.0, "text": "mood:Deep Focus genre:Lo-Fi lang:Instrumental"}
    ]
    if collection.count() == 0:
        docs = [t["text"] for t in placeholder_tracks]
        embeddings = embedder.encode(docs).tolist()
        metadatas = [{"title": t["title"], "url": t["url"], "bpm": t["bpm"]} for t in placeholder_tracks]
        ids = [t["id"] for t in placeholder_tracks]
        collection.add(documents=docs, embeddings=embeddings, metadatas=metadatas, ids=ids)
except Exception as e:
    logging.warning(f"Failed embedding initialize: {e}")

def select_track(mood, genre, language, current_bpm):
    query = f"mood:{mood} genre:{genre} lang:{language}"
    try:
        query_emb = embedder.encode([query]).tolist()
        results = collection.query(query_embeddings=query_emb, n_results=5)
        candidates = results['metadatas'][0] if results['metadatas'] else []
        if not candidates:
             raise ValueError("Empty candidate pool")
    except Exception as e:
        logging.warning("ChromaDB error using default")
        candidates = [{"url": "/api/sc-proxy?id=123985", "title": "Euphoric Preset", "bpm": 138.0}]

    prompt = f"You are DJ_404, a high-fidelity spatial DJ agent. Given the user wants {query} and current BPM is {current_bpm}, rank these tracks and return the best one as strictly valid JSON {{\"url\": \"\", \"title\": \"\", \"bpm\": 0.0}}: {json.dumps(candidates)}"
    
    try:
        res = ollama.generate(model="llama3", prompt=prompt)
        text = res['response']
        import re
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
             return json.loads(match.group(0))
    except Exception as e:
        pass # fallback
        
    return candidates[0]
