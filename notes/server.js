const os = require("os");
const http = require("http");
const fs = require("fs");
const child_process = require("child_process");
const websocket = require("ws");
const markdown = require("markdown-js");

//termux elesctic(
let ele = 20;
let isUp = "UNPLUGGED";
function GetEle() {
    child_process.exec("termux-battery-status", function (stderr, stdout) {
        if (stderr) {
            console.log(stderr);
        }
        let sta = JSON.parse(stdout);
        ele = sta.percentage;
        isUp = sta.plugged;
    });
}
setInterval(GetEle, 60000);
GetEle();

//File Search By Line
function SearchFile(keywords, filename) {
    let contents = new Array();
    let finded = false;
    let nowlines = 0;
    let file = fs.readFileSync("./src/" + filename, "utf-8").split("\n");
    for (let i = 0; i < file.length; i++) {
        if (!finded && file[i].slice(0, 1) === "#") {
            nowlines = i;
        }
        if (finded && (file[i].slice(0, 1) === "#" || i === file.length)) {
            let content = "";
            for (let o = nowlines; o < i; o++) content += file[o];
            contents.push(content);
            nowlines = i;
            finded = false;
        }
        if (!finded && file[i].toUpperCase().indexOf(keywords.toUpperCase()) !== -1) {
            finded = true;
        }
    }
    return contents;
}

//Search Data By File
function Search(keywords) {
    let allSub = 0;
    let all = new Array();
    let allFiles = fs.readdirSync("./src");
    for (let i = 0; i < allFiles.length; i++) {
        let filec = "";
        SearchFile(keywords, allFiles[i]).forEach(t => {
            filec += t;
        });
        if (filec !== "") {
            all[allSub] = `[${allFiles[i]}]` + filec;
            allSub++;
        }
    }
    return all;
}

//Make Markdown Doc
function MakeMd(strArr) {
    for (let i = 0; i < strArr.length; i++) { //<i>XXX.md</i> + FIEL CONTENTS
        strArr[i] = `<i>${strArr[i].slice(strArr[i].indexOf("[") + 1, strArr[i].indexOf("]"))}</i>\n` + markdown.makeHtml(strArr[i].slice(strArr[i].indexOf("]") + 1));
    }
    return strArr;
}

//GET IP //form sf
function getIPAddress() {
    let IPAddress = '';
    var interfaces = os.networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                IPAddress = alias.address;
            }
        }
    }
    return IPAddress;
}

//INIT
function init() {
    let constHead = "<!DOCTYPE HTML>\n";
    let constMeta = "<meta charset=\"utf-8\" name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0\">\n";
    let style = `<style>\n${fs.readFileSync("./index/index.css", "utf-8")}\n</style>\n`;
    let javascript = `<script>\nconst serverIp="${getIPAddress()}";\nlet OSleftEle="${ele}";\nlet OSstat="${isUp}";\n${fs.readFileSync("./index/index.js", "utf-8")}\n</script>`;
    return constHead + constMeta + style + javascript;
}

//http server
http.createServer((ask, sand) => {
    let keywords = decodeURI(ask.url.slice(1));
    sand.writeHead(200, "{ content-type: text/html }");
    sand.write(init());
    if (keywords === "") {
        let allFiles = fs.readdirSync("src");
        for (file in allFiles) sand.write("<details><summary>" + allFiles[file] + "</summary>" + markdown.makeHtml(fs.readFileSync("src/" + allFiles[file], "utf-8")) + "</details>");
    } else {
        let data = Search(keywords);
        data = MakeMd(data);
        for (let i = 0; i < data.length; i++) {
            sand.write(`<div class="card">${data[i]}</div>`);
        }
        sand.end();
    }
}).listen(1556);

//websocket server
const WebSocketServer = websocket.Server;
const wss = new WebSocketServer({ port: 1557 });
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        message = message.toString("utf-8");
        if (message == "[e]") {
            ws.send(`;${ele},${isUp}`);
        } else {
            Search(message).forEach(f => {
                ws.send(f);
            });
        }
    });
});

//console.log
console.log("Http server listening on 1556");
console.log("Websocket server listening on 1557");