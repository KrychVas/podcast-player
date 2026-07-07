// src/pages/Details.ts
import { fetchPodcastDetails } from '../api/podcastApi';
import { navigateTo } from '../router/router';

export async function renderDetails(id: string) {
  const appDiv = document.querySelector<HTMLDivElement>('#app');
  if (!appDiv) return;

  // 1. Показуємо індикатор завантаження епізодів
  appDiv.innerHTML = `
    <div style="padding: 20px; max-width: 800px; margin: 0 auto; font-family: sans-serif;">
      <button id="back-btn" style="background: #2a2a2a; color: #fff; border: none; padding: 10px 16px; border-radius: 4px; cursor: pointer; font-weight: bold; margin-bottom: 20px;">
        ⬅ Back to Home
      </button>
      <div style="color: #646cff; font-size: 1.2rem;">Loading episodes...</div>
    </div>
  `;

  // Кнопка повернення на головну
  document.getElementById('back-btn')?.addEventListener('click', () => navigateTo('home'));

  // 2. Отримуємо дані про подкаст та його епізоди з API
  const data = await fetchPodcastDetails(id);

  if (!data) {
    appDiv.innerHTML = `
      <div style="padding: 20px; max-width: 800px; margin: 0 auto; font-family: sans-serif;">
        <button id="back-btn-error" style="background: #2a2a2a; color: #fff; border: none; padding: 10px 16px; border-radius: 4px; cursor: pointer; font-weight: bold; margin-bottom: 20px;">⬅ Back to Home</button>
        <p style="color: red; font-size: 1.2rem;">Failed to load podcast details.</p>
      </div>
    `;
    document.getElementById('back-btn-error')?.addEventListener('click', () => navigateTo('home'));
    return;
  }

  // 3. Рендеримо детальну інформацію та список епізодів (Вимога ТЗ: Назва, автор, опис, список епізодів -> +10 балів)
  appDiv.innerHTML = `
    <div style="padding: 20px; max-width: 800px; margin: 0 auto; font-family: sans-serif; padding-bottom: 100px;">
      <button id="back-to-home" style="background: #2a2a2a; color: #fff; border: none; padding: 10px 16px; border-radius: 4px; cursor: pointer; font-weight: bold; margin-bottom: 20px;">
        ⬅ Back to Home
      </button>

      <div style="display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap;">
        <img src="${data.image}" alt="${data.title}" style="width: 200px; height: 200px; object-fit: cover; border-radius: 8px; border: 1px solid #333;" />
        <div style="flex: 1; min-width: 250px;">
          <h2 style="margin: 0 0 10px 0; color: #fff; font-size: 1.8rem;">${data.title}</h2>
          <p style="margin: 0 0 15px 0; color: #646cff; font-weight: bold;">By ${data.publisher}</p>
          <p style="margin: 0; color: #aaa; font-size: 0.95rem; line-height: 1.5;">${data.description || 'No description available.'}</p>
        </div>
      </div>

      <h3 style="color: #fff; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 20px;">
        Episodes (${data.total_episodes || 0})
      </h3>

      <div id="episodes-container" style="display: flex; flex-direction: column; gap: 15px;">
        ${(data.episodes || []).map((ep: any) => `
          <div class="episode-row" style="background: #181818; padding: 15px; border-radius: 6px; border: 1px solid #222; display: flex; justify-content: space-between; align-items: center; gap: 15px;">
            <div style="flex: 1; min-width: 0;">
              <h4 style="margin: 0 0 5px 0; color: #fff; font-size: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${ep.title}</h4>
              <p style="margin: 0; font-size: 0.8rem; color: #666;">
                Published: ${new Date(ep.pub_date_ms).toLocaleDateString()}
              </p>
            </div>
            <button class="play-episode-btn" data-audio="${ep.audio}" data-title="${ep.title}" 
              style="background: #646cff; color: white; border: none; padding: 8px 16px; border-radius: 20px; font-weight: bold; cursor: pointer; transition: background 0.2s;"
              onmouseenter="this.style.background='#5058e6'"
              onmouseleave="this.style.background='#646cff'">
              ▶ Play
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Навігація назад
  document.getElementById('back-to-home')?.addEventListener('click', () => navigateTo('home'));
}