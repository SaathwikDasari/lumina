import express from "express";
import cors from "cors";
import { execFile } from "node:child_process";
import path from "path";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());


const ENGINE_PATH = path.join(
    __dirname,
    "..",
    "engine",
    "target",
    "debug",
    "engine.exe"
);

app.post("/optimize", (req, res) => {
    const { amount, from, to } = req.body;

    if (!amount || !from || !to) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  execFile(
    ENGINE_PATH,
    [from, to, amount.toString()],
    (error) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: "Engine failed" });
      }

      const resultPath = path.join(
        __dirname,
        "..",
        "output",
        "result.json"
      );

      const result = JSON.parse(
        fs.readFileSync(resultPath, "utf-8")
      );

      res.json(result);
    }
  );
});

app.listen(4000, () => {
  console.log("API running on http://localhost:4000");
});