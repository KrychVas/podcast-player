import { renderHome } from '../pages/Home';
import { renderDetails } from '../pages/Details';
import { renderPlaylist } from '../pages/Playlist';

// Виносимо логіку перевірки шляху в окрему функцію, яку можна викликати будь-коли
function handleRouting(path: string) {
  // Очищаємо шлях від початкових та кінцевих слешів
  const cleanRoute = path.replace(/^\/+|\/+$/g, '');

  console.log('Router checking route:', cleanRoute);

  // 1. Динамічний роут для сторінки деталей подкасту
  if (cleanRoute.startsWith('podcast/')) {
    const podcastId = cleanRoute.split('/')[1];
    if (podcastId) {
      renderDetails(podcastId);
      return;
    }
  }

  // 2. Статичні сторінки
  switch (cleanRoute) {
    case 'playlist':
      renderPlaylist();
      break;
    case 'home':
    case '':
    default:
      renderHome();
      break;
  }
}

export function navigateTo(route: string) {
  // Форматуємо шлях для адресного рядка
  const formattedPath = route.startsWith('/') ? route : `/${route}`;
  window.history.pushState({}, '', formattedPath === '/home' ? '/' : formattedPath);

  // 💥 ПРЯМИЙ ВИКЛИК: Змушуємо роутер миттєво перемикати інтерфейс!
  handleRouting(route);
}

// Слухаємо кнопки Назад/Вперед у браузері
window.addEventListener('popstate', () => {
  const path = window.location.pathname;
  handleRouting(path);
});