// src/pages/Details.ts
import { fetchPodcastDetails } from '../api/podcastApi';
import { playEpisode } from '../utils/player';
import { isInPlaylist, addToPlaylist, removeFromPlaylist } from '../utils/storage';

export async function renderDetails(podcastId: string) {
  const appDiv = document.querySelector<HTMLDivElement>('#app');
  if (!appDiv) return;

  // Красивий Spotify індикатор завантаження
  appDiv.innerHTML = `<div class="loading">Loading podcast details...</div>`;

  try {
    const podcast = await fetchPodcastDetails(podcastId);

    if (!podcast || !podcast.episodes) {
      appDiv.innerHTML = `
        <div class="error-container">
          <p>Failed to load podcast details. Please try again later.</p>
          <button id="back-to-home-error" class="spotify-btn">← Back to Home</button>
        </div>
      `;
      document.getElementById('back-to-home-error')?.addEventListener('click', () => {
        window.history.pushState({}, '', '/podcast/');
        window.dispatchEvent(new Event('popstate'));
      });
      return;
    }

    // Чиста структура без брудних inline-style атрибутів!
    appDiv.innerHTML = `
      <div class="details-container">
        <button id="back-to-home-btn" class="back-btn-spotify">← Back to Home</button>
        
        <div class="podcast-header">
          <img src="${podcast.image}" alt="${podcast.title}" class="podcast-header-img" />
          <div class="podcast-header-info">
            <span class="podcast-badge">PODCAST</span>
            <h2>${podcast.title}</h2>
            <p class="podcast-author">By ${podcast.publisher}</p>
            <p class="podcast-desc">${podcast.description || 'No description available.'}</p>
          </div>
        </div>

        <h3 class="section-title">All Episodes (${podcast.total_episodes || podcast.episodes.length})</h3>
        
        <div class="episodes-list">
          ${podcast.episodes.map((ep: any) => {
            const isFavorite = isInPlaylist(ep.id);

            return `
              <div class="episode-row">
                <div class="episode-main-info">
                  <h4>${ep.title}</h4>
                  <p class="episode-date">Published: ${new Date(ep.pub_date_ms).toLocaleDateString()}</p>
                </div>
                <div class="episode-actions">
                  <button class="play-episode-btn spotify-play-badge" data-audio="${ep.audio}" data-title="${ep.title}">▶ Play</button>
                  <button class="toggle-playlist-btn ${isFavorite ? 'in-playlist' : ''}" 
                          data-id="${ep.id}" 
                          data-audio="${ep.audio}" 
                          data-title="${ep.title}" 
                          data-podcast="${podcast.title}">
                    ${isFavorite ? '💖 Saved' : '🤍 Save'}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    attachNavigationEvents();
    attachPlayerAndPlaylistEvents(appDiv);

  } catch (error) {
    console.error('Error rendering podcast details:', error);
    appDiv.innerHTML = `<div class="error-text">Failed to load data. Please try again later.</div>`;
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

  const playlistButtons = appDiv.querySelectorAll('.toggle-playlist-btn');
  playlistButtons.forEach(button => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-id')!;
      const audio = button.getAttribute('data-audio')!;
      const title = button.getAttribute('data-title')!;
      const podcastTitle = button.getAttribute('data-podcast')!;

      if (isInPlaylist(id)) {
        removeFromPlaylist(id);
        button.textContent = '🤍 Save';
        button.classList.remove('in-playlist');
      } else {
        addToPlaylist({ id, title, audio, podcastTitle });
        button.textContent = '💖 Saved';
        button.classList.add('in-playlist');
      }
    });
  });
}