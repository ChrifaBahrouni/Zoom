const express = require("express");
const { Socket } = require("net");
const { join } = require("path");
const app = express();
const server = require("http").Server(app)
const io = require("socket.io")(server)
const port = 3000
app.get("/", (req, res) => {
    res.send("hello word")
})

io.on("connection", socket => {
    console.log("Someone connected")
    socket.on("Join-room ", ({ roomId, userName }) => {
        console.log("User joined room ");
        console.log(roomId);
        console.log(userName);
    })
});
server.listen(port, () => {
    console.log(' Zoom API listen on localhost : 3000 ')
})