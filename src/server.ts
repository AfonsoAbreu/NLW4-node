import express from "express";

const app = express();

app.get("/", (req, res) => {
  return res.json({ message: "Hello World - NLW04" });
});

app.post("/", (req, res) => {
  return res.json({ message: "Data successfully saved!" });
});

app.listen(3333, () => console.log("Server running..."));