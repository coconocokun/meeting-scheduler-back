import { Pool } from "mysql2/promise";

export async function createMeeting(
  pool: Pool,
  title: string,
  description: string,
  timezone: string,
  meetingLength: number,
  hostName: string,
  hostPassword: string,
  preferredTime: string
) {
  // 1. Insert meeting
  const [rows, _] = await pool.execute(
    "INSERT INTO meeting (title, description, timezone, meeting_length) VALUES (?, ?, ?, ?)",
    [title, description, timezone, meetingLength]
  );
  const meetingId = (rows as any).insertId;

  // 2. Insert host
  const [hrows, __] = await pool.execute(
    "INSERT INTO host (name, password, meeting_id, preferred_time) VALUES (?, ?, ?, ?)",
    [hostName, hostPassword, meetingId, preferredTime]
  );

  return meetingId;
}

export async function changeMeeting(
  pool: Pool,
  meetingId: number,
  title: string,
  description: string,
  timezone: string,
  meetingLength: number,
  hostName: string,
  preferredTime: string
) {
  const [mrows, _] = await pool.execute(
    "UPDATE meeting SET title = ?, description = ?, timezone = ?, meeting_length = ? WHERE id = ?",
    [title, description, timezone, meetingLength, meetingId]
  );

  // host --> id, name, password, preferred_time, meeting_id
  const [hrows, __] = await pool.execute("UPDATE host SET name = ?, preferred_time = ? WHERE meeting_id = ?", [
    hostName,
    preferredTime,
    meetingId,
  ]);

  return;
}

export async function getMeetingInfo(pool: Pool, id: number) {
  // 1. Get meeting info from meeting table
  const [rows, _] = await pool.execute("SELECT * FROM meeting WHERE id = ?", [id]);
  const meeting = (rows as any)[0];

  // 2. Get host info from host table
  const [hrows, __] = await pool.execute("SELECT name, preferred_time FROM host WHERE meeting_id = ?", [id]);
  const host = (hrows as any)[0];

  return {
    ...meeting,
    host: {
      ...host,
    },
  };
}

export async function createPreferredTime(pool: Pool, meetingId: number, name: string, preferredTime: string) {
  // 1. Insert guest data into guest table
  const [rows, _] = await pool.execute("INSERT INTO guest (name, meeting_id, preferred_time) VALUES (?, ?, ?)", [
    name,
    meetingId,
    preferredTime,
  ]);
  return;
}

export function finalDecision(meetingId: number, decidedTime: number[]) {
  // TODO Send SQL query to the DB
  return;
}

export async function checkLogin(pool: Pool, meetingId: number, user: string, password: string) {
  const [rows, _] = await pool.execute("SELECT * FROM host WHERE name = ? AND password = ? AND meeting_id = ?", [
    user,
    password,
    meetingId,
  ]);

  if ((rows as any).length > 0) {
    return true;
  } else {
    return false;
  }
}
