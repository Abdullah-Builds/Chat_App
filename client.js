const socket = io("http://localhost:3000");

// Ask to find a partner
socket.emit("find_partner");

// Waiting notice
socket.on("waiting", () => {
  console.log("Waiting for a partner...");
});

// Partner found
socket.on("partner_found", ({ partnerId }) => {
  console.log("Partner connected:", partnerId);

  // Example: send message
  socket.emit("private_message", "Hey stranger!");
});

// Receive messages
socket.on("private_message", ({ from, message }) => {
  console.log(`Stranger (${from}): ${message}`);
});

// Partner disconnected
socket.on("partner_disconnected", () => {
  console.log("Your partner disconnected.");
});
