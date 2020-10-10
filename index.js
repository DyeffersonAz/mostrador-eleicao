const express = require("express");
const requests = require("request");

let app = express();
let http = require("http").createServer(app);
const port = 3000;

app.use(express.static("public"));

let server = app.listen(port, () => {
    console.log(`Escutando em ${port}`);
    
});

app.get("/", (req, res) => {
    socketio.emit('election', {
        city: "itaocara",
        candidate: "josé cavalo",
        role: "prefeito"
    })
})
const socketio = require("socket.io")(server);



async function checkElections(city) {
    // TODO: Pedir arquivo ao TSE de uma cidade em específico passada na função, converter arquivo pra JSON e depois checar se algum candidato está eleito e mandar em um socket para os clientes a informação da eleição.
}
