//js/topics.js

document.addEventListener("DOMContentLoaded", () => {
  // --- カテゴリ名を一箇所で管理するマップ（ここを編集してカテゴリ名を増やす） ---
  const catLabels = {
    cat01: "イベント",
    cat02: "お知らせ",
    cat03: "重要",
    cat04: "その他"
    // 必要ならここに cat05: "内容" という形で追加してください
  };

  const topicsData = [
    { date: "2025.07.30", catClass: "cat04", title: "ホームページを公開しました。", link: "#" },
    { date: "2025.08.02", catClass: "cat01", title: "つながりあそび・うた​研究所35周年記念コンサートのお知らせ", link: "#" },
    { date: "2025.08.04", catClass: "cat01", title: "カレンダー更新しました【不定期更新】", link: "#" }
  ];

  const topicsList = document.querySelector(".topics-list");
  if (!topicsList) return;

  // 日付降順ソート（元ロジックをそのまま保持）
  topicsData.sort((a, b) =>
    new Date(String(b.date).replace(/\./g, '-')) - new Date(String(a.date).replace(/\./g, '-'))
  );

  // 現在のページが /homepage/topics/ 系か判定し、カテゴリ指定があれば抽出する
  const path = location.pathname;
  const isTopicsPage = path.includes("/homepage/topics");

  // --- ここを拡張：クエリ / ハッシュ / パス の順でカテゴリを拾う ---
  const urlParams = new URLSearchParams(location.search);
  const catFromQuery = urlParams.get('cat');             // /homepage/topics/?cat=cat01
  const hashMatch = location.hash.match(/#(cat\d+)/);    // /homepage/topics/#cat01
  const pathMatch = path.match(/\/homepage\/topics\/(cat\d+)(?:\/|$)/); // /homepage/topics/cat01
  const currentCategory = catFromQuery || (hashMatch ? hashMatch[1] : (pathMatch ? pathMatch[1] : null));

  // /homepage/topics/ 系ページの場合
  if (isTopicsPage) {
    // URL にカテゴリ指定がある場合はそのカテゴリのみ表示（URL直接入力対応）
    if (currentCategory) {
      const filtered = topicsData.filter(item => item.catClass === currentCategory);
      topicsList.innerHTML = filtered.map(item => {
        const label = catLabels[item.catClass] || item.cat || "";
        return `
          <li>
            <span class="date">${item.date}</span>
            <a href="/homepage/topics/${item.catClass}" class="cat ${item.catClass}">${label}</a>
            <a href="${item.link}" class="explain">${item.title}</a>
          </li>
        `;
      }).join("") || `<li class="no-item">該当するトピックはありません。</li>`;
      return; // カテゴリ指定表示はここで完了
    }

    // カテゴリ指定がない（トップの /homepage/topics/）は従来どおりページネーション表示
    const itemsPerPage = 5;
    let currentPage = 1;
    const totalPages = Math.ceil(topicsData.length / itemsPerPage);
    const paginationEl = document.querySelector(".pagination");

    function renderPage(page) {
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const displayData = topicsData.slice(start, end);
      topicsList.innerHTML = displayData.map(item => {
        const label = catLabels[item.catClass] || item.cat || "";
        return `
          <li>
            <span class="date">${item.date}</span>
            <a href="/homepage/topics/${item.catClass}" class="cat ${item.catClass}">${label}</a>
            <a href="${item.link}" class="explain">${item.title}</a>
          </li>
        `;
      }).join("");

      // ページネーション生成（.pagination 要素がなければ無視）
      if (paginationEl) {
        paginationEl.innerHTML = Array.from({ length: totalPages }, (_, i) => `
          <button class="page-btn ${i + 1 === page ? 'active' : ''}" data-page="${i + 1}">
            ${i + 1}
          </button>
        `).join("");
      }
    }

    // 初期表示
    renderPage(currentPage);

    // ページクリックイベント（.pagination がある場合のみバインド）
    if (paginationEl) {
      paginationEl.addEventListener("click", e => {
        if (e.target.classList.contains("page-btn")) {
          currentPage = Number(e.target.dataset.page);
          renderPage(currentPage);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    }

  } else {
    // topics ページ以外は上から 5 件だけ表示（元ロジックを維持）
    topicsList.innerHTML = topicsData.slice(0, 5).map(item => {
      const label = catLabels[item.catClass] || item.cat || "";
      return `
        <li>
          <span class="date">${item.date}</span>
          <a href="/homepage/topics/${item.catClass}" class="cat ${item.catClass}">${label}</a>
          <a href="${item.link}" class="explain">${item.title}</a>
        </li>
      `;
    }).join("");
  }

});


