// src/api/podcastApi.ts
import mockBestPodcasts from '../mocks/mockBestPodcasts.json';
import mockDetails from '../mocks/mockDetails.json';

const BASE_URL = 'https://listen-api.listennotes.com/api/v2';

// Безпечно дістаємо ключ із середовища Vite
const getApiKey = (): string => import.meta.env.VITE_LISTEN_API_KEY || '';

// 🔁 РЕЖИМ РОЗРОБКИ (ПЕРЕМИКАЧ):
// true  — додаток завжди бере локальні мок-дані (для розробки зараз з простроченим ключем)
// false — додаток робить реальні живі запити в інтернет (для фінальної здачі)
const USE_MOCK_MODE = true; 

// 1. Отримання найкращих подкастів
export async function fetchBestPodcasts(page: number = 1) {
  if (USE_MOCK_MODE) {
    console.log('[Mock API] fetchBestPodcasts викликано');
    return mockBestPodcasts;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/best_podcasts?sort=recent_published_first&page=${page}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-ListenAPI-Key': getApiKey(),
        },
      }
    );
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch best podcasts:', error);
    return mockBestPodcasts; // Якщо навіть у живому режимі щось впаде — підстраховка моками
  }
}

// 2. Пошук подкастів
export async function searchPodcasts(query: string, offset: number = 0) {
  if (USE_MOCK_MODE) {
    console.log('[Mock API] searchPodcasts викликано');
    const queryLower = query.toLowerCase();
    const filtered = mockBestPodcasts.podcasts.filter(p =>
      p.title.toLowerCase().includes(queryLower) || p.publisher.toLowerCase().includes(queryLower)
    );
    return { podcasts: filtered, has_next: false, page_number: 1 };
  }

  try {
    const response = await fetch(
      `${BASE_URL}/search?q=${encodeURIComponent(query)}&type=podcast&offset=${offset}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-ListenAPI-Key': getApiKey(),
        },
      }
    );
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to search podcasts:', error);
    return { podcasts: mockBestPodcasts.podcasts, has_next: false, page_number: 1 };
  }
}

// 3. Деталі подкасту
export async function fetchPodcastDetails(id: string, nextPubDate: number | null = null) {
  if (USE_MOCK_MODE) {
    console.log('[Mock API] fetchPodcastDetails викликано');
    return mockDetails;
  }

  try {
    let url = `${BASE_URL}/podcasts/${id}`;
    if (nextPubDate) {
      url += `?next_episode_pub_date=${nextPubDate}`;
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-ListenAPI-Key': getApiKey(),
      },
    });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch podcast details:', error);
    return mockDetails;
  }
}