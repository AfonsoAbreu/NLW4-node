import { Request, response, Response } from "express";
import { getCustomRepository } from "typeorm";
import * as yup from 'yup';

import AppError from "../errors/AppError";
import UsersRepository from "../repositories/UsersRepository";

export default class UserController {
  async create (req: Request, res: Response) {
    const { name, email } = req.body;

    const schema = yup.object().shape({
      name: yup.string().required(),
      email: yup.string().email().required()
    });

    try {
      await schema.validate(req.body);
    } catch (err) {
      throw new AppError(err, 400);
    }

    const usersRepository = getCustomRepository(UsersRepository);
    const userAlreadyExists = await usersRepository.findOne({
      email
    });
    if (userAlreadyExists) {//TODO: fix this (make email column UNIQUE and try/catch for errors, as there is more than one edge case and i dont really enjoy a if/else mess)
      throw new AppError("User already exists!");
    }
    const user = usersRepository.create({
      name,
      email
    });
    await usersRepository.save(user);
    return res.status(201).json(user);
  }
}