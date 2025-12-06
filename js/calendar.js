// js/calendar.js

const API_KEY = "AIzaSyDOhHFpAJUOzTAqNwczRLrSaK3KM3ONAc8";
const CALENDAR_ID = "YTNmMWY1OWU4ZTQ5ODhiNDQyNTUyYmNkMTI2MmY5OThmOGQ2ZDU0YjMxMzc4ZGQ5ODUzMTIxN2RjNmQyYjY2N0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t"; 

// FullCalendarの初期化関数
function initFullCalendar() {
    const calendarEl = document.getElementById('calendar-container');

    // FullCalendarのインスタンスを作成
    const calendar = new FullCalendar.Calendar(calendarEl, {
        // 日本語化
        locale: 'ja',
        // 使用するプラグイン
        plugins: ['googleCalendar'],
        // 初期表示ビュー
        initialView: 'dayGridMonth',
        // カレンダーのヘッダー設定
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek'
        },
        // Googleカレンダーのイベントソース設定
        googleCalendarApiKey: API_KEY,
        eventSources: [
            {
                googleCalendarId: CALENDAR_ID,
                // FullCalendarで表示されるイベントの色 (既存iframeのcolor=ef6c00を反映)
                backgroundColor: '#ef6c00',
                borderColor: '#ef6c00',
                textColor: '#ffffff'
            }
        ]
        // その他のカスタム設定をここに追加できます
    });

    // カレンダーを描画
    calendar.render();
}

// FullCalendarを初期化
initFullCalendar();
