const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());

//solve cors
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

//PUBLIC FOLDER IMAGES
app.use(express.static("public"));

//ROUTES
const UserRoutes = require("./routes/UserRoutes");
app.use("/users", UserRoutes);

//SERVER
app.listen(5000, () => {
  console.log("server running...");
});
