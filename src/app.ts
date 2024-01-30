import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import { changeMeeting, checkLogin, createMeeting, createPreferredTime, finalDecision, getMeetingInfo } from "./db";
import mysql from "mysql2";
import "dotenv/config";
import {
  validateChangeMeetingInput,
  validateCreateMeetingInput,
  validateHostLogintInput,
  validatePreferredTimeInput,
} from "./validator";

declare module "express-session" {
  interface SessionData {
    authenticated?: boolean;
    user?: {
      name: string;
      role: string;
      meetingId: number;
    };
  }
}

const app = express();
const corsOptions = {
  origin: "*",
};

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DATABASE,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: {
    rejectUnauthorized: true,
  },
});
const promisePool = pool.promise();

app.use(
  session({
    secret: "veryverysecurecode",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 300000 },
  })
);
app.use(bodyParser.json());
app.use(cors(corsOptions));

app.get("/hello", async (req, res) => {
  // Do whatever you want
  let regex: RegExp = /^[A-Za-z0-9 ]{3,200}$/;
  const valid = regex.test("");
  return res.status(200).send({
    valid: valid,
  });
});

app.post("/createMeeting", async (req, res) => {
  if (
    !validateCreateMeetingInput(
      req.body.title,
      req.body.timezone,
      req.body.meetingLength,
      req.body.hostName,
      req.body.hostPassword,
      req.body.hostPreferredTime
    )
  ) {
    return res.status(403).send({
      error: "Invalid input",
    });
  }

  const meetingId = await createMeeting(
    promisePool,
    req.body.title,
    req.body.description,
    req.body.timezone,
    req.body.meetingLength,
    req.body.hostName,
    req.body.hostPassword,
    req.body.hostPreferredTime
  );
  return res.status(200).send({
    meetingId: meetingId,
  });
});

app.get("/:meetingId/meetingInfo", async (req, res) => {
  const meetingId = req.params.meetingId;
  const meetingInfo = await getMeetingInfo(promisePool, parseInt(meetingId));

  return res.status(200).send(meetingInfo);
});

app.post("/:meetingId/preferredTime", async (req, res) => {
  if (!validatePreferredTimeInput(req.body.name, req.body.preferredTime)) {
    return res.status(403).send({
      error: "Invalid input",
    });
  }
  const meetingId = req.params.meetingId;
  await createPreferredTime(promisePool, parseInt(meetingId), req.body.name, req.body.preferredTime);
  return res.status(201).send();
});

app.put("/:meetingId/changeMeeting", async (req, res) => {
  const meetingId = req.params.meetingId;

  if (
    req.session.authenticated == true &&
    req.session.user &&
    req.session.user.meetingId == parseInt(meetingId) &&
    req.session.user.role == "host"
  ) {
    if (
      !validateChangeMeetingInput(
        req.body.title,
        req.body.timezone,
        req.body.meetingLength,
        req.body.hostName,
        req.body.hostPreferredTime
      )
    ) {
      return res.status(403).send({
        error: "Invalid input",
      });
    }

    await changeMeeting(
      promisePool,
      parseInt(meetingId),
      req.body.title,
      req.body.description,
      req.body.timezone,
      req.body.meetingLength,
      req.body.hostName,
      req.body.hostPreferredTime
    );
    return res.status(201).send({});
  } else {
    return res.status(403).send({
      error: "Bad authentication",
    });
  }
});

app.post("/:meetingId/finalDecision", (req, res) => {
  const meetingId = req.params.meetingId;
  finalDecision(parseInt(meetingId), req.body.decidedTime);
  return res.status(201).send();
});

app.post("/:meetingId/hostLogin", async (req, res) => {
  const meetingId = req.params.meetingId;
  const { user, password } = req.body;

  if (!validateHostLogintInput(user, password)) {
    return res.status(403).send({
      error: "Invalid input",
    });
  }

  if (user && password) {
    if (req.session.authenticated) {
      return res.status(201).send({ status: "Logged in" });
    } else {
      if (await checkLogin(promisePool, parseInt(meetingId), user, password)) {
        req.session.authenticated = true;
        req.session.user = {
          name: user,
          role: "host",
          meetingId: parseInt(meetingId),
        };
        return res.status(201).send({ status: "Logged in" });
      } else {
        return res.status(403).send({ error: "Bad authentication" });
      }
    }
  } else {
    return res.status(403).send({ error: "Bad authentication" });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
