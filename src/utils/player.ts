export function playEpisode(audioUrl: string, episodeTitle: string) {
  const playerFooter = document.getElementById('global-player');
  if (!playerFooter) return;

  // Рендеримо плеєр всередині фіксованого футера
  playerFooter.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 8px; font-family: sans-serif; text-align: left; padding: 0 10px;">
      <div style="font-size: 0.9rem; color: #fff; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
        🎵 Now Playing: <span style="color: #646cff;">${episodeTitle}</span>
      </div>
      <audio id="audio-element" src="${audioUrl}" controls autoplay style="width: 100%; height: 40px; outline: none;"></audio>
    </div>
  `;

  const audio = document.getElementById('audio-element') as HTMLAudioElement;
  
  if (audio) {
    // Зберігаємо результат у змінну типу any, щоб обдурити суворий TypeScript
    const playPromise = audio.play() as any;
    
    // Перевіряємо, чи повернувся Promise (захист від старих стандартів)
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch((err: any) => {
        console.log("Autoplay prevented or playback error:", err);
      });
    }
  }
}