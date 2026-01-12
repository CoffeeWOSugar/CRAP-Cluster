export function isValidSSH(value) {
  if (typeof value !== "string") return false;

  const trimmed = value.trim();

  // user@ip
  const regex =
    /^[a-zA-Z0-9._-]+@((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;

  return regex.test(trimmed);
}