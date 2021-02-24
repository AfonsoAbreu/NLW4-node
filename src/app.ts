import "reflect-metadata";
import express, { Request, Response } from "express";
import { getConnection } from "typeorm";

import createConnection from "./database";
import router from "./routes";

createConnection();
const app = express();

app.post("/autodestruct", async (req: Request, res: Response) => {
  //NOOOOOO PERRY, DONT HIT THE BUTTON
  const entities = await getConnection().entityMetadatas;
  for (const entity of entities) {
    const repo = await getConnection().getRepository(entity.name);
    await repo.clear();
  }
  res.send("CURSE YOU, PERRY THE PLATYPUS!!!!").status(200);
});

app.use(express.json());
app.use(router);

export default app;