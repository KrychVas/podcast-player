// Функція для ініціалізації або оновлення плеєра у футері
export function playEpisode(audioUrl: string, episodeTitle: string) {
  const playerFooter = document.getElementById('global-player');
  if (!playerFooter) return;

  // Оновлюємо вміст футера: додаємо назву епізоду та тег <audio> з контролами
  playerFooter.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 8px; font-family: sans-serif; text-align: left;">
      <div style="font-size: 0.9rem; color: #fff; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
        🎵 Now Playing: <span style="color: #646cff;">${episodeTitle}</span>
      </div>
      <audio id="audio-element" src="${audioUrl}" controls autoplay style="width: 100%; height: 40px; outline: none;"></audio>
    </div>
  `;

  // Автоматично запускаємо аудіо (autoplay іноді блокується браузерами до першого кліку, але ми вже клікнули на "Play")
  const audio = document.getElementById('audio-element') as HTMLAudioElement;
  audio?.play().catch(err => console.log("Autoplay blocked or interrupted:", err));
}