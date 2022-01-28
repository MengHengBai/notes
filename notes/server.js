const http = require("http")
const fs = require("fs")
const path = require("path")

const c = console.log //For console

const s = { //A map for count #
    1: "#",
    2: "##",
    3: "###",
    4: "####",
    5: "#####",
    6: "######"
}

//File Search By Line
function SearchFile(keywords, filename) {
    let file = fs.readFileSync(__dirname + "/src/" + filename, "utf-8").split("\n");
    let contents = "" //The string
    let finded = false //Did it found?
    let nowlines = 0 //Now lines
    let nowlep = 1 //Count of #
    for (let i = 0; i < file.length; i++) {
        if (!finded && file[i].slice(0, 1) === s[1]) {
            nowlines = i
            nowlep = file[i].slice(0, (file[i].slice(0, 7)).indexOf(" ")).length
            if (nowlep > 6) nowlep = 6
        }
        if (finded && (file[i].slice(0, nowlep) <= s[nowlep] || i === file.length)) {
            for (let o = nowlines; o < i; o++) contents += file[o] + "\n";
            nowlines = i
            finded = false
            nowlep = 1
        }
        if (!finded && file[i].toUpperCase().indexOf(keywords.toUpperCase()) !== -1) {
            finded = true
        }
    }
    return contents;
}

//Search Data By File
function Search(keywords) {
    let all = {}
    let allFiles = fs.readdirSync(__dirname + "/src");
    for (let i = 0; i < allFiles.length; i++) {
        let filec = SearchFile(keywords, allFiles[i])
        if (filec !== "") {
            all[allFiles[i]] = filec
        }
    }
    return JSON.stringify(all);
}

//Notes
http.createServer((ask, sand) => {
    sand.statusCode = 200
    sand.setHeader("Access-Control-Allow-Origin", "*")
    sand.setHeader("content-type", "application/json")
    sand.setHeader("charset", "utf-8")
    sand.end(Search(decodeURI(ask.url.slice(1))))
}).listen(1556, () => {
    c("Notes http server was opend at 1556")
})
