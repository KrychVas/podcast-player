import { getPlaylist, removeFromPlaylist } from '../utils/storage';
import { playEpisode } from '../utils/player';

export function renderPlaylist() {
  const appDiv = document.querySelector<HTMLDivElement>('#app');
  if (!appDiv) return;

  const playlist = getPlaylist();

  if (playlist.length === 0) {
    appDiv.innerHTML = `
      <div class="playlist-container">
        <h2 class="page-title">My Playlist</h2>
        <div class="empty-playlist">
          Your playlist is empty. Go back to Discover and add some amazing episodes!
        </div>
      </div>
    `;
    return;
  }

  appDiv.innerHTML = `
    <div class="playlist-container">
      <h2 class="page-title">My Playlist (${playlist.length})</h2>
      
      <div class="episodes-list">
        ${playlist.map(item => `
          <div class="episode-row" id="item-${item.id}">
            <div class="episode-main-info">
              <h4>${item.title}</h4>
              <p class="podcast-author-link">From: ${item.podcastTitle}</p>
            </div>
            <div class="episode-actions">
              <button class="play-playlist-btn spotify-play-badge" data-audio="${item.audio}" data-title="${item.title}">▶ Play</button>
              <button class="remove-playlist-btn" data-id="${item.id}">❌ Remove</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  attachPlaylistEvents(appDiv);
}

function attachPlaylistEvents(appDiv: HTMLElement) {
  const playButtons = appDiv.querySelectorAll('.play-playlist-btn');
  playButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const audioUrl = btn.getAttribute('data-audio')!;
      const episodeTitle = btn.getAttribute('data-title')!;
      playEpisode(audioUrl, episodeTitle);
    });
  });

  const removeButtons = appDiv.querySelectorAll('.remove-playlist-btn');
  removeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id')!;
      removeFromPlaylist(id);

      const card = document.getElementById(`item-${id}`);
      if (card) card.remove();

      const updatedPlaylist = getPlaylist();
      if (updatedPlaylist.length === 0) {
        renderPlaylist();
      } else {
        const h2 = appDiv.querySelector('.page-title');
        if (h2) h2.textContent = `My Playlist (${updatedPlaylist.length})`;
      }
    });
  });
}