const socket = require("socket.io");
const http = require("http");
const path = require("path");
const fs = require("fs");

const server = http.createServer((req, res) => {
  const indexPath = path.join(__dirname, "index.html");
  const readStream = fs.createReadStream(indexPath);

  readStream.pipe(res);
});

const io = socket(server);

const allName = ["Artem", "Vera", "Vova", "John", "Piter"];
const userConnected = [];
var userOnline = [];
var userName = "";

const randomName = () => {
  let freeName = allName.filter((item) => !userOnline.includes(item));
  userName = freeName[Math.floor(Math.random() * freeName.length)];
};

io.on("connection", (client) => {
  randomName();
  const serverMsg = (msg) => {
    const payload = {
      userName: userName,
      message: msg,
    };

    client.broadcast.emit("server-msg", payload);
    client.emit("server-msg", payload);
  };

  client.emit("server-name", userName);

  if (userConnected.indexOf(userName) != -1) {
    serverMsg(" reconnected!");
    userOnline.push(userName);
  } else {
    userConnected.push(userName);
    userOnline.push(userName);
    serverMsg(" connected!");
  }

  client.on("disconnect", () => {
    userOnline = userOnline.filter((user) => user !== userName);
    serverMsg(" disconnect!");
  });

  client.broadcast.emit("server-online", userOnline);
  client.emit("server-online", userOnline);

  client.on("client-msg", (data) => {
    serverMsg(data.message);
  });
});

server.listen(3000);
