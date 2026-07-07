import { fetchBestPodcasts, searchPodcasts } from '../api/podcastApi';
import { navigateTo } from '../router/router';

let debounceTimeout: number;

// Зберігаємо стан для пагінації 
let currentBestPage = 1;
let currentSearchOffset = 0;
let currentQuery = '';
let allPodcasts: any[] = [];

export async function renderHome() {
  const appDiv = document.querySelector<HTMLDivElement>('#app');
  if (!appDiv) return;

  // Скидаємо стан при першому рендері, якщо запит порожній
  if (!currentQuery) {
    currentBestPage = 1;
    allPodcasts = [];
  }

  // 1. Малюємо каркас сторінки
  appDiv.innerHTML = `
    <div style="padding: 20px; max-width: 1200px; margin: 0 auto; font-family: sans-serif; padding-bottom: 120px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px; color: #fff;">Discover Best Podcasts</h2>
      
      <div style="margin: 20px 0;">
        <input type="text" id="search-input" value="${currentQuery}" placeholder="Search podcasts..." 
          style="padding: 12px 20px; width: 100%; max-width: 400px; background: #222; color: #fff; border: 1px solid #444; border-radius: 4px; font-size: 1rem; outline: none;" />
      </div>

      <div id="podcasts-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px;">
        <div class="loading" style="color: #646cff; font-size: 1.2rem;">Loading amazing podcasts...</div>
      </div>

      <div id="pagination-container" style="text-align: center; margin-top: 40px;"></div>
    </div>
  `;

  const gridContainer = document.getElementById('podcasts-grid');
  const paginationContainer = document.getElementById('pagination-container');
  const searchInput = document.getElementById('search-input') as HTMLInputElement;

  // 2. Функція відображення карток подкастів та прив'язки кліків
  function displayPodcasts(podcasts: any[], append = false) {
    if (!gridContainer) return;

    if (!append) {
      allPodcasts = [...podcasts];
    } else {
      allPodcasts = [...allPodcasts, ...podcasts];
    }

    if (allPodcasts.length === 0) {
      gridContainer.innerHTML = `<p style="color: #666;">No podcasts found.</p>`;
      if (paginationContainer) paginationContainer.innerHTML = '';
      return;
    }

    gridContainer.innerHTML = allPodcasts.map(podcast => `
      <div class="podcast-card" data-id="${podcast.id}" 
        style="background: #181818; padding: 15px; border-radius: 6px; cursor: pointer; transition: background 0.3s; border: 1px solid #222;"
        onmouseenter="this.style.background='#282828'"
        onmouseleave="this.style.background='#181818'">
        <img src="${podcast.image || podcast.thumbnail}" alt="${podcast.title}" style="width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 4px; margin-bottom: 10px;" />
        <h4 style="margin: 0 0 6px 0; font-size: 0.95rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${podcast.title_original || podcast.title}</h4>
        <p style="margin: 0; font-size: 0.8rem; color: #aaa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">By ${podcast.publisher_original || podcast.publisher || 'Unknown'}</p>
      </div>
    `).join('');

    // Вішаємо обробник подій для SPA-переходу
    const cards = gridContainer.querySelectorAll('.podcast-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const podcastId = card.getAttribute('data-id');
        if (podcastId) {
          navigateTo(`podcast/${podcastId}`); 
        }
      });
    });
  }

  // 3. Функція для рендеру кнопки "Load More"
  function renderLoadMoreButton(hasNextPage: boolean, loadMoreAction: () => void) {
    if (!paginationContainer) return;

    if (!hasNextPage) {
      paginationContainer.innerHTML = '';
      return;
    }

    paginationContainer.innerHTML = `
      <button id="load-more-btn" style="background: #646cff; color: #fff; border: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 1rem; transition: background 0.2s;">
        Load More Podcasts
      </button>
    `;

    document.getElementById('load-more-btn')?.addEventListener('click', loadMoreAction);
  }

  // 4. Завантаження початкових даних (Best Podcasts)
  if (!currentQuery) {
    const data = await fetchBestPodcasts(currentBestPage);
    if (data && data.podcasts) {
      displayPodcasts(data.podcasts);
      renderLoadMoreButton(data.has_next, async () => {
        currentBestPage = data.next_page_number;
        const nextData = await fetchBestPodcasts(currentBestPage);
        if (nextData && nextData.podcasts) {
          displayPodcasts(nextData.podcasts, true);
          renderLoadMoreButton(nextData.has_next, loadMoreActionForBest(nextData));
        }
      });
    } else {
      if (gridContainer) gridContainer.innerHTML = `<p style="color: red;">Failed to load podcasts.</p>`;
    }
  } else {
    // Якщо повернулися на сторінку, а пошук вже був введений
    const data = await searchPodcasts(currentQuery, currentSearchOffset);
    if (data) {
      displayPodcasts(data.results || []);
      renderLoadMoreButton(data.next_offset !== undefined, () => loadMoreSearch(data));
    }
  }

  // Допоміжні функції для оновлення замикання кнопки пагінації
  function loadMoreActionForBest(latestData: any) {
    return async () => {
      currentBestPage = latestData.next_page_number;
      const nextData = await fetchBestPodcasts(currentBestPage);
      if (nextData && nextData.podcasts) {
        displayPodcasts(nextData.podcasts, true);
        renderLoadMoreButton(nextData.has_next, loadMoreActionForBest(nextData));
      }
    };
  }

  async function loadMoreSearch(latestData: any) {
    currentSearchOffset = latestData.next_offset;
    const nextData = await searchPodcasts(currentQuery, currentSearchOffset);
    if (nextData && nextData.results) {
      displayPodcasts(nextData.results, true);
      renderLoadMoreButton(nextData.next_offset !== undefined, () => loadMoreSearch(nextData));
    }
  }

  // 5. Логіка пошуку з Debounce
  searchInput?.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value.trim();
    currentQuery = query;

    if (gridContainer) {
      gridContainer.innerHTML = `<div class="loading" style="color: #646cff; font-size: 1.2rem;">Searching...</div>`;
    }
    if (paginationContainer) paginationContainer.innerHTML = '';

    clearTimeout(debounceTimeout);

    debounceTimeout = window.setTimeout(async () => {
      if (currentQuery === '') {
        currentBestPage = 1;
        const data = await fetchBestPodcasts(currentBestPage);
        if (data && data.podcasts) {
          displayPodcasts(data.podcasts);
          renderLoadMoreButton(data.has_next, loadMoreActionForBest(data));
        }
      } else {
        currentSearchOffset = 0;
        const data = await searchPodcasts(currentQuery, currentSearchOffset);
        if (data && data.results) {
          displayPodcasts(data.results);
          renderLoadMoreButton(data.next_offset !== undefined, () => loadMoreSearch(data));
        }
      }
    }, 500);
  });
}