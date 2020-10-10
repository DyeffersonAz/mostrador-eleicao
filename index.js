const express = require("express");

let app = express();
const port = 3000;

app.use(express.static("public"));

app.listen(port, () => {
    console.log(`Escutando em ${port}`);
});
