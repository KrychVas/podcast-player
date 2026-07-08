// src/utils/storage.ts

export interface PlaylistItem {
  id: string;
  title: string;
  audio: string;
  podcastTitle: string;
}

const PLAYLIST_KEY = 'podcast_playlist';
const PROGRESS_KEY = 'podcast_progress';

// --- ЛОГІКА ПЛЕЙЛІСТА ---

export function getPlaylist(): PlaylistItem[] {
  const data = localStorage.getItem(PLAYLIST_KEY);
  return data ? JSON.parse(data) : [];
}

export function addToPlaylist(item: PlaylistItem): void {
  const playlist = getPlaylist();
  if (!playlist.some(i => i.id === item.id)) {
    playlist.push(item);
    localStorage.setItem(PLAYLIST_KEY, JSON.stringify(playlist));
  }
}

export function removeFromPlaylist(episodeId: string): void {
  let playlist = getPlaylist();
  playlist = playlist.filter(item => item.id !== episodeId);
  localStorage.setItem(PLAYLIST_KEY, JSON.stringify(playlist));
}

export function isInPlaylist(episodeId: string): boolean {
  return getPlaylist().some(item => item.id === episodeId);
}

// --- ЛОГІКА ХОДУ ВІДТВОРЕННЯ (User Story 8) ---

export function saveEpisodeProgress(audioUrl: string, currentTime: number): void {
  const progressMap = getProgressMap();
  progressMap[audioUrl] = currentTime;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressMap));
}

export function getEpisodeProgress(audioUrl: string): number {
  const progressMap = getProgressMap();
  const lastTime = progressMap[audioUrl] || 0;
  
  // Відновлюємо відтворення приблизно з 10 секунд до останньої позиції
  const resumeTime = lastTime - 10;
  return resumeTime > 0 ? resumeTime : 0;
}

function getProgressMap(): Record<string, number> {
  const data = localStorage.getItem(PROGRESS_KEY);
  return data ? JSON.parse(data) : {};
}