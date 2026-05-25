document.getElementById("load")
    .addEventListener("click", async () => {

        let token =
            localStorage.getItem("github_token");

        if (!token) {

            token =
                prompt("🔑 GitHub Token:");

            if (!token) return;

            localStorage.setItem(
                "github_token",
                token
            );
        }

        try {

            const url =
                `https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/contents/${FILE_PATH}`;

            console.log("Loading:", url);

            const res =
                await fetch(url, {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                        Accept:
                            "application/vnd.github+json"
                    }
                });

            console.log("Status:", res.status);

            if (!res.ok) {

                const txt =
                    await res.text();

                console.error(txt);

                throw new Error(
                    `GitHub lỗi ${res.status}`
                );
            }

            const data =
                await res.json();

            console.log(data);

            const jsonText =
                atob(
                    data.content.replace(/\n/g, "")
                );

            const list =
                JSON.parse(jsonText);

            alarms = [];

            saveAlarms();

            const now =
                Date.now();

            let count = 0;

            for (const entry of list) {

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
            }

            alert(
                `✅ Loaded ${count} alarms`
            );

        } catch (err) {

            console.error(err);

            alert(
                "❌ " +
                err.message
            );
        }
    });