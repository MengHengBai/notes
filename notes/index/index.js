const ws = new WebSocket(`ws://${serverIp}:1557`);

let loaded = false;
let loadIntv;

window.onload = function () {
    let stat = document.createElement("div");
    stat.id = "status";
    document.body.appendChild(stat);
    loaded = true;
}

ws.onopen = function () {
    setInterval(() => {
        ws.send("[e]");
    }, 60000);
    ws.send("[e]");
}

ws.onmessage = function (msg) {
    msg = msg.data;
    if (msg.slice(0, 1) === ";") {
        let eleRC = msg.indexOf(",");
        OSleftEle = msg.slice(1, eleRC);
        OSstat = msg.slice(eleRC + 1);
        loadIntv = setInterval(() => {
            if (loaded) {
                document.querySelector("#status").innerHTML = `<p id="Ele">${OSleftEle}%</p><p id="Up">${OSstat == "UNPLUGGED" ? "耗电" : "充电"}</p><p id="time">00:00</p>`;
                setInterval(() => {
                    let dt = new Date();
                    document.querySelector("#time").innerHTML = dt.getHours() + ":" + dt.getMinutes();
                }, 10000);
                let ddt = new Date();
                document.querySelector("#time").innerHTML = ddt.getHours() + ":" + ddt.getMinutes();
                clearInterval(loadIntv);
            }
        }, 500);
    }
}

ws.onerror = function () {
    document.querySelector("#status").style.display = "none";
}