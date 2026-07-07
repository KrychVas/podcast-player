import { fetchPodcastDetails } from '../api/podcastApi';
import { navigateTo } from '../router/router';

// Стан для накопичення епізодів при пагінації всередині сторінки деталей
let currentEpisodes: any[] = [];
let nextPubDate: number | null = null;

export async function renderDetails(id: string) {
  const appDiv = document.querySelector<HTMLDivElement>('#app');
  if (!appDiv) return;

  // Скидаємо стан епізодів для нового подкасту
  currentEpisodes = [];
  nextPubDate = null;

  // 1. Показуємо індикатор завантаження епізодів
  appDiv.innerHTML = `
    <div style="padding: 20px; max-width: 800px; margin: 0 auto; font-family: sans-serif;">
      <button id="back-btn" style="background: #2a2a2a; color: #fff; border: none; padding: 10px 16px; border-radius: 4px; cursor: pointer; font-weight: bold; margin-bottom: 20px;">
        ⬅ Back to Home
      </button>
      <div style="color: #646cff; font-size: 1.2rem;">Loading episodes...</div>
    </div>
  `;

  document.getElementById('back-btn')?.addEventListener('click', () => navigateTo('home'));

  // 2. Отримуємо дані з API
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

  // Зберігаємо першу пачку епізодів та дату наступної сторінки
  currentEpisodes = data.episodes || [];
  nextPubDate = data.next_episode_pub_date || null;

  // 3. Рендеримо структуру сторінки
  appDiv.innerHTML = `
    <div style="padding: 20px; max-width: 800px; margin: 0 auto; font-family: sans-serif; padding-bottom: 140px;">
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

      <div id="episodes-list" style="display: flex; flex-direction: column; gap: 15px;"></div>

      <div id="episodes-pagination" style="text-align: center; margin-top: 30px;"></div>
    </div>
  `;

  document.getElementById('back-to-home')?.addEventListener('click', () => navigateTo('home'));

  const episodesListContainer = document.getElementById('episodes-list');
  const paginationContainer = document.getElementById('episodes-pagination');

  // Функція для відрендерення поточного списку епізодів та прив'язки плеєра
  function renderEpisodesMarkup() {
    if (!episodesListContainer) return;

    episodesListContainer.innerHTML = currentEpisodes.map((ep: any) => `
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
    `).join('');

    // Прив'язуємо події до кнопок плеєра
    attachPlayerEvents();
  }

  // Функція для керування кнопкою "Load More Episodes"
  function updatePaginationButton() {
    if (!paginationContainer) return;

    if (!nextPubDate) {
      paginationContainer.innerHTML = '';
      return;
    }

    paginationContainer.innerHTML = `
      <button id="load-more-episodes-btn" style="background: #2a2a2a; color: #fff; border: 1px solid #444; padding: 10px 20px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 0.95rem;">
        Load More Episodes
      </button>
    `;

    document.getElementById('load-more-episodes-btn')?.addEventListener('click', async () => {
      if (!nextPubDate) return;
      const nextData = await fetchPodcastDetails(id, nextPubDate);
      if (nextData && nextData.episodes) {
        currentEpisodes = [...currentEpisodes, ...nextData.episodes];
        nextPubDate = nextData.next_episode_pub_date || null;
        renderEpisodesMarkup();
        updatePaginationButton();
      }
    });
  }

  // Логіка запуску глобального аудіоплеєра
  function attachPlayerEvents() {
    const playButtons = appDiv!.querySelectorAll('.play-episode-btn');
    playButtons.forEach(button => {
      button.addEventListener('click', () => {
        const audioUrl = button.getAttribute('data-audio');
        const episodeTitle = button.getAttribute('data-title');
        const playerFooter = document.getElementById('global-player');

        if (audioUrl && episodeTitle && playerFooter) {
          playerFooter.innerHTML = `
            <div style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 8px; font-family: sans-serif; text-align: left;">
              <div style="font-size: 0.9rem; color: #fff; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                🎵 Now Playing: <span style="color: #646cff;">${episodeTitle}</span>
              </div>
              <audio id="audio-element" src="${audioUrl}" controls autoplay style="width: 100%; height: 40px; outline: none;"></audio>
            </div>
          `;
          const audio = document.getElementById('audio-element') as HTMLAudioElement;
          audio?.play().catch(err => console.log("Playback error:", err));
        }
      });
    });
  }

  // Первинний рендер епізодів та кнопки пагінації
  renderEpisodesMarkup();
  updatePaginationButton();
}