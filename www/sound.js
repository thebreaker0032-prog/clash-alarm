const params = new URLSearchParams(location.search);

const hall = params.get("hall") || "Không rõ";

document.getElementById("title").textContent =
    `🔔 Hall ${hall} đang tới giờ!`;