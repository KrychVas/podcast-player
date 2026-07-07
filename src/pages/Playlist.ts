export function renderPlaylist() {
  const appDiv = document.querySelector<HTMLDivElement>('#app');
  if (appDiv) appDiv.innerHTML = '<h2>My Playlist</h2>';
}