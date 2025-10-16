// js/calendar.js

// calendar-container に Google カレンダー iframe を埋め込む
const calendarContainer = document.getElementById("calendar-container");

// 既存内容をクリア
calendarContainer.innerHTML = "";

// カレンダー用ラッパー
const nav = document.createElement("div");
nav.className = "calendar-nav";

// Google カレンダー iframe を挿入
nav.innerHTML = `
<div class="calendar-iframe-wrapper">
  <iframe src="https://calendar.google.com/calendar/embed?height=600&amp;wkst=1&amp;ctz=Asia%2FTokyo&amp;showPrint=0&amp;showTitle=0&amp;color=%23ef6c00" 
  frameborder="0" scrolling="no"></iframe>
</div>
`;

// calendar-container に追加
calendarContainer.appendChild(nav);

