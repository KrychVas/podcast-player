import { fetchBestPodcasts, searchPodcasts } from '../api/podcastApi';
import { navigateTo } from '../router/router';

let debounceTimeout: number;

let currentBestPage = 1;
let currentSearchOffset = 0;
let currentQuery = '';
let allPodcasts: any[] = [];

export async function renderHome() {
  const appDiv = document.querySelector<HTMLDivElement>('#app');
  if (!appDiv) return;

  if (!currentQuery) {
    currentBestPage = 1;
    allPodcasts = [];
  }

  // Малюємо каркас сторінки через класи зі style.css
  appDiv.innerHTML = `
    <div class="page-container">
      <h2 class="page-title">Discover Best Podcasts</h2>
      
      <div class="search-wrapper">
        <input type="text" id="search-input" value="${currentQuery}" placeholder="What do you want to listen to?" />
      </div>

      <div id="podcasts-grid" class="podcast-grid">
        <div class="loading">Loading amazing podcasts...</div>
      </div>

      <div id="pagination-container" class="pagination-wrapper"></div>
    </div>
  `;

  const gridContainer = document.getElementById('podcasts-grid');
  const paginationContainer = document.getElementById('pagination-container');
  const searchInput = document.getElementById('search-input') as HTMLInputElement;

  function displayPodcasts(podcasts: any[], append = false) {
    if (!gridContainer) return;

    if (!append) {
      allPodcasts = [...podcasts];
    } else {
      allPodcasts = [...allPodcasts, ...podcasts];
    }

    if (allPodcasts.length === 0) {
      gridContainer.innerHTML = `<p class="no-results">No podcasts found.</p>`;
      if (paginationContainer) paginationContainer.innerHTML = '';
      return;
    }

    // Рендеримо картки під Grid сітку
    gridContainer.innerHTML = allPodcasts.map(podcast => `
      <div class="podcast-card" data-id="${podcast.id}">
        <img src="${podcast.image || podcast.thumbnail}" alt="${podcast.title}" loading="lazy" />
        <h4>${podcast.title_original || podcast.title}</h4>
        <p>By ${podcast.publisher_original || podcast.publisher || 'Unknown'}</p>
      </div>
    `).join('');

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

  function renderLoadMoreButton(hasNextPage: boolean, loadMoreAction: () => void) {
    if (!paginationContainer) return;

    if (!hasNextPage) {
      paginationContainer.innerHTML = '';
      return;
    }

    paginationContainer.innerHTML = `
      <button id="load-more-btn" class="spotify-btn">
        Load More Podcasts
      </button>
    `;

    document.getElementById('load-more-btn')?.addEventListener('click', loadMoreAction);
  }

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
      if (gridContainer) gridContainer.innerHTML = `<p class="error-text">Failed to load podcasts.</p>`;
    }
  } else {
    const data = await searchPodcasts(currentQuery, currentSearchOffset);
    if (data) {
      displayPodcasts(data.results || []);
      renderLoadMoreButton(data.next_offset !== undefined, () => loadMoreSearch(data));
    }
  }

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

  searchInput?.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value.trim();
    currentQuery = query;

    if (gridContainer) gridContainer.innerHTML = `<div class="loading">Searching...</div>`;
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