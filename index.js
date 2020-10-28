const express = require("express");
const requestLimit = require("express-rate-limit");
const fetch = require("node-fetch");
const fs = require("fs");

let app = express();
let http = require("http").createServer(app);
const port = 3000;

app.use(express.static("public"));

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
    console.log("Cheguei aqui!!");

    let result = await fetch(req.params[0], {
        "Content-Type": "application/json",
        Accept: "application/json",
    });
    let json = await result.json();
    console.log("Result = " + String(result));
    console.log(`JSON = ${JSON.stringify(json)}`);
    res.send(json);
});
