/**
 * YouTube izle URL'lerinden video kimliği çıkarır (gömülü oynatıcı için).
 */
export function getYouTubeVideoId(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && isLikelyYoutubeId(id) ? id : null;
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      if (u.pathname === "/watch" || u.pathname.startsWith("/watch")) {
        const v = u.searchParams.get("v");
        return v && isLikelyYoutubeId(v) ? v : null;
      }
      const embed = u.pathname.match(/^\/embed\/([^/?]+)/);
      if (embed?.[1] && isLikelyYoutubeId(embed[1])) return embed[1];
      const shorts = u.pathname.match(/^\/shorts\/([^/?]+)/);
      if (shorts?.[1] && isLikelyYoutubeId(shorts[1])) return shorts[1];
    }
  } catch {
    return null;
  }
  return null;
}

function isLikelyYoutubeId(id: string): boolean {
  return /^[\w-]{6,32}$/.test(id);
}

export function getYouTubeEmbedSrc(videoId: string): string {
  const q = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
  });
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${q}`;
}
