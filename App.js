const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const interval = 5000;
// Driver's location data
let driverLocation = null;

// Driver sends location data to server via HTTP POST request
app.post("/driver-location", express.json(), (req, res) => {
  const location = req.body;
  driverLocation = location;
  console.log("Driver location:", driverLocation);
  res.sendStatus(200);
});

// User requests driver's location data via Socket.IO
io.on("connection", (socket) => {
  console.log("User connected");

  // Send driver's location to user
  if (driverLocation) {
    setInterval(() => {
      socket.emit("driverLocation", driverLocation);
      console.log("Location data sent");
    }, interval);
  }

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// server.listen(3000, () => {
//   console.log("Server started on port 3000");
// });
var port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port: ` + port);
});
