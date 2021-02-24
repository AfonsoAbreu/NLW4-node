import { EntityRepository, Repository } from "typeorm";

import Survey from "../models/Survey";

@EntityRepository(Survey)
export default class SurveysRepository extends Repository<Survey> {
  
}