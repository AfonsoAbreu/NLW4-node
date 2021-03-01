import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { resolve } from 'path';

import SurveysRepository from "../repositories/SurveysRepository";
import SurveysUsersRepository from "../repositories/SurveyUsersRepository";
import UsersRepository from "../repositories/UsersRepository";
import SendMailService from "../services/SendMailService";
import AppError from "../errors/AppError";

export default class SendMailController {
  async execute (req: Request, res: Response) {
    const { email, survey_id } = req.body;
    const usersRepository = getCustomRepository(UsersRepository);
    const surveysRepository = getCustomRepository(SurveysRepository);
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);
    
    const user = await usersRepository.findOne({ email });//TODO: also fix this, by moving all the validation stuff into the Repository (with custom methods) and wrapping calls to these methods in try/catch blocks
    if (!user) {
      throw new AppError("User does not exists");
    }
    const survey = await surveysRepository.findOne({ id: survey_id });//same thing here
    if (!survey) {
      throw new AppError("Survey does not exists");
    }
    const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");
    const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
      where: [{user_id: user.id, value: null, survey_id: survey.id}],
      relations: ["user", "survey"]
    });

    const variables = {
      name: user.name,
      title: survey.title,
      description: survey.description,
      id: surveyUserAlreadyExists?.id,
      link: process.env.URL_MAIL,
    };

    if (surveyUserAlreadyExists) {//in case the data is already there, just send it again
      await SendMailService.execute(email, survey.title, variables, npsPath);
      return res.json(surveyUserAlreadyExists);
    }    
    const surveyUser = surveysUsersRepository.create({//save it on "surveys_users" table
      user_id: user.id,
      survey_id
    });
    await surveysUsersRepository.save(surveyUser);
    variables.id = surveyUser.id;    
    await SendMailService.execute(email, survey.title, variables, npsPath);//send the e-mail to the user
    return res.json(surveyUser);
  }
}