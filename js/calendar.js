// js/calendar.js

// FullCalendarを使ってGoogleカレンダーを表示
document.addEventListener('DOMContentLoaded', function() {
    
    // カレンダーを表示する要素を取得（既存のIDを再利用）
    const calendarContainer = document.getElementById('calendar-container');

    // FullCalendarのインスタンスを作成
    const calendar = new FullCalendar.Calendar(calendarContainer, {
        
        // 初期表示を月ビューに設定
        initialView: 'dayGridMonth',
        
        // 日本語に設定 (オプション)
        locale: 'ja',
        
        // Google Calendar連携の設定
        googleCalendarApiKey: 'AIzaSyDOhHFpAJUOzTAqNwczRLrSaK3KM3ONAc8',
        
        events: {
            googleCalendarId: 'YTNmMWY1OWU4ZTQ5ODhiNDQyNTUyYmNkMTI2MmY5OThmOGQ2ZDU0YjMxMzc4ZGQ5ODUzMTIxN2RjNmQyYjY2N0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t',
        },

        // その他のオプション (例: ヘッダーツールバーの表示設定)
        headerToolbar: {
             left: 'prev,next today',
             center: 'title',
             right: 'dayGridMonth,dayGridWeek'
        }
        
    });

    // カレンダーを表示
    calendar.render();
    
});
