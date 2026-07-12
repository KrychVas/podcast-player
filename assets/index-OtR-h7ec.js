(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`https://listen-api-test.listennotes.com/api/v2`,t=()=>`4d3fe71774164962b854f6ae184de262`,n=()=>({Accept:`application/json`});async function r(t=1){try{let r=await fetch(`${e}/best_podcasts?page=${t}`,{method:`GET`,headers:n()});if(!r.ok)throw Error(`HTTP error! Status: ${r.status}`);return await r.json()}catch(e){throw console.error(`Failed to fetch best podcasts:`,e),e}}async function i(t,r=0){try{let i=await fetch(`${e}/search?q=${encodeURIComponent(t)}&offset=${r}&type=podcast`,{method:`GET`,headers:n()});if(!i.ok)throw Error(`HTTP error! Status: ${i.status}`);return await i.json()}catch(e){throw console.error(`Failed to search podcasts:`,e),e}}async function a(r,i=null){let a=`${e}/podcasts/${t()}`;try{let e=await fetch(a,{method:`GET`,headers:n()});if(!e.ok)throw Error(`HTTP error! Status: ${e.status}`);return await e.json()}catch(e){throw console.error(`Failed to fetch podcast details:`,e),e}}var o,s=1,c=0,l=``,u=[];async function d(){let e=document.querySelector(`#app`);if(!e)return;l||(s=1,u=[]),e.innerHTML=`
    <div class="page-container">
      <h2 class="page-title">Discover Best Podcasts</h2>
      
      <div class="search-wrapper">
        <input type="text" id="search-input" value="${l}" placeholder="What do you want to listen to?" />
      </div>

      <div id="podcasts-grid" class="podcast-grid">
        <div class="loading">Loading amazing podcasts...</div>
      </div>

      <div id="pagination-container" class="pagination-wrapper"></div>
    </div>
  `;let t=document.getElementById(`podcasts-grid`),n=document.getElementById(`pagination-container`),a=document.getElementById(`search-input`);function d(e,r=!1){if(t){if(u=r?[...u,...e]:[...e],u.length===0){t.innerHTML=`<p class="no-results">No podcasts found.</p>`,n&&(n.innerHTML=``);return}t.innerHTML=u.map(e=>`
      <div class="podcast-card" data-id="${e.id}">
        <img src="${e.image||e.thumbnail}" alt="${e.title}" loading="lazy" />
        <h4>${e.title_original||e.title}</h4>
        <p>By ${e.publisher_original||e.publisher||`Unknown`}</p>
      </div>
    `).join(``),t.querySelectorAll(`.podcast-card`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-id`);t&&O(`podcast/${t}`)})})}}function f(e,t){if(n){if(!e){n.innerHTML=``;return}n.innerHTML=`
      <button id="load-more-btn" class="spotify-btn">
        Load More Podcasts
      </button>
    `,document.getElementById(`load-more-btn`)?.addEventListener(`click`,t)}}if(l){let e=await i(l,c);e&&(d(e.results||[]),f(e.next_offset!==void 0,()=>m(e)))}else{let e=await r(s);e&&e.podcasts?(d(e.podcasts),f(e.has_next,async()=>{s=e.next_page_number;let t=await r(s);t&&t.podcasts&&(d(t.podcasts,!0),f(t.has_next,p(t)))})):t&&(t.innerHTML=`<p class="error-text">Failed to load podcasts.</p>`)}function p(e){return async()=>{s=e.next_page_number;let t=await r(s);t&&t.podcasts&&(d(t.podcasts,!0),f(t.has_next,p(t)))}}async function m(e){c=e.next_offset;let t=await i(l,c);t&&t.results&&(d(t.results,!0),f(t.next_offset!==void 0,()=>m(t)))}a?.addEventListener(`input`,e=>{l=e.target.value.trim(),t&&(t.innerHTML=`<div class="loading">Searching...</div>`),n&&(n.innerHTML=``),clearTimeout(o),o=window.setTimeout(async()=>{if(l===``){s=1;let e=await r(s);e&&e.podcasts&&(d(e.podcasts),f(e.has_next,p(e)))}else{c=0;let e=await i(l,c);e&&e.results&&(d(e.results),f(e.next_offset!==void 0,()=>m(e)))}},500)})}var f=`podcast_playlist`,p=`podcast_progress`;function m(){let e=localStorage.getItem(f);return e?JSON.parse(e):[]}function h(e){let t=m();t.some(t=>t.id===e.id)||(t.push(e),localStorage.setItem(f,JSON.stringify(t)))}function g(e){let t=m();t=t.filter(t=>t.id!==e),localStorage.setItem(f,JSON.stringify(t))}function _(e){return m().some(t=>t.id===e)}function v(e,t){let n=b();n[e]=t,localStorage.setItem(p,JSON.stringify(n))}function y(e){let t=(b()[e]||0)-10;return t>0?t:0}function b(){let e=localStorage.getItem(p);return e?JSON.parse(e):{}}function x(e,t){let n=document.getElementById(`global-player`);if(!n)return;n.innerHTML=`
    <div class="spotify-player-container">
      <div class="now-playing-info">
        <span class="music-icon">🎵</span>
        <div class="track-text">
          <div class="track-status">NOW PLAYING</div>
          <div class="track-title" title="${t}">${t}</div>
        </div>
      </div>
      <div class="audio-wrapper">
        <audio id="audio-element" src="${e}" controls autoplay></audio>
      </div>
    </div>
  `,n.style.display=`block`;let r=document.getElementById(`audio-element`);if(r){let t=y(e);t>0&&(r.currentTime=t),r.addEventListener(`timeupdate`,()=>{r.currentTime>0&&v(e,r.currentTime)});let n=r.play();n&&typeof n.catch==`function`&&n.catch(e=>{console.log(`Autoplay blocked or playback error:`,e)})}}async function S(e){let t=document.querySelector(`#app`);if(t){t.innerHTML=`<div class="loading">Loading podcast details...</div>`;try{let n=await a(e);if(!n||!n.episodes){t.innerHTML=`
        <div class="error-container">
          <p>Failed to load podcast details. Please try again later.</p>
          <button id="back-to-home-error" class="spotify-btn">← Back to Home</button>
        </div>
      `,document.getElementById(`back-to-home-error`)?.addEventListener(`click`,()=>{window.history.pushState({},``,`/podcast/`),window.dispatchEvent(new Event(`popstate`))});return}t.innerHTML=`
      <div class="details-container">
        <button id="back-to-home-btn" class="back-btn-spotify">← Back to Home</button>
        
        <div class="podcast-header">
          <img src="${n.image}" alt="${n.title}" class="podcast-header-img" />
          <div class="podcast-header-info">
            <span class="podcast-badge">PODCAST</span>
            <h2>${n.title}</h2>
            <p class="podcast-author">By ${n.publisher}</p>
            <p class="podcast-desc">${n.description||`No description available.`}</p>
          </div>
        </div>

        <h3 class="section-title">All Episodes (${n.total_episodes||n.episodes.length})</h3>
        
        <div class="episodes-list">
          ${n.episodes.map(e=>{let t=_(e.id);return`
              <div class="episode-row">
                <div class="episode-main-info">
                  <h4>${e.title}</h4>
                  <p class="episode-date">Published: ${new Date(e.pub_date_ms).toLocaleDateString()}</p>
                </div>
                <div class="episode-actions">
                  <button class="play-episode-btn spotify-play-badge" data-audio="${e.audio}" data-title="${e.title}">▶ Play</button>
                  <button class="toggle-playlist-btn ${t?`in-playlist`:``}" 
                          data-id="${e.id}" 
                          data-audio="${e.audio}" 
                          data-title="${e.title}" 
                          data-podcast="${n.title}">
                    ${t?`💖 Saved`:`🤍 Save`}
                  </button>
                </div>
              </div>
            `}).join(``)}
        </div>
      </div>
    `,C(),w(t)}catch(e){console.error(`Error rendering podcast details:`,e),t.innerHTML=`<div class="error-text">Failed to load data. Please try again later.</div>`}}}function C(){document.getElementById(`back-to-home-btn`)?.addEventListener(`click`,()=>{window.history.pushState({},``,`/podcast/`),window.dispatchEvent(new Event(`popstate`))})}function w(e){e.querySelectorAll(`.play-episode-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-audio`),n=e.getAttribute(`data-title`);t&&n&&x(t,n)})}),e.querySelectorAll(`.toggle-playlist-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-id`),n=e.getAttribute(`data-audio`),r=e.getAttribute(`data-title`),i=e.getAttribute(`data-podcast`);_(t)?(g(t),e.textContent=`🤍 Save`,e.classList.remove(`in-playlist`)):(h({id:t,title:r,audio:n,podcastTitle:i}),e.textContent=`💖 Saved`,e.classList.add(`in-playlist`))})})}function T(){let e=document.querySelector(`#app`);if(!e)return;let t=m();if(t.length===0){e.innerHTML=`
      <div class="playlist-container">
        <h2 class="page-title">My Playlist</h2>
        <div class="empty-playlist">
          Your playlist is empty. Go back to Discover and add some amazing episodes!
        </div>
      </div>
    `;return}e.innerHTML=`
    <div class="playlist-container">
      <h2 class="page-title">My Playlist (${t.length})</h2>
      
      <div class="episodes-list">
        ${t.map(e=>`
          <div class="episode-row" id="item-${e.id}">
            <div class="episode-main-info">
              <h4>${e.title}</h4>
              <p class="podcast-author-link">From: ${e.podcastTitle}</p>
            </div>
            <div class="episode-actions">
              <button class="play-playlist-btn spotify-play-badge" data-audio="${e.audio}" data-title="${e.title}">▶ Play</button>
              <button class="remove-playlist-btn" data-id="${e.id}">❌ Remove</button>
            </div>
          </div>
        `).join(``)}
      </div>
    </div>
  `,E(e)}function E(e){e.querySelectorAll(`.play-playlist-btn`).forEach(e=>{e.addEventListener(`click`,()=>{x(e.getAttribute(`data-audio`),e.getAttribute(`data-title`))})}),e.querySelectorAll(`.remove-playlist-btn`).forEach(t=>{t.addEventListener(`click`,()=>{let n=t.getAttribute(`data-id`);g(n);let r=document.getElementById(`item-${n}`);r&&r.remove();let i=m();if(i.length===0)T();else{let t=e.querySelector(`.page-title`);t&&(t.textContent=`My Playlist (${i.length})`)}})})}function D(e){let t=e.replace(/^\/+|\/+$/g,``);if(console.log(`Router checking route:`,t),t.startsWith(`podcast/`)){let e=t.split(`/`)[1];if(e){S(e);return}}switch(t){case`playlist`:T();break;default:d();break}}function O(e){let t=e.startsWith(`/`)?e:`/${e}`;window.history.pushState({},``,t===`/home`?`/`:t),D(e)}window.addEventListener(`popstate`,()=>{let e=window.location.pathname;D(e)}),document.addEventListener(`DOMContentLoaded`,()=>{document.getElementById(`nav-home`)?.addEventListener(`click`,()=>O(`home`)),document.getElementById(`nav-playlist`)?.addEventListener(`click`,()=>O(`playlist`)),O(window.location.pathname.substring(1)||`home`)});