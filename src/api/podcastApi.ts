
const BASE_URL = 'https://listen-api.listennotes.com/api/v2';

// Безпечно дістаємо ключ із середовища Vite
const getApiKey = (): string => import.meta.env.VITE_LISTEN_API_KEY || '';

// 1. Отримання найкращих подкастів (Експортуємо саме як fetchBestPodcasts)
export async function fetchBestPodcasts(page: number = 1) {
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
    return null;
  }
}

// 2. Пошук подкастів (Експортуємо саме як searchPodcasts)
export async function searchPodcasts(query: string, offset: number = 0) {
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
    return null;
  }
}

// 3. Деталі подкасту для другого розділу таски
export async function fetchPodcastDetails(id: string, nextPubDate: number | null = null) {
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
    return null;
  }
}