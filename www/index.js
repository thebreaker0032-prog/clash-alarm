import { LocalNotifications } from '@capacitor/local-notifications';
document.addEventListener("DOMContentLoaded", async () => {

    await LocalNotifications.requestPermissions();

});
const GITHUB_USER = "thebreaker0032-prog";
const REPO_NAME = "thebreaker";
const FILE_PATH = "time-tracker-data.json";

let alarms =
    JSON.parse(localStorage.getItem("alarms") || "[]");

// ===== SAVE =====
function saveAlarms() {

    localStorage.setItem(
        "alarms",
        JSON.stringify(alarms)
    );
}

// ===== RENDER =====
function render() {

    const div =
        document.getElementById("list");

    div.innerHTML = "";

    alarms.forEach(a => {

        const t =
            new Date(a.time)
                .toLocaleTimeString();

        div.innerHTML += `
            <div style="
                background:#222;
                padding:10px;
                margin:5px 0;
                border-radius:8px;
                font-size:18px;
            ">
                🔔 Hall ${a.hall}
                <br>
                ⏰ ${t}
            </div>
        `;
    });
}

// ===== PLAY ALARM =====
function triggerAlarm(hall) {

    // play sound
    const audio =
        new Audio("alarm.mp3");

    audio.play();

    // popup
    alert(`🔔 Hall ${hall} tới giờ!`);
}

// ===== TIMER =====
<<<<<<< HEAD
async function scheduleAlarm(alarm) {

    await LocalNotifications.schedule({
        notifications: [
            {
                id: Number(
                    alarm.time.toString().slice(-8)
                ),

                title: `🔔 Hall ${alarm.hall}`,

                body: "Đến giờ rồi!",

                schedule: {
                    at: new Date(alarm.time),
                    allowWhileIdle: true
                },

                sound: "alarm.mp3",

                ongoing: true,

                autoCancel: false,

                largeBody:
                    `Hall ${alarm.hall} đang tới giờ!`
            }
        ]
    });
=======
function scheduleAlarm(alarm) {

    const delay =
        alarm.time - Date.now();

    if (delay <= 0) return;

    setTimeout(() => {

        triggerAlarm(alarm.hall);

        alarms =
            alarms.filter(
                a => a.id !== alarm.id
            );

        saveAlarms();

        render();

    }, delay);
>>>>>>> 85016d7 (fix android webview)
}

// ===== ADD =====
function addAlarm(id, when, hall) {

    const alarm = {
        id,
        time: when,
        hall
    };

    alarms.push(alarm);

    saveAlarms();

    scheduleAlarm(alarm);

    render();
}

// ===== MANUAL =====
document.getElementById("set")
    .addEventListener("click", () => {

        const mins =
            parseInt(
                document.getElementById("minutes").value
            );

        if (isNaN(mins) || mins <= 0) {

            alert("Nhập phút hợp lệ");

            return;
        }

        const hall = "Manual";

        const when =
            Date.now() + mins * 60000;

        const id =
            `${hall}_${when}`;

        addAlarm(id, when, hall);
    });

// ===== LOAD GITHUB =====
document.getElementById("load")
    .addEventListener("click", async () => {

        const token =
            prompt("🔑 GitHub Token:");

        if (!token) return;

        try {

            const url =
                `https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/contents/${FILE_PATH}`;

            const res =
                await fetch(url, {
                    headers: {
                        Authorization:
                            `token ${token}`
                    }
                });

            if (!res.ok)
                throw new Error(
                    `GitHub lỗi ${res.status}`
                );

            const data =
                await res.json();

            const jsonText =
                atob(
                    data.content
                        .replace(/\n/g, "")
                );

            const list =
                JSON.parse(jsonText);

            alarms = [];

            saveAlarms();

            const now =
                Date.now();

            let count = 0;

            list.forEach(entry => {

                if (entry.timestamp > now) {

                    const id =
                        `${entry.hall}_${entry.timestamp}`;

                    addAlarm(
                        id,
                        entry.timestamp,
                        entry.hall
                    );

                    count++;
                }
            });

            alert(
                `✅ Loaded ${count} alarms`
            );

        } catch (err) {

            console.error(err);

            alert("❌ " + err.message);
        }
    });

// ===== RESTORE =====
alarms.forEach(scheduleAlarm);

<<<<<<< HEAD
render();
=======
render();
>>>>>>> 85016d7 (fix android webview)
