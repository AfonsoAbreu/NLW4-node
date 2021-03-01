import { Request, Response } from "express";
import { getCustomRepository, IsNull, Not } from "typeorm";

import SurveysUsersRepository from "../repositories/SurveyUsersRepository";

export default class NpsController {
  async execute (req: Request, res: Response) {
    const { survey_id } = req.params;
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    const surveysUsers = await surveysUsersRepository.find({
      survey_id,
      value: Not(IsNull())
    });

    const detractors = surveysUsers.filter(
      ({ value }) => value >= 0 && value <= 6
    ).length;

    const promoters = surveysUsers.filter(
      ({ value }) => value >= 9 && value <= 10
    ).length;

    const passives = surveysUsers.filter(
      ({ value }) => value >= 7 && value <= 8
    ).length;

    const totalAwnsers = surveysUsers.length;

    const nps = Number((((promoters - detractors) / totalAwnsers) * 100).toFixed(2));

    return res.json({
      detractors,
      promoters,
      passives,
      totalAwnsers,
      nps
    });
  }
}