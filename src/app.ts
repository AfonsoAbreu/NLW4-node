import "reflect-metadata";
import express, { NextFunction, Request, Response } from "express";
import "express-async-errors";
import { getConnection } from "typeorm";

import createConnection from "./database";
import router from "./routes";
import AppError from "./errors/AppError";

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

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message
    });

    return res.status(500).json({
      status: "Error",
      message: `Internal server error ${err.message}`
    });
  }
});

export default app;