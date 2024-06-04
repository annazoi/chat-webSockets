class Signaling {
  private _socket: WebSocket | any;
  private _callback: ((event: MessageEvent) => void) | any;

  constructor(httpPath: any) {
    this._socket = null;
    this._callback = null;
    if (httpPath) {
      this._socket = new WebSocket(httpPath.replace("http", "ws"));
      this._socket.onmessage = this.__onServerMessage.bind(this);
    }
  }
  send(data: string): void {
    if (this._socket && this._socket.readyState === WebSocket.OPEN) {
      this._socket.send(JSON.stringify({ type: "dispatchEvent", data }));
    }
  }
  // send(data: any) {
  //   if (this._socket)
  //     this._socket.send(
  //       JSON.stringify({
  //         type: "dispatchEvent",
  //         data: data,
  //       })
  //     );
  // }

  onMessage(callback: (event: MessageEvent) => void): void {
    if (typeof callback != "function") return;
    this._callback = callback;
  }

  private __onServerMessage(event: MessageEvent): void {
    if (this._callback) {
      let parsedData;
      try {
        parsedData = JSON.parse(event.data);
      } catch (error) {
        console.error("Received data is not valid JSON:", event.data);
        return;
      }
      this._callback(parsedData);
    }
  }
}

export default Signaling;
