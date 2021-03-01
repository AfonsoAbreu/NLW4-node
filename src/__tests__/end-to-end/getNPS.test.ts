import request from "supertest";
import { getCustomRepository, IsNull, Not } from "typeorm";

import app from "../../app";
import createConnection from "../../database";
import SurveysRepository from "../../repositories/SurveysRepository";
import SurveysUsersRepository from "../../repositories/SurveyUsersRepository";
import UsersRepository from "../../repositories/UsersRepository";

describe("NPS generation", () => {
  beforeAll(async () => {
    const connection = await createConnection();
    await connection.runMigrations();
  });
  
  it("Will create 10 accounts", async () => {
    const persons = [
      {
        name: "Rosanna Redmond",
        email: "jmohyeddine.litiy@uththandi.com"
      },
      {
        name: "Maciej Aldred",
        email: "zdolan_doln5@moxianmusic.com"
      },
      {
        name: "Esmay Landry",
        email: "abadr.elhackerc@ncstore.me"
      },
      {
        name: "Jamie-Leigh Wells",
        email: "9hamza.ahrchawi7@realfanclub.cf"
      },
      {
        name: "Tyson Dixon",
        email: "oshan@ritadecrypt.net"
      },
      {
        name: "Mimi Cooke",
        email: "qamiir.psycop@hustletussle.com"
      },
      {
        name: "Duncan Griffith",
        email: "wvv.rajawik@cokils.com"
      },
      {
        name: "Harriette Munro",
        email: "wviv.rajawik@cokils.com"
      },
      {
        name: "Kate Rivera",
        email: "9nono.nini@lowwagercasinos.com"
      },
      {
        name: "Hamzah Kay",
        email: "4mouhibel5irlel8v@azel.xyz"
      },
    ];
    for (const person of persons) {
      const response = await request(app).post("/users").send(person);
      // console.log(response.body);
      expect(response.status).toBe(201);
    }//creates ten accounts
    const users = await getCustomRepository(UsersRepository).count();
    // console.log(users);
    expect(users).toBe(10);
  });

  it("Will create 2 surveys", async () => {
    const Surveys = [
      {
        title: "Give RPG items to every puppy born",
        description: "Whenever a puppy is born, the estate will have the obligation to provide it with a magic RPG item, such as: lethal demoniac swords, powerful mana catalysts and any other type of RPG item."
      },
      {
        title: "Free healthcare for all",
        description: "Seriously, is it THAT difficult?"
      }
    ];
    for (const survey of Surveys) {
      const response = await request(app).post("/surveys").send(survey);
      // console.log(response.body);
      expect(response.status).toBe(201);
    }//creates two surveys
    const surveys = await getCustomRepository(SurveysRepository).count();
    // console.log(surveys);
    expect(surveys).toBe(2);
  });

  it("Will send the two surveys to all accounts", async () => {
    const mailRepo = getCustomRepository(SurveysUsersRepository);
    const userRepo = getCustomRepository(UsersRepository);
    const surveyRepo = getCustomRepository(SurveysRepository);

    const users = await userRepo.find({
      select: ["email"]
    });
    const surveys = await surveyRepo.find({
      select: ["id"]
    });
    
    for (const survey of surveys) {
      // let loopCount = 0;    
      for (const user of users) {
        const response = await request(app).post("/sendMail").send({
          survey_id: survey.id,
          email: user.email
        });
        expect(response.status).toBe(200);
        // loopCount++;
        // console.log([user, survey, loopCount]);
      }
      // console.log(`${survey.id} DONE! ${loopCount} rows inside.`);
    }
    expect(await mailRepo.count()).toBe(20);
  });

  const awnsers = {} as { [key: string]: number[] };//constant to store the random numbers (to validate it after)
  it("Will simulate awnsers for each survey for each user", async () => {
    const mailRepo = getCustomRepository(SurveysUsersRepository);
    const pendingAwnsers = await mailRepo.find();
    // console.log(pendingAwnsers);
    for (let i = 0; i < pendingAwnsers.length; i++) {
      const evaluation = Math.ceil(Math.random() * 10);
      const response = await request(app).get(`/awnsers/${evaluation}?u=${pendingAwnsers[i].id}`);
      expect(response.status).toBe(200);
      expect(response.body.value).not.toBeNull();
      expect(response.body.value).not.toBeUndefined();
      expect(response.body.value).toEqual(expect.any(Number));
      expect(response.body.value).toBeGreaterThanOrEqual(1);
      expect(response.body.value).toBeLessThanOrEqual(10);//response.body.value should be a Number between 1 and 10

      if (Array.isArray(awnsers[pendingAwnsers[i].survey_id])) {//if there is an array in awnsers[i].id, pushes value to it
        awnsers[pendingAwnsers[i].survey_id].push(evaluation);
      } else {//else, creates array with first value
        awnsers[pendingAwnsers[i].survey_id] = [evaluation] as number[];
      }
    }

    const affectedRows = await mailRepo.createQueryBuilder("survey_user")
      .where("survey_user.value is not null")
      .andWhere("survey_user.value >= 1")
      .andWhere("survey_user.value <= 10")
      .getCount();
    expect(affectedRows).toBe(20);//checks the number of rows that were affected and valid at the same time
  });

  it("Will calculate the NPS", async () => {
    const surveyRepo = getCustomRepository(SurveysRepository);
    const surveys = await surveyRepo.find();

    for (let i = 0; i < surveys.length; i++) {
      const response = await request(app).get(`/nps/${surveys[i].id}`);
      console.log(response.body);
      expect(response.status).toBe(200);
      expect(Number(response.body.detractors) + Number(response.body.promoters) + Number(response.body.passives)).toBe(Number(response.body.totalAwnsers));
      expect(response.body.nps).toBeLessThanOrEqual(100);
      expect(response.body.nps).toBeGreaterThanOrEqual(-100);//nps must be between -100 and 100, and the sum of defractors, promoters and passives must be equal to the whole of awnsers
      const currentSurvey = Object.keys(awnsers)[i];//gets all the surveys as keys from the awnsers object
      const manualNps = 
        (
          (
            awnsers[currentSurvey].filter(e => e >= 9 && e <= 10).length 
            - awnsers[currentSurvey].filter(e => e >= 0 && e <= 6).length
          )
          / awnsers[currentSurvey].length
        ) 
        * 100;
      // expect([awnsers, manualNps]).toBe(3);
      expect(response.body.nps).toEqual(manualNps);
    }
  });
});