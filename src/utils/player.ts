// src/utils/player.ts
import { saveEpisodeProgress, getEpisodeProgress } from './storage';

export function playEpisode(audioUrl: string, episodeTitle: string) {
  const playerFooter = document.getElementById('global-player');
  if (!playerFooter) return;

  // Модернізована структура плеєра в стилі преміум-додатку
  playerFooter.innerHTML = `
    <div class="spotify-player-container">
      <div class="now-playing-info">
        <span class="music-icon">🎵</span>
        <div class="track-text">
          <div class="track-status">NOW PLAYING</div>
          <div class="track-title" title="${episodeTitle}">${episodeTitle}</div>
        </div>
      </div>
      <div class="audio-wrapper">
        <audio id="audio-element" src="${audioUrl}" controls autoplay></audio>
      </div>
    </div>
  `;

  // Робимо плеєр видимим (якщо він був прихований)
  playerFooter.style.display = 'block';

  const audio = document.getElementById('audio-element') as HTMLAudioElement;
  
  if (audio) {
    const savedTime = getEpisodeProgress(audioUrl);
    if (savedTime > 0) {
      audio.currentTime = savedTime;
    }

    audio.addEventListener('timeupdate', () => {
      if (audio.currentTime > 0) {
        saveEpisodeProgress(audioUrl, audio.currentTime);
      }
    });

    const playPromise = audio.play() as any;
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch((error: any) => {
        console.log("Autoplay blocked or playback error:", error);
      });
    }
  }
}