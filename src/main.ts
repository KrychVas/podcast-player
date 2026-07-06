import './style.css';
import { navigateTo } from './router/router';

document.addEventListener('DOMContentLoaded', () => {
  // Навігація по кнопках з шапки index.html
  document.getElementById('nav-home')?.addEventListener('click', () => navigateTo('home'));
  document.getElementById('nav-playlist')?.addEventListener('click', () => navigateTo('playlist'));

  // Стартуємо з головної сторінки
  navigateTo('home');
});