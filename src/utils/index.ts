// tcpipErrors.ts
interface TcpIpError {
  code: string;
  match: RegExp;
  message: string;
}

const tcpIpErrors: TcpIpError[] = [
  {
    code: "MORE_THAN_ONE_DEVICE",
    match: /more than one device\/emulator/i,
    message:
      "Multiple devices connected. Please select the device you want to connect.",
  },
  {
    code: "DEVICE_NOT_FOUND",
    match: /device .* not found/i,
    message:
      "The selected device is not found. Check the connection and try again.",
  },
  {
    code: "DEVICE_OFFLINE",
    match: /device offline/i,
    message: "The device is offline. Please reconnect it or restart ADB.",
  },
  {
    code: "INSUFFICIENT_PERMISSIONS",
    match: /insufficient permissions/i,
    message:
      "Insufficient permissions to access the device. Please check your system settings.",
  },
  {
    code: "PROTOCOL_FAULT",
    match: /protocol fault/i,
    message: "ADB encountered a protocol error. Try restarting the ADB server.",
  },
  {
    code: "NO_ROUTE_TO_HOST",
    match: /no route to host/i,
    message:
      "Cannot reach the device over the network. Make sure both devices are on the same Wi-Fi.",
  },
  {
    code: "CONNECTION_REFUSED",
    match: /connection refused/i,
    message:
      "The device refused the connection. Make sure TCP/IP mode is enabled on the device.",
  },
  {
    code: "CONNECTION_TIMEOUT",
    match: /connection timed out/i,
    message:
      "The connection attempt timed out. Check your network and try again.",
  },
  {
    code: "AUTHENTICATION_FAILED",
    match: /failed to authenticate/i,
    message:
      "Authentication failed. Accept the ADB pairing prompt on the device.",
  },
];

/**
 * Maps ADB TCP/IP error output to a friendly UI message.
 * @param stderrOutput - The stderr string from adb command
 * @returns User-friendly error message or a default message
 */
export function getTcpIpErrorMessage(stderrOutput: string): string {
  const error = tcpIpErrors.find((e) => e.match.test(stderrOutput));
  return error
    ? error.message
    : "An unknown error occurred while connecting via TCP/IP.";
}
