const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const interval = 5000;
const driverLocations = new Map();

// Driver sends location data to server via HTTP POST request
app.post("/driver-location", express.json(), (req, res) => {
  const { driverId, location } = req.body;
  driverLocations.set(driverId, location);
  console.log(`Driver ${driverId} location:`, location);

  // Send driver location updates to all users subscribed to the driver's room
  io.to(driverId).emit("driverLocation", location);

  res.sendStatus(200);
});

// User subscribes to a driver's location updates via Socket.IO
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("subscribe", (driverId) => {
    socket.join(driverId);
    console.log(`User subscribed to driver ${driverId}`);

    // Send driver's location to user
    if (driverLocations.has(driverId)) {
      socket.emit("driverLocation", driverLocations.get(driverId));
      console.log(`Location data for driver ${driverId} sent`);
    }
  });

  socket.on("unsubscribe", (driverId) => {
    socket.leave(driverId);
    console.log(`User unsubscribed from driver ${driverId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
