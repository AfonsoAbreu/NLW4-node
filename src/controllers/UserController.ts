import { Request, response, Response } from "express";
import { getRepository } from "typeorm";

import User from "../models/User";

export default class UserController {
  async create (req: Request, res: Response) {
    const { name, email } = req.body;
    const usersRepository = getRepository(User);
    const userAlreadyExists = await usersRepository.findOne({
      email
    });
    if (userAlreadyExists) {//TODO: fix this (make email column UNIQUE and try/catch for errors, as there is more than one edge case and i dont really enjoy a if/else mess)
      return res.status(400).json({
        error: "User already exists!"
      });
    }
    const user = usersRepository.create({
      name,
      email
    });
    await usersRepository.save(user);
    return res.json(user);
  }
}