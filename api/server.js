let http = require("http");
let ws = require("ws");
// filesystem
let fs = require("fs");
const path = require("path");

function new_ws_connection(ws) {
  ws.on("message", function message(json_string) {
    console.dir(json_string);
    let data = JSON.parse(json_string);
    console.dir(data);
    let username = data.user; // We get the username from the data sent by the client
    let response = { from: "server", message: "Welcome " + username };
    // We transform the response data to JSON and send them to the client:
    let json_response = JSON.stringify(response);
    ws.send(json_response);
  });
  ws.on("close", function () {
    console.log("ws closed");
  });
}
const server = http.createServer((req, res) => {
  const filePath = path.join(
    __dirname,
    "..",
    "client",
    req.url === "/" ? "chat.html" : req.url
  );
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("404 Not Found");
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
});

const wsServer = new ws.WebSocketServer({ server, path: "/chat" });
wsServer.on("connection", new_ws_connection);

const port = 8080;
server.listen(port, () => {
  console.log(`Server starting on port ${port}`);
});
