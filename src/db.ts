export function createMeeting(
  title: string,
  description: string,
  timezone: string,
  hostName: string,
  preferredTime: number[]
) {
  // TODO Send SQL to the DB
  return 32;
}

export function changeMeeting(
  meetingId: number,
  title: string,
  description: string,
  timezone: string,
  hostName: string,
  preferredTime: number[]
) {
  // TODO Send SQL to the DB
  return;
}

export function getMeetingInfo(id: number) {
  // TODO Find meeting info using the id
  return {
    id: id,
    title: "My meeting",
    description: "This meeting is only for testing..",
    timezone: "UTS",
    hostName: "Gavvin",
  };
}

export function createPreferredTime(
  meetingId: number,
  name: string,
  preferredTime: number[]
) {
  // TODO Send SQL query to insert preferred time data to the meeting
  return;
}

export function finalDecision(meetingId: number, decidedTime: number[]) {
  // TODO Send SQL query to the DB
  return;
}
