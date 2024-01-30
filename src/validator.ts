export function validateCreateMeetingInput(
  title: string,
  timezone: string,
  meetingLength: number,
  hostName: string,
  hostPassword: string,
  preferredTime: string
) {
  let regexForTitle: RegExp = /^[A-Za-z0-9 ]{3,200}$/;
  if (!regexForTitle.test(title)) {
    return false;
  }

  let regexForTime: RegExp = /^[A-Z]{3,7}$/;
  if (!regexForTime.test(timezone)) {
    return false;
  }

  if (meetingLength < 30 || meetingLength > 1440) {
    return false;
  }

  let regexForName: RegExp = /^[A-Za-z0-9]{2,50}$/;
  if (!regexForName.test(hostName)) {
    return false;
  }

  let regexForPassword: RegExp = /^[0-9]{4,8}$/;
  if (!regexForPassword.test(hostPassword)) {
    return false;
  }

  let regexForPreferred: RegExp = /^[0-9,]+$/;
  if (!regexForPreferred.test(preferredTime)) {
    return false;
  }

  return true;
}

export function validatePreferredTimeInput(guestName: string, preferredTime: string) {
  let regexForName: RegExp = /^[A-Za-z0-9]{2,50}$/;
  if (!regexForName.test(guestName)) {
    return false;
  }

  let regexForPreferred: RegExp = /^[0-9,]+$/;
  if (!regexForPreferred.test(preferredTime)) {
    return false;
  }

  return true;
}

export function validateChangeMeetingInput(
  title: string,
  timezone: string,
  meetingLength: number,
  hostName: string,
  preferredTime: string
) {
  let regexForTitle: RegExp = /^[A-Za-z0-9 ]{3,200}$/;
  if (!regexForTitle.test(title)) {
    return false;
  }

  let regexForTime: RegExp = /^[A-Z]{3,7}$/;
  if (!regexForTime.test(timezone)) {
    return false;
  }

  if (meetingLength < 30 || meetingLength > 1440) {
    return false;
  }

  let regexForName: RegExp = /^[A-Za-z0-9]{2,50}$/;
  if (!regexForName.test(hostName)) {
    return false;
  }

  let regexForPreferred: RegExp = /^[0-9,]+$/;
  if (!regexForPreferred.test(preferredTime)) {
    return false;
  }

  return true;
}

export function validateHostLogintInput(hostName: string, hostPassword: string) {
  let regexForName: RegExp = /^[A-Za-z0-9]{2,50}$/;
  if (!regexForName.test(hostName)) {
    return false;
  }

  let regexForPassword: RegExp = /^[0-9]{4,8}$/;
  if (!regexForPassword.test(hostPassword)) {
    return false;
  }

  return true;
}
