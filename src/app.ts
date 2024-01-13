import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import { changeMeeting, checkLogin, createMeeting, createPreferredTime, finalDecision, getMeetingInfo } from "./db";
import mysql from "mysql2";
import "dotenv/config";

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
  const [rows, _] = await promisePool.query("SELECT id, title FROM meeting");
  console.log(rows);
  return res.status(200).send({
    rows: rows,
  });
});

app.post("/createMeeting", async (req, res) => {
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
  const meetingId = req.params.meetingId;
  await createPreferredTime(promisePool, parseInt(meetingId), req.body.name, req.body.preferredTime);
  return res.status(201).send();
});

app.put("/:meetingId/changeMeeting", (req, res) => {
  const meetingId = req.params.meetingId;

  if (
    req.session.authenticated == true &&
    req.session.user &&
    req.session.user.meetingId == parseInt(meetingId) &&
    req.session.user.role == "host"
  ) {
    // TODO Change meeting table on SQL
    changeMeeting(
      parseInt(meetingId),
      req.body.title,
      req.body.description,
      req.body.timezone,
      req.body.hostName,
      req.body.hostPreferredTime
    );
    return res.status(200).send({
      id: meetingId,
    });
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

app.post("/:meetingId/login", async (req, res) => {
  const meetingId = req.params.meetingId;
  const { user, password } = req.body;

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

app.get("/checkAuthed", (req, res) => {
  if (req.session.authenticated == true) {
    return res.status(200).send({ status: "Logged in!. Good..." });
  } else {
    return res.status(403).send({ status: "Not logged in. Too bad..." });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
