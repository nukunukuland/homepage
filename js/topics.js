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
    { date: "2025.07.30", catClass: "cat04", catLink: "/homepage/topics/cat04", title: "ホームページを公開しました。", link: "#" },
    { date: "2025.08.02", catClass: "cat01", catLink: "/homepage/topics/cat02", title: "つながりあそび・うた​研究所35周年記念コンサートのお知らせ", link: "#" },
    { date: "2025.08.04", catClass: "cat04", catLink: "/homepage/topics/cat03", title: "カレンダー更新しました【不定期更新】", link: "#" }

  ];

  const topicsList = document.querySelector(".topics-list");
  if (!topicsList) return;

  topicsData.sort((a, b) =>
    new Date(String(b.date).replace(/\./g, '-')) - new Date(String(a.date).replace(/\./g, '-'))
  );

    // 現在のページが /homepage/topic か判定
    const isTopicPage = location.pathname.includes("/homepage/topic");

    // topic.html 以外は上から5件だけ表示
    const displayData = isTopicPage ? topicsData : topicsData.slice(0, 5);

    topicsList.innerHTML = displayData.map(item => {

    // マップに無ければ item.cat（互換性のため）を使う。両方無ければ空文字。
    const label = catLabels[item.catClass] || item.cat || "";

    return `
      <li>
        <span class="date">${item.date}</span>
        <a href="${item.catLink}" class="cat ${item.catClass}">${label}</a>
        <a href="${item.link}" class="explain">${item.title}</a>
      </li>
    `;
  }).join("");
});




