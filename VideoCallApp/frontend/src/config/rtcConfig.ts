export const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    {
      urls: "turn:in.relay.metered.ca:80",
      username: import.meta.env.VITE_TURN_USERNAME || "b42da29201cf149bcd63bb44",
      credential: import.meta.env.VITE_TURN_CREDENTIAL || "ATmIroK5eNTrT6Ae",
    },
    {
      urls: "turn:in.relay.metered.ca:443",
      username: import.meta.env.VITE_TURN_USERNAME || "b42da29201cf149bcd63bb44",
      credential: import.meta.env.VITE_TURN_CREDENTIAL || "ATmIroK5eNTrT6Ae",
    },
    {
      urls: "turns:in.relay.metered.ca:443?transport=tcp",
      username: import.meta.env.VITE_TURN_USERNAME || "b42da29201cf149bcd63bb44",
      credential: import.meta.env.VITE_TURN_CREDENTIAL || "ATmIroK5eNTrT6Ae",
    },
    {
      urls: "stun:stun.relay.metered.ca:80",
    },
    {
      urls: ["turn:openrelay.metered.ca:80", "turn:openrelay.metered.ca:443"],
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: ["turn:numb.viagenie.ca:3478", "turn:numb.viagenie.ca:3478?transport=tcp"],
      credential: "muazkh",
      username: "webrtc@live.com",
    },
  ],
  iceCandidatePoolSize: 10,
  iceTransportPolicy: "all",
  bundlePolicy: "max-bundle",
  rtcpMuxPolicy: "require",
};
