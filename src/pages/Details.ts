// src/pages/Details.ts
import { fetchPodcastDetails } from '../api/podcastApi';
import { playEpisode } from '../utils/player';
import { isInPlaylist, addToPlaylist, removeFromPlaylist } from '../utils/storage';

// Тепер функція приймає ОДИН параметр podcastId, як і просить роутер!
export async function renderDetails(podcastId: string) {
  const appDiv = document.querySelector<HTMLDivElement>('#app');
  if (!appDiv) return;

  // Показуємо індикатор завантаження
  appDiv.innerHTML = `<div class="loading" style="color: #646cff; font-size: 1.2rem; padding: 20px;">Loading podcast details...</div>`;

  try {
    const podcast = await fetchPodcastDetails(podcastId);

    if (!podcast || !podcast.episodes) {
      appDiv.innerHTML = `
        <div class="error-container" style="padding: 20px; color: #ff4d4d;">
          <p>Failed to load podcast details. Please try again later.</p>
          <button id="back-to-home-error" class="back-btn" style="padding: 8px 16px; background-color: #2a2a2a; color: #fff; border: none; border-radius: 4px; cursor: pointer;">← Back to Home</button>
        </div>
      `;
      document.getElementById('back-to-home-error')?.addEventListener('click', () => {
        window.history.pushState({}, '', '/podcast/');
        window.dispatchEvent(new Event('popstate'));
      });
      return;
    }

    // Рендеримо основну розмітку сторінки деталей
    appDiv.innerHTML = `
      <div class="details-container" style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: sans-serif; color: #fff; text-align: left; padding-bottom: 120px;">
        <button id="back-to-home-btn" class="back-btn" style="padding: 8px 16px; background-color: #2a2a2a; color: #fff; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 20px;">← Back to Home</button>
        
        <div class="podcast-header" style="display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap;">
          <img src="${podcast.image}" alt="${podcast.title}" style="width: 150px; height: 150px; border-radius: 8px; object-fit: cover;" />
          <div style="flex: 1; min-width: 250px;">
            <h2 style="margin: 0 0 10px 0; font-size: 1.8rem;">${podcast.title}</h2>
            <p style="margin: 0 0 10px 0; color: #646cff; font-weight: bold;">By ${podcast.publisher}</p>
            <p style="margin: 0; color: #aaa; font-size: 0.95rem; line-height: 1.4;">${podcast.description || 'No description available.'}</p>
          </div>
        </div>

        <h3 style="border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 20px;">Episodes (${podcast.total_episodes || podcast.episodes.length})</h3>
        
        <div class="episodes-list" style="display: flex; flex-direction: column; gap: 15px;">
          ${podcast.episodes.map((ep: any) => {
            const isFavorite = isInPlaylist(ep.id);

            return `
              <div class="episode-card" style="background-color: #1a1a1a; padding: 15px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; gap: 15px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 200px;">
                  <h4 style="margin: 0 0 5px 0; font-size: 1.05rem; color: #fff;">${ep.title}</h4>
                  <p style="margin: 0; color: #666; font-size: 0.85rem;">Published: ${new Date(ep.pub_date_ms).toLocaleDateString()}</p>
                </div>
                <div style="display: flex; gap: 10px;">
                  <button class="play-episode-btn" data-audio="${ep.audio}" data-title="${ep.title}" style="padding: 8px 16px; background-color: #646cff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">▶ Play</button>
                  <button class="toggle-playlist-btn" 
                          data-id="${ep.id}" 
                          data-audio="${ep.audio}" 
                          data-title="${ep.title}" 
                          data-podcast="${podcast.title}"
                          style="padding: 8px 12px; background-color: #2a2a2a; color: #ffcc00; border: 1px solid #ffcc00; border-radius: 4px; cursor: pointer; font-weight: bold;">
                    ${isFavorite ? '❌ Remove' : '⭐ Add to Playlist'}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Навішуємо події на кнопки
    attachNavigationEvents();
    attachPlayerAndPlaylistEvents(appDiv);

  } catch (error) {
    console.error('Error rendering podcast details:', error);
    appDiv.innerHTML = `<div class="error" style="color: #ff4d4d; padding: 20px;">Failed to load data. Please try again later.</div>`;
  }
}

function attachNavigationEvents() {
  const backBtn = document.getElementById('back-to-home-btn');
  backBtn?.addEventListener('click', () => {
    window.history.pushState({}, '', '/podcast/');
    window.dispatchEvent(new Event('popstate'));
  });
}

function attachPlayerAndPlaylistEvents(appDiv: HTMLElement) {
  // 1. Події для кнопки Play (Глобальний плеєр)
  const playButtons = appDiv.querySelectorAll('.play-episode-btn');
  playButtons.forEach(button => {
    button.addEventListener('click', () => {
      const audioUrl = button.getAttribute('data-audio');
      const episodeTitle = button.getAttribute('data-title');

      if (audioUrl && episodeTitle) {
        playEpisode(audioUrl, episodeTitle);
      }
    });
  });

  // 2. Події для кнопок додавання/видалення з плейліста
  const playlistButtons = appDiv.querySelectorAll('.toggle-playlist-btn');
  playlistButtons.forEach(button => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-id')!;
      const audio = button.getAttribute('data-audio')!;
      const title = button.getAttribute('data-title')!;
      const podcastTitle = button.getAttribute('data-podcast')!;

      if (isInPlaylist(id)) {
        removeFromPlaylist(id);
        button.textContent = '⭐ Add to Playlist';
        (button as HTMLElement).style.color = '#ffcc00';
        (button as HTMLElement).style.borderColor = '#ffcc00';
      } else {
        addToPlaylist({ id, title, audio, podcastTitle });
        button.textContent = '❌ Remove';
        (button as HTMLElement).style.color = '#ff4d4d';
        (button as HTMLElement).style.borderColor = '#ff4d4d';
      }
    });
  });
}