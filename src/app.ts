import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import { changeMeeting, checkLogin, createMeeting, createPreferredTime, finalDecision, getMeetingInfo } from "./db";

declare module "express-session" {
  interface SessionData {
    authenticated?: boolean;
    user?: {
      name: string;
      password: string;
    };
  }
}

const app = express();
const corsOptions = {
  origin: "*",
};
const store = new session.MemoryStore();

app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(
  session({
    secret: "veryveryimportantsecretekey",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 30000 },
    store: store,
  })
);

app.get("/hello", (req, res) => {
  // Do whatever you want
  return res.status(200).send({
    test: "gooood..",
  });
});

app.post("/createMeeting", (req, res) => {
  const meetingId = createMeeting(
    req.body.title,
    req.body.description,
    req.body.timezone,
    req.body.hostName,
    req.body.hostPreferredTime
  );
  return res.status(200).send({
    id: meetingId,
  });
});

app.get("/:meetingId/meetingInfo", (req, res) => {
  const meetingId = req.params.meetingId;
  const meetingInfo = getMeetingInfo(parseInt(meetingId));

  return res.status(200).send(meetingInfo);
});

app.post("/:meetingId/preferredTime", (req, res) => {
  const meetingId = req.params.meetingId;
  createPreferredTime(parseInt(meetingId), req.body.name, req.body.preferredTime);
  return res.status(201).send();
});

app.put("/:meetingId/changeMeeting", (req, res) => {
  const meetingId = req.params.meetingId;
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
});

app.post("/:meetingId/finalDecision", (req, res) => {
  const meetingId = req.params.meetingId;
  finalDecision(parseInt(meetingId), req.body.decidedTime);
  return res.status(201).send();
});

app.post("/login", (req, res) => {
  console.log(req.sessionID);
  console.log(store);
  const { user, password } = req.body;

  if (user && password) {
    if (req.session.authenticated) {
      return res.status(201).send(req.session);
    } else {
      // Check if the user & password exists in the database
      // If true: return the authenticated info
      // If false: return the error message
      if (checkLogin(123, user, password)) {
        req.session.authenticated = true;
        req.session.user = {
          name: user,
          password: password,
        };
        return res.status(201).send(req.session);
      } else {
        return res.status(403).send({ error: "Bad authentication" });
      }
    }
  }

  return res.status(201).send({ status: "logged in" });
});

app.get("/authenticated", (req, res) => {
  if (req.session.authenticated) {
    return res.status(200).send({ status: "authenticated" });
  } else {
    return res.status(403).send({ status: "Unauthenticated" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
