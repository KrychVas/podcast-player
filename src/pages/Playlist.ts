// src/pages/Playlist.ts
import { getPlaylist, removeFromPlaylist } from '../utils/storage';
import { playEpisode } from '../utils/player';

export function renderPlaylist() {
  const appDiv = document.querySelector<HTMLDivElement>('#app');
  if (!appDiv) return;

  const playlist = getPlaylist();

  if (playlist.length === 0) {
    appDiv.innerHTML = `
      <div class="playlist-container" style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: sans-serif; color: #fff; text-align: left;">
        <h2 style="font-size: 2rem; margin-bottom: 20px;">My Playlist</h2>
        <p style="color: #aaa; font-size: 1.1rem; background: #1a1a1a; padding: 20px; border-radius: 8px; border: 1px dashed #333;">
          Your playlist is empty. Go back to Discover and add some amazing episodes!
        </p>
      </div>
    `;
    return;
  }

  appDiv.innerHTML = `
    <div class="playlist-container" style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: sans-serif; color: #fff; text-align: left; padding-bottom: 120px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">My Playlist (${playlist.length})</h2>
      
      <div class="playlist-list" style="display: flex; flex-direction: column; gap: 15px;">
        ${playlist.map(item => `
          <div class="playlist-item-card" id="item-${item.id}" style="background-color: #1a1a1a; padding: 15px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; gap: 15px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 200px;">
              <h4 style="margin: 0 0 5px 0; font-size: 1.05rem; color: #fff;">${item.title}</h4>
              <p style="margin: 0; color: #646cff; font-size: 0.85rem; font-weight: bold;">From: ${item.podcastTitle}</p>
            </div>
            <div style="display: flex; gap: 10px;">
              <button class="play-playlist-btn" data-audio="${item.audio}" data-title="${item.title}" style="padding: 8px 16px; background-color: #646cff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">▶ Play</button>
              <button class="remove-playlist-btn" data-id="${item.id}" style="padding: 8px 12px; background-color: #2a2a2a; color: #ff4d4d; border: 1px solid #ff4d4d; border-radius: 4px; cursor: pointer; font-weight: bold;">❌ Remove</button>
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
        const h2 = appDiv.querySelector('h2');
        if (h2) h2.textContent = `My Playlist (${updatedPlaylist.length})`;
      }
    });
  });
}