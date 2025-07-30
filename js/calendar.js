//js/calendar.js（イベント日を表示）

//日付(date)・イベント(title)の設定
const events = [
  { date: "2025-09-24", time: "19:00〜21:00", title: "まま〜ず" },
  { date: "2025-09-14", time: "13:00〜15:00", title: "唄うたいの会" },
  { date: "2025-08-21", time: "10:30〜11:30", title: "夏祭りごっこ" }
];

const calendarContainer = document.getElementById("calendar-container");

// 年月設定
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth(); // 0始まり

function renderCalendar(year, month) {
  const calendarContainer = document.getElementById("calendar-container");
  calendarContainer.innerHTML = "";

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const table = document.createElement("table");
  table.classList.add("calendar-table");

  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th class="sun">日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th class="sat">土</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  let row = document.createElement("tr");

  for (let i = 0; i < firstDay; i++) {
    row.appendChild(document.createElement("td"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const cell = document.createElement("td");
    const dayEvents = events.filter(e => e.date === dateStr);

    const dateObj = new Date(year, month, day);
    const dayOfWeek = dateObj.getDay();
    const dateClass = dayOfWeek === 0 ? "sun" : dayOfWeek === 6 ? "sat" : "";
    cell.innerHTML = `<div class="date ${dateClass}">${day}</div>`;

    if (dayEvents.length > 0) {
      const firstEvent = dayEvents[0];
      const eventDiv = document.createElement("div");
      eventDiv.classList.add("event");
      eventDiv.textContent = firstEvent.title;
      cell.appendChild(eventDiv);

      cell.style.cursor = "pointer";
      cell.onclick = () => showPopup(dayEvents); // 複数イベント渡す
    }


    // 「今日」の日付を強調
    const today = new Date();
    if (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    ) {
      cell.classList.add("today");
    }

    row.appendChild(cell);
    if ((firstDay + day) % 7 === 0) {
      tbody.appendChild(row);
      row = document.createElement("tr");
    }
  }
  if (row.children.length > 0) {
    tbody.appendChild(row);
  }

  table.appendChild(tbody);

  // ナビゲーションボタン追加
  const nav = document.createElement("div");
  nav.className = "calendar-nav";
  nav.innerHTML = `
    <button id="prevMonth">前月</button>
    <span>${year}年${month + 1}月</span>
    <button id="nextMonth">次月</button>
    <button id="goToday">今月へ</button>
  `;

  calendarContainer.appendChild(nav);
  calendarContainer.appendChild(table);

  // イベントリスナー
  document.getElementById("prevMonth").onclick = () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar(currentYear, currentMonth);
  };
  document.getElementById("nextMonth").onclick = () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar(currentYear, currentMonth);
  };
  document.getElementById("goToday").onclick = () => {
    currentYear = new Date().getFullYear();
    currentMonth = new Date().getMonth();
    renderCalendar(currentYear, currentMonth);
  };
}

// 初回表示
renderCalendar(currentYear, currentMonth);

function showPopup(eventsOfDay) {
  const existingPopup = document.querySelector(".calendar-popup");
  if (existingPopup) existingPopup.remove();

  const popup = document.createElement("div");
  popup.className = "calendar-popup";

  const dateTitle = `<h2 class="calendar-popupDate">${formatJapaneseDate(eventsOfDay[0].date)}</h2>`;
  const closeButton = `<button class="popup-close" aria-label="閉じる">×</button>`;

  let eventHtml = eventsOfDay.map(ev => `
   <div class="calendar-popupWrapper">
    <h3 class="calendar-popupTittle">${ev.title}</h3>
    <p id="calendar-popupTime">${ev.time}</p>
   </div>
  `).join("");

  popup.innerHTML = closeButton + dateTitle + eventHtml;

// ラッパー要素を追加してモーダル外を検知
const overlay = document.createElement("div");
overlay.style.position = "fixed";
overlay.style.top = 0;
overlay.style.left = 0;
overlay.style.width = "100vw";
overlay.style.height = "100vh";
overlay.style.zIndex = 999;
overlay.appendChild(popup);

document.body.appendChild(overlay);

// 閉じるボタン
popup.querySelector(".popup-close").onclick = () => overlay.remove();

// モーダル外をクリックで閉じる
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) overlay.remove();
});

}


// 2025-07-30 → 2025年7月30日 に変換する関数
function formatJapaneseDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const dateObj = new Date(dateStr);
  const weekday = ['日', '月', '火', '水', '木', '金', '土'][dateObj.getDay()];
  return `${year}年${parseInt(month)}月${parseInt(day)}日(${weekday})`;
}


