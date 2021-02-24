import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";

import UsersRepository from "../repositories/UsersRepository";

export default class UserController {
  async create (req: Request, res: Response) {
    const { name, email } = req.body;
    const usersRepository = getCustomRepository(UsersRepository);
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
    return res.status(201).json(user);
  }
}