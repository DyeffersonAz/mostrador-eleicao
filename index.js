const express = require("express");
const requestLimit = require("express-rate-limit");
const fetch = require("node-fetch");
const fs = require("fs");
const util = require("util");
const streamPipeline = util.promisify(require("stream").pipeline);

let app = express();
let http = require("http").createServer(app);
const port = 3000;

app.use(express.static("public"));
app.use(express.static("imagecache"));

const limiter = requestLimit({
    windowMs: 1000,
    max: 100,
    onLimitReached: (req, res, options) => {
        console.log("LIMITE!!!");
    },
});

app.use(limiter);

let server = app.listen(port, () => {
    console.log(`Escutando em ${port}`);
});

app.get("/fetchJSON/*", async (req, res) => {
    console.log("Pegando JSON: " + req.params[0]);

    let response = await fetch(req.params[0], {
        "Content-Type": "application/json",
        Accept: "application/json",
    });
    let json = await response.json();
    res.send(json);
});

app.get("/fetchImage/*", async (req, res) => {
    let filename = `imagecache/${req.params[0].split("/").reverse()[0]}`;

    if (!fs.existsSync(filename)) {
        console.log("Baixando IMAGEM: " + req.params[0]);
        let response = await fetch(req.params[0]);

        if (response.ok) {
            await streamPipeline(response.body, fs.createWriteStream(filename));
        }
    }

    console.log("Enviando IMAGEM: " + filename);

    res.sendFile(filename, { root: __dirname });
});
