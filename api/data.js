export default function handler(req, res) {
  res.status(200).json({
    weeklyListening: [20, 35, 50, 65, 80, 95, 110],
    freeToPremium: [8, 10, 14, 19, 24, 28, 32],
    regions: { France: 10, Netherlands: 10, Germany: 10, UK: 31, US: 14 },
    campaignData: {
      versionA: { conversions: 360, users: 1000 },
      versionB: { conversions: 460, users: 1000 },
      audiobooksPlus: { conversions: 180, users: 800 },
    },
  });
}