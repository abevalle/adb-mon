const app = require("express")();
const httpServer = require("http").createServer(app);
const options = { /* ... */ };
const io = require("socket.io")(httpServer, options);
const port = process.env.SERV_PORT || 3737

exports.update = async (status) => {
    io.sockets.emit("staus", status)
}

app.get('/', (req, res) => {
    res.sendFile(__dirname+'/index.html')
})

exports.startServ = () => {
    httpServer.listen(port);
    console.log('Websocket and server have started on port ', port)
}
// WARNING !!! app.listen(3000); will not work here, as it creates a new HTTP server
