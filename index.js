const express = require("express");
const requestLimit = require("express-rate-limit");
const fetch = require("node-fetch");

let app = express();
let http = require("http").createServer(app);
const port = 3000;

app.use(express.static("public"));

const limiter = requestLimit({
    windowMs: 500,
    max: 1,
    onLimitReached: (req, res, options) => {
        console.log("LIMITE!!!");
    },
});

app.use(limiter);
let server = app.listen(port, () => {
    console.log(`Escutando em ${port}`);
});
app.get("/fetch/*", async (req, res) => {
    console.log("Cheguei aqui!!")
    let result = await fetch(req.params[0]);
    let json = await result.json()
    console.log("Result = " + String(result));
    console.log("JSON = " + String(result));
    res.send(json);
});
