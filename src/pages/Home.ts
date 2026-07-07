import { fetchBestPodcasts, searchPodcasts } from '../api/podcastApi';
import { navigateTo } from '../router/router';

let debounceTimeout: number;

export async function renderHome() {
  const appDiv = document.querySelector<HTMLDivElement>('#app');
  if (!appDiv) return;

  // 1. Малюємо каркас сторінки (Зона пошуку + Контейнер для карток)
  appDiv.innerHTML = `
    <div style="padding: 20px; max-width: 1200px; margin: 0 auto; font-family: sans-serif;">
      <h2 style="font-size: 2rem; margin-bottom: 20px; color: #fff;">Discover Best Podcasts</h2>
      
      <div style="margin: 20px 0;">
        <input type="text" id="search-input" placeholder="Search podcasts..." 
          style="padding: 12px 20px; width: 100%; max-width: 400px; background: #222; color: #fff; border: 1px solid #444; border-radius: 4px; font-size: 1rem; outline: none;" />
      </div>

      <div id="podcasts-list">
        <div class="loading" style="color: #646cff; font-size: 1.2rem;">Loading amazing podcasts...</div>
      </div>
    </div>
  `;

  const container = document.getElementById('podcasts-list');
  const searchInput = document.getElementById('search-input') as HTMLInputElement;

  // 2. Функція побудови карток подкастів 
  function displayPodcasts(podcasts: any[]) {
    if (!container) return;
    if (!podcasts || podcasts.length === 0) {
      container.innerHTML = `<p style="color: #666;">No podcasts found.</p>`;
      return;
    }

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px;">
        ${podcasts.map(podcast => `
          <div class="podcast-card" data-id="${podcast.id}" 
            style="background: #181818; padding: 15px; border-radius: 6px; cursor: pointer; transition: background 0.3s; border: 1px solid #222;"
            onmouseenter="this.style.background='#282828'"
            onmouseleave="this.style.background='#181818'">
            <img src="${podcast.image || podcast.thumbnail}" alt="${podcast.title}" style="width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 4px; margin-bottom: 10px;" />
            <h4 style="margin: 0 0 6px 0; font-size: 0.95rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${podcast.title_original || podcast.title}</h4>
            <p style="margin: 0; font-size: 0.8rem; color: #aaa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">By ${podcast.publisher_original || podcast.publisher || 'Unknown'}</p>
          </div>
        `).join('')}
      </div>
    `;

    // Вішаємо обробник подій на кожну створену картку подкасту для SPA-переходу
    const cards = container.querySelectorAll('.podcast-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const podcastId = card.getAttribute('data-id');
        if (podcastId) {
          // Використовуємо твою функцію навігації з роутера
          navigateTo(`podcast/${podcastId}`); 
        }
      });
    });
  }

  // 3. Завантажуємо найкращі подкасти при старті сторінки 
  const defaultData = await fetchBestPodcasts();
  if (defaultData && defaultData.podcasts) {
    displayPodcasts(defaultData.podcasts);
  } else {
    if (container) container.innerHTML = `<p style="color: red;">Failed to load podcasts. Check your API key in .env.local</p>`;
  }

  // 4. Логіка пошуку з усуненням брязкоту (Debounce) 
  searchInput?.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value.trim();
    
    if (container) {
      container.innerHTML = `<div class="loading" style="color: #646cff; font-size: 1.2rem;">Searching...</div>`;
    }

    clearTimeout(debounceTimeout);

    // Затримка 500мс, щоб не спамити API на кожну літеру 
    debounceTimeout = window.setTimeout(async () => {
      if (query === '') {
        // Поле порожнє -> повертаємо список найкращих
        const data = await fetchBestPodcasts();
        if (data) displayPodcasts(data.podcasts);
      } else {
        // Є текст -> робимо запит до пошукового API
        const data = await searchPodcasts(query);
        if (data) displayPodcasts(data.results || []);
      }
    }, 500);
  });
}