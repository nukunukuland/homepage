// js/topics.js

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
    { date: "2025.08.04", catClass: "cat03", title: "カレンダー更新しました【不定期更新】", link: "#" },
    { date: "2025.08.05", catClass: "cat01", title: "カレンダー更新しました【不定期更新】", link: "#" },
    { date: "2025.08.06", catClass: "cat02", title: "カレンダー更新しました【不定期更新】", link: "#" },
    { date: "2025.08.07", catClass: "cat01", title: "カレンダー更新しました【不定期更新】", link: "#" },
    { date: "2025.08.08", catClass: "cat03", title: "カレンダー更新しました【不定期更新】", link: "#" },
    { date: "2025.08.09", catClass: "cat04", title: "カレンダー更新しました【不定期更新】", link: "#" }
  ];

  const topicsList = document.querySelector(".topics-list");
  if (!topicsList) return;

  // 日付で降順ソート（元ロジック維持）
  topicsData.sort((a, b) =>
    new Date(String(b.date).replace(/\./g, '-')) - new Date(String(a.date).replace(/\./g, '-'))
  );

  // トピックスページか（/topics セグメントがあればOK）
  // また URL からカテゴリ（cat01 等）を抽出する（直接入力に対応）
  const isTopicsPage = /\/topics(\/|$)/.test(location.pathname);
  const catMatch = location.pathname.match(/\/topics\/(cat\d+)(?:\/|$)/);
  const selectedCat = catMatch ? catMatch[1] : null;

  // GitHub Pages 等でベースパスが変わっていても安全にカテゴリリンクを作れるようにする
  const hasHomepage = location.pathname.includes('/homepage');
  const basePrefix = hasHomepage ? location.pathname.split('/homepage')[0] + '/homepage' : '/homepage';
  const topicsBase = `${basePrefix}/topics`;

  if (isTopicsPage) {
    const itemsPerPage = 5;
    let currentPage = 1;

    // selectedCat があればそのカテゴリだけで絞る
    const dataToUse = selectedCat ? topicsData.filter(item => item.catClass === selectedCat) : topicsData;

    // カテゴリ指定してもヒットしない場合は該当なしを表示して終了
    if (selectedCat && dataToUse.length === 0) {
      topicsList.innerHTML = `<li class="no-data">該当するお知らせはありません。</li>`;
      return;
    }

    const totalPages = Math.ceil(dataToUse.length / itemsPerPage);
    const paginationEl = document.querySelector(".pagination"); // HTML にない場合もあるのでガードする

    function renderPage(page) {
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const displayData = dataToUse.slice(start, end);
      topicsList.innerHTML = displayData.map(item => {
        const label = catLabels[item.catClass] || item.cat || "";
        return `
          <li>
            <span class="date">${item.date}</span>
            <a href="${topicsBase}/${item.catClass}" class="cat ${item.catClass}">${label}</a>
            <a href="${item.link}" class="explain">${item.title}</a>
          </li>
        `;
      }).join("");

      // ページネーション生成（.paginationあれば）
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

    // ページクリックイベント（.pagination がある場合のみ）
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
    // トップページ等では上から5件だけ表示（元の挙動を維持）
    topicsList.innerHTML = topicsData.slice(0, 5).map(item => {
      const label = catLabels[item.catClass] || item.cat || "";
      // ここでも topicsBase を使うことでリンクが確実になる（オプション）
      return `
        <li>
          <span class="date">${item.date}</span>
          <a href="${topicsBase}/${item.catClass}" class="cat ${item.catClass}">${label}</a>
          <a href="${item.link}" class="explain">${item.title}</a>
        </li>
      `;
    }).join("");
  }

});
