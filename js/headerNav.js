//js/headerNav.js

function renderHeaderNav() {
  const header = document.querySelector("header");
  const isMobile = window.innerWidth <= 1024;

  // 共通：ロゴ画像はそのまま使用
  let navHTML = '';

  if (isMobile) {
    navHTML = `
      <div class="header-wrapper">
       <div class="site-name">
        <a href="/homepage/index.html">
        <img src="/homepage/image/nukunuku.svg" alt="サイト名" class="header-img">
　　　　</a>
       </div>
        <button class="hamburger" aria-label="メニューを開く">
          <img src="/homepage/image/menu-icon.svg" alt="メニュー" />
        </button>
      </div>
    `;
    header.innerHTML = navHTML;

    const navMenu = document.createElement('nav');
    navMenu.classList.add('header-nav');
    navMenu.style.display = 'none';
    navMenu.innerHTML = `
          <ul>
           <li><a href="/homepage/index.html">ホーム</a></li>
           <li class="has-submenu">
             <a>親子子育て広場とは</a>
             <ul class="submenu">
               <li><a href="/homepage/profile">ぬくぬくについて</a></li>
               <li><a href="/homepage/contact">お問い合わせ</a></li>
             </ul>
           </li>
           <li class="has-submenu">
             <a>活動について</a>
             <ul class="submenu">
               <li><a href="/homepage/massage">ベビーマッサージ</a></li>
               <li><a href="/homepage/profile">プロフィール</a></li>
             </ul>
           </li>
           <li><a href="#">イベントカレンダー</a></li>
          </ul>
    `;
    header.appendChild(navMenu);

    document.querySelector('.hamburger').addEventListener('click', () => {
      const isOpen = navMenu.style.display === 'block';

      navMenu.style.display = isOpen ? 'none' : 'block';
      document.body.style.overflow = isOpen ? '' : 'hidden'; 
    });


  } else {
    navHTML = `
      <div class="header-wrapper">
       <div class="site-name">
        <a href="/homepage/index.html">
        <img src="/homepage/image/nukunuku.svg" alt="サイト名" class="header-img">
        </a>
       </div>
        <nav class="header-nav">
          <ul>
           <li class="main-menu"><a href="/homepage/index.html">ホーム</a></li>
           <li class="has-submenu">
             <a href="/homepage/massage">親子子育て広場とは</a>
             <ul class="submenu">
               <li><a href="/homepage/profile">ぬくぬくについて</a></li>
               <li><a href="/homepage/contact">お問い合わせ</a></li>
             </ul>
           </li>
           <li class="has-submenu">
             <a href="#">活動について</a>
             <ul class="submenu">
               <li><a href="/homepage/massage">ベビーマッサージ</a></li>
               <li><a href="/homepage/profile">プロフィール</a></li>
             </ul>
           </li>
           <li class="main-menu"><a href="#">イベントカレンダー</a></li>
          </ul>
        </nav>
      </div>
    `;
    header.innerHTML = navHTML;


  }
document.querySelectorAll('.has-submenu > a').forEach(parentLink => {
  parentLink.addEventListener('click', (e) => {

    const isMobile = window.innerWidth <= 1024; //画面幅チェック
    if (!isMobile) return; // PC画面なら処理せず return

    const parentLi = parentLink.parentElement;
    const isActive = parentLi.classList.contains('active');

    // すべてのsubmenu閉じる
    document.querySelectorAll('.has-submenu').forEach(li => {
      li.classList.remove('active');
      /* li.querySelector('.submenu').style.display = 'none'; */
    });

    // スライドを戻す（位置補正を戻す）
    document.querySelectorAll('.header-nav li').forEach((li, idx) => {
      li.style.transform = ''; 
    });

    if (!isActive) {
      parentLi.classList.add('active');
      const submenu = parentLi.querySelector('.submenu');
      submenu.style.display = 'block'; // 明示的に表示（hover依存しない）

    if (window.innerWidth <= 1024) {
      // submenuがはみ出す分を押し下げる処理
      const submenuHeight = submenu.offsetHeight;
      let push = false;

      document.querySelectorAll('.header-nav li').forEach((li) => {
        if (push) {
          // submenu内のliは対象外
          if (!submenu.contains(li)) {
            li.style.transform = `translateY(${submenuHeight}px)`;
          }
        }
        if (li === parentLi) push = true;
      });
    }
   }

    e.preventDefault();

  });
});

}

document.addEventListener("DOMContentLoaded", () => {
  renderHeaderNav();

  // リサイズで再描画
  window.addEventListener("resize", () => {
    // 幅の変化があるときだけ再描画
    if ((window.innerWidth <= 1024 && !document.querySelector('.hamburger')) ||
        (window.innerWidth > 1024 && document.querySelector('.hamburger'))) {
      renderHeaderNav();
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const calendarLinks = Array.from(document.querySelectorAll('a'))
    .filter(a => a.textContent.trim() === 'イベントカレンダー');

  calendarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const isIndexPage = location.pathname.includes('index.html') || location.pathname === '/' || location.pathname === '';

      if (isIndexPage) {
        e.preventDefault(); // ページ内スクロールのみ
        const calendarSection = document.getElementById('calendar');
        if (calendarSection) {
          calendarSection.scrollIntoView({ behavior: 'smooth' });

          // モバイル表示の場合、navメニューを閉じる
          if (window.innerWidth <= 1024) {
            const navMenu = document.querySelector('.header-nav');
            if (navMenu) {
              navMenu.style.display = 'none';
              document.body.style.overflow = '';
            }
          }
        }
      } else {
        // index.html に calendar フラグをつけて遷移
        link.setAttribute('href', 'index.html#calendar');
      }
    });
  });

  // index.htmlに戻ったとき #calendar があればスクロール
  if (location.hash === '#calendar') {
    const calendarSection = document.getElementById('calendar');
    if (calendarSection) {
      setTimeout(() => {
        calendarSection.scrollIntoView({ behavior: 'smooth' });
      }, 400); // 画面描画待ち
    }
  }
});





