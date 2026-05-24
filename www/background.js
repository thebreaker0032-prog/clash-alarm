chrome.alarms.onAlarm.addListener(async (alarm) => {
    try {

        chrome.storage.local.get({ alarms: [] }, async (data) => {

            console.log("Alarm fired:", alarm);
            console.log("Stored alarms:", data.alarms);

            const found = data.alarms.find(a => a.id === alarm.name);

            const hallName = found?.hall || "Không rõ hall";

            // Notification
            chrome.notifications.create({
                type: "basic",
                iconUrl: "icon.png",
                title: "⏰ Báo thức!",
                message: `🔔 Hall ${hallName} đang tới giờ!`,
                priority: 2
            });

            // Mở tab phát âm thanh
            const alarmTab = await chrome.tabs.create({
                url: chrome.runtime.getURL(
                    `sound.html?hall=${encodeURIComponent(hallName)}`
                ),
                active: false
            });

            // Đóng tab sau 10 giây
            setTimeout(() => {
                if (alarmTab?.id) {
                    chrome.tabs.remove(alarmTab.id);
                }
            }, 10000);

            // Xóa alarm khỏi storage
            const updated = data.alarms.filter(a => a.id !== alarm.name);

            chrome.storage.local.set({
                alarms: updated
            });

        });

    } catch (err) {
        console.error("Lỗi khi xử lý báo thức:", err);
    }
});