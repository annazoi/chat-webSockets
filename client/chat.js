const API_URL = "http://localhost:8080";

let username = prompt("Enter your username");

const log = (message) => {
  console.log("Web Socket: ", message);
};

let ws = new WebSocket(API_URL + "/chat");
ws.onopen = function () {
  log("ws opened");
  let data = { user: username };
  send_data(data);
};
ws.onmessage = function (event) {
  let data = recv_data(event.data);
  alert(data.message);
};
ws.onclose = function () {
  console.log("ws closed");
};

const recv_data = (json_string) => {
  log("Recvd: ", json_string);
  let data = JSON.parse(json_string);
  return data;
};
