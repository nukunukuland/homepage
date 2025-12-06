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
  <iframe src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Asia%2FTokyo&showPrint=0&showTitle=0&showTz=0&showCalendars=0&src=YTNmMWY1OWU4ZTQ5ODhiNDQyNTUyYmNkMTI2MmY5OThmOGQ2ZDU0YjMxMzc4ZGQ5ODUzMTIxN2RjNmQyYjY2N0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%23ef6c00" 
  frameborder="0" scrolling="no"></iframe>
</div>
`;

// calendar-container に追加
calendarContainer.appendChild(nav);
