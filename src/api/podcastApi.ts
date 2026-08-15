// Флаг для перемикання між тестовим та реальним API
// true — безкоштовний тестовий сервер (без лімітів, не потрібен ключ)
// false — реальний сервер (потрібен свіжий ключ в .env.local)
const USE_TEST_API = true;

// Базові URL для обох режимів
const BASE_URL = USE_TEST_API
  ? 'https://listen-api-test.listennotes.com/api/v2'
  : 'https://listen-api.listennotes.com/api/v2';

/**
 * Отримує API-ключ із безпечного сховища Vite (.env.local)
 */
const getApiKey = (): string => import.meta.env.VITE_LISTEN_API_KEY || '';

/**
 * Отримує тестовий ID підкасту із безпечного сховища Vite (.env.local)
 * Якщо змінна не задана, використовує дефолтний офіційний ID для мок-сервера
 */
const getTestPodcastId = (): string => import.meta.env.VITE_TEST_PODCAST_ID || '4d3fe71774164962b854f6ae184de262';

/**
 * Формує заголовки для HTTP-запитів залежно від обраного режиму
 */
const getHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  // Якщо ми НЕ на тестовому сервері, обов'язково додаємо секретний ключ
  if (!USE_TEST_API) {
    headers['X-ListenAPI-Key'] = getApiKey();
  }

  return headers;
};

// =========================================================================
// ЕНДПОІНТИ API
// =========================================================================

/**
 * 1. Отримання списку найкращих підкастів (Головна сторінка)
 */
export async function fetchBestPodcasts(page: number = 1) {
  try {
    const response = await fetch(`${BASE_URL}/best_podcasts?page=${page}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch best podcasts:', error);
    throw error;
  }
}

/**
 * 2. Пошук подкастів за ключовим словом
 */
export async function searchPodcasts(q: string, offset: number = 0) {
  try {
    const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(q)}&offset=${offset}&type=podcast`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to search podcasts:', error);
    throw error;
  }
}

/**
 * 3. Отримання деталей конкретного підкасту та його епізодів
 */
export async function fetchPodcastDetails(id: string, nextPubDate: number | null = null) {
  // Захист для крос-чеку: на тестовому сервері використовуємо прихований тестовий ID подкасту,
  // щоб сторінка деталей відкривалася успішно при кліку на будь-яку картку.
  const targetId = USE_TEST_API ? getTestPodcastId() : id;
  
  let targetUrl = `${BASE_URL}/podcasts/${targetId}`;
  
  // Пагінація епізодів (на тестовому сервері додаткові сторінки зазвичай відсутні)
  if (nextPubDate && !USE_TEST_API) {
    targetUrl += `?next_episode_pub_date=${nextPubDate}`;
  }

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch podcast details:', error);
    throw error;
  }
}