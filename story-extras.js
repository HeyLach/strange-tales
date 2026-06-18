(function () {
  'use strict';

  /* ── 閱讀進度條 ── */
  var bar = document.createElement('div');
  bar.id = 'reading-progress';
  document.body.appendChild(bar);

  function updateBar() {
    var doc = document.documentElement;
    var total = doc.scrollHeight - doc.clientHeight;
    var pct = total > 0 ? (doc.scrollTop || document.body.scrollTop) / total * 100 : 0;
    bar.style.width = Math.min(pct, 100) + '%';
  }
  window.addEventListener('scroll', updateBar, { passive: true });
  updateBar();

  /* ── 閱讀時間估算 ── */
  var storyBody = document.querySelector('.story-body');
  var pageTitle = document.querySelector('.story-page-title');
  if (storyBody && pageTitle) {
    var chars = storyBody.textContent.replace(/\s/g, '').length;
    var mins = Math.max(1, Math.ceil(chars / 350));
    var timeBadge = document.createElement('p');
    timeBadge.className = 'reading-time-badge';
    timeBadge.textContent = '約需 ' + mins + ' 分鐘閱讀';
    pageTitle.insertAdjacentElement('afterend', timeBadge);
  }

  /* ── 回到頂端 ── */
  var topBtn = document.createElement('button');
  topBtn.id = 'back-to-top';
  topBtn.title = '回到頂端';
  topBtn.innerHTML = '↑';
  document.body.appendChild(topBtn);

  window.addEventListener('scroll', function () {
    topBtn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  topBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── 繼續探索（隨機相關故事） ── */
  var storyContainer = document.querySelector('.story-container');
  if (!storyContainer) return;

  fetch('../index.html')
    .then(function (r) { return r.text(); })
    .then(function (html) {
      var parser = new DOMParser();
      var idoc = parser.parseFromString(html, 'text/html');
      var allCards = Array.from(idoc.querySelectorAll('#storiesGrid .story-card'));
      var currentFile = window.location.pathname.split('/').pop();

      var others = allCards.filter(function (c) {
        return !(c.getAttribute('href') || '').includes(currentFile);
      });
      if (others.length < 3) return;

      for (var i = others.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = others[i]; others[i] = others[j]; others[j] = t;
      }
      var picks = others.slice(0, 3);

      var section = document.createElement('div');
      section.className = 'story-suggest';

      var heading = document.createElement('h3');
      heading.className = 'story-suggest-title';
      heading.innerHTML = '✦ &nbsp; 繼續探索';
      section.appendChild(heading);

      var grid = document.createElement('div');
      grid.className = 'story-suggest-grid';
      section.appendChild(grid);

      picks.forEach(function (card) {
        var href = (card.getAttribute('href') || '').replace(/^stories\//, '');
        var symbol = ((card.querySelector('.card-symbol') || {}).textContent || '✦').trim();
        var title = ((card.querySelector('.card-title') || {}).textContent || '').trim();
        var badge = ((card.querySelector('.card-badge') || {}).textContent || '').trim();
        var gradientEl = card.querySelector('.card-visual-inner');
        var bg = gradientEl ? (gradientEl.getAttribute('style') || '').replace('background:', '').trim() : '';

        var link = document.createElement('a');
        link.href = href;
        link.className = 'story-suggest-card';
        link.innerHTML =
          '<div class="suggest-visual" style="background:' + bg + '">' +
          '<span class="suggest-symbol">' + symbol + '</span></div>' +
          '<div class="suggest-body">' +
          '<span class="suggest-badge">' + badge + '</span>' +
          '<span class="suggest-title">' + title + '</span>' +
          '</div>';
        grid.appendChild(link);
      });

      var relatedEl = storyContainer.querySelector('.related-section');
      if (relatedEl) {
        storyContainer.insertBefore(section, relatedEl);
      } else {
        storyContainer.appendChild(section);
      }
    })
    .catch(function () {});
}());
