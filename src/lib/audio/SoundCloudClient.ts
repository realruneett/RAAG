'use server';

export interface SCTrack {
    id: number;
    title: string;
    artwork_url: string | null;
    duration: number;
}

export async function searchTracks(query: string): Promise<SCTrack[]> {
    const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
    if (!clientId) throw new Error("Missing SOUNDCLOUD_CLIENT_ID");

    try {
        const response = await fetch(`https://api.soundcloud.com/tracks?q=${encodeURIComponent(query)}&client_id=${clientId}&limit=10`);
        if (!response.ok) {
           throw new Error("SC Search Failed");
        }
        const data = await response.json();
        return data.map((t: any) => ({
            id: t.id,
            title: t.title,
            artwork_url: t.artwork_url,
            duration: t.duration
        }));
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function resolveStreamUrl(trackId: number): Promise<string> {
    return `/api/sc-proxy?id=${trackId}`;
}
