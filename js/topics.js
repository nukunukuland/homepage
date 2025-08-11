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
    { date: "2025.08.04", catClass: "cat04", title: "カレンダー更新しました【不定期更新】", link: "#" }

  ];

  const topicsList = document.querySelector(".topics-list");
  if (!topicsList) return;

  topicsData.sort((a, b) =>
    new Date(String(b.date).replace(/\./g, '-')) - new Date(String(a.date).replace(/\./g, '-'))
  );
  
    // 現在のページが /homepage/topic か判定
    const isTopicPage = location.pathname.includes("/homepage/topic/");

    // トピックページ/homepage/topic 以外は上から5件だけ表示
    if (isTopicPage) {
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

        // ページネーション生成
        paginationEl.innerHTML = Array.from({ length: totalPages }, (_, i) => `
          <button class="page-btn ${i + 1 === page ? 'active' : ''}" data-page="${i + 1}">
            ${i + 1}
          </button>
        `).join("");
      }

      // 初期表示
      renderPage(currentPage);

  // ページクリックイベント
  paginationEl.addEventListener("click", e => {
    if (e.target.classList.contains("page-btn")) {
      currentPage = Number(e.target.dataset.page);
      renderPage(currentPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

} else {
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







