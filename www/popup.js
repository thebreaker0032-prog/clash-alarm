const GITHUB_USER = "thebreaker0032-prog";
const REPO_NAME = "thebreaker";
const FILE_PATH = "time-tracker-data.json";

// Thêm báo thức thủ công
document.getElementById("set").addEventListener("click", () => {

    const mins = parseInt(document.getElementById("minutes").value);

    if (isNaN(mins) || mins <= 0) {
        alert("Nhập số phút hợp lệ!");
        return;
    }

    const hall = "Manual";

    const when = Date.now() + mins * 60 * 1000;

    const id = `${hall}_${when}`;

    addAlarm(id, when, hall);
});

// Load từ GitHub
document.getElementById("load").addEventListener("click", async () => {
    const token = await getOrAskToken();
    if (!token) return alert("❌ Chưa nhập token!");

    try {
        const url = `https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/contents/${FILE_PATH}`;
        const res = await fetch(url, {
            headers: { Authorization: `token ${token}` }
        });

        if (!res.ok) throw new Error(`Lỗi tải: ${res.status}`);

        const data = await res.json();
        const jsonText = atob(data.content.replace(/\n/g, ""));
        const list = JSON.parse(jsonText);

        // 🧹 XOÁ TOÀN BỘ alarm cũ
        await chrome.alarms.clearAll();

        // 🧹 XOÁ storage cũ
        await chrome.storage.local.set({ alarms: [] });

        const now = Date.now();

        const newAlarms = list
            .filter(entry => entry.timestamp > now)
            .map(entry => ({
                id: `${entry.hall}_${entry.timestamp}`,
                hall: entry.hall,
                time: entry.timestamp
            }));

        // tạo alarms
        for (const alarm of newAlarms) {
            chrome.alarms.create(alarm.id, {
                when: alarm.time
            });
        }

        // lưu storage
        await chrome.storage.local.set({
            alarms: newAlarms
        });

        alert(`✅ Đã tải ${newAlarms.length} báo thức!`);

        render();

    } catch (err) {
        console.error(err);
        alert("❌ " + err.message);
    }
});
// Reset token
document.getElementById("resetTokenBtn")?.addEventListener("click", () => {

    chrome.storage.local.remove("GITHUB_TOKEN", () => {

        alert("🔄 Đã xoá token GitHub");
    });
});

// Token
async function getOrAskToken() {

    return new Promise(resolve => {

        chrome.storage.local.get(["GITHUB_TOKEN"], (data) => {

            if (data.GITHUB_TOKEN) {
                resolve(data.GITHUB_TOKEN);
                return;
            }

            const token = prompt("🔑 Nhập GitHub Token:");

            if (token) {

                chrome.storage.local.set({
                    GITHUB_TOKEN: token
                });

                resolve(token);

            } else {

                resolve(null);
            }
        });
    });
}

// Add alarm
function addAlarm(id, when, hall = "Không rõ") {

    chrome.alarms.create(id, { when });

    chrome.storage.local.get({ alarms: [] }, (data) => {

        data.alarms.push({
            id,
            time: when,
            hall
        });

        chrome.storage.local.set({
            alarms: data.alarms
        });

        render();
    });
}

// Render list
function render() {

    chrome.storage.local.get({ alarms: [] }, (data) => {

        const div = document.getElementById("list");

        div.innerHTML = "";

        data.alarms.forEach(a => {

            const t =
                new Date(a.time).toLocaleTimeString();

            div.innerHTML += `
                <div>
                    🔔 Hall ${a.hall} - ${t}
                </div>
            `;
        });
    });
}

render();