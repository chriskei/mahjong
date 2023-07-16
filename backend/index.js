require("dotenv").config();
const express = require("express");
const app = express();
const mysql = require("mysql2/promise");
// const { google } = require("googleapis");

// Constants
let connection;
const port = 8888;
const nameToIndex = {
  mom: 0,
  dad: 1,
  tiff: 2,
  chris: 3,
  自摸: 4,
};
const qualityToChinese = {
  0: "雞糊",
  1: "一番",
  2: "两番",
  3: "三番",
  4: "爆棚",
};

// Enable CORS
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});

// Use JSON parser
app.use(express.json());

// Send match data to Google Forms
app.post("/", async (req, res) => {
  const { winner, quality, thrower } = req.body;
  let baseMoney = 0.25;
  let winnerMultiplier = 4;
  let throwerMultiplier = 2;

  // Lookup which position in the final data array the player's earnings should be in
  // If 自摸, the thrower index will not get hit
  const winnerIndex = nameToIndex[winner];
  const throwerIndex = nameToIndex[thrower];

  // If 自摸, double base money and set winner multiplier to three
  if (throwerIndex === 4) {
    baseMoney *= 2;
    winnerMultiplier = 3;
  }

  switch (quality) {
    // 雞糊
    case "0":
      winnerMultiplier = 3;
      throwerMultiplier = 1;
      break;
    // 一番
    case "1":
      break;
    // 两番
    case "2":
      baseMoney *= 2;
      break;
    // 三番
    case "3":
      baseMoney *= 4;
      break;
    // 爆棚
    case "4":
      baseMoney *= 8;
      break;
  }

  // Update each player's earnings
  const indexToEarnings = [];
  for (let i = 0; i < 4; i++) {
    if (i === winnerIndex) {
      indexToEarnings.push(baseMoney * winnerMultiplier);
    } else if (i === throwerIndex) {
      indexToEarnings.push(-baseMoney * throwerMultiplier);
    } else {
      indexToEarnings.push(-baseMoney);
    }
  }
  await connection.query("CALL mahjong.addEarnings2(?, ?, ?, ?);", indexToEarnings);
  await connection.query("CALL mahjong.addStats2(?, ?);", [winner, quality]);
  console.log(`Sent data to MySQL: ${indexToEarnings}`);

  // Backup to google sheets after refreshing OAuth credentials
  // const oauth2Client = new google.auth.OAuth2(
  //   process.env.OAUTH_CLIENT_ID,
  //   process.env.OAUTH_CLIENT_SECRET
  // );
  // oauth2Client.setCredentials({
  //   refresh_token: process.env.OAUTH_REFRESH_TOKEN,
  // });
  // oauth2Client.refreshAccessToken(async (err, tokens) => {
  //   if (err) {
  //     console.error(err);
  //   } else {
  //     oauth2Client.setCredentials({
  //       access_token: tokens.access_token,
  //     });

  //     // Get round number using readEarnings
  //     const readEarningsRes = await connection.query("CALL readEarnings();");
  //     const readEarningsArr = readEarningsRes[0][0];
  //     const roundNum = readEarningsArr.length - 1;

  //     // Date doesn't have to sync perfectly, just for our own viewing
  //     const dateRoundNumIndexToEarnings = [
  //       new Date().toISOString(),
  //       roundNum,
  //       ...indexToEarnings,
  //     ];

  //     // Google API authentication
  //     const sheets = google.sheets({
  //       version: "v4",
  //       auth: process.env.GOOGLE_API_AUTH,
  //     });

  //     sheets.spreadsheets.values.append({
  //       spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
  //       range: "Sheet1",
  //       valueInputOption: "RAW",
  //       insertDataOption: "INSERT_ROWS",
  //       resource: {
  //         values: [dateRoundNumIndexToEarnings],
  //       },
  //       auth: oauth2Client,
  //     });
  //     console.log(`Sent data to Google Sheets: ${dateRoundNumIndexToEarnings}`);
  //   }
  // });

  res.send("POST to endpoint / complete.");
});

// Get overall earnings data
app.get("/earnings", async (_req, res) => {
  const readEarningsRes = await connection.query("CALL mahjong.readEarnings2();");
  const readEarningsArr = readEarningsRes[0][0];
  const allEarningsData = [];

  for (let i = 0; i < readEarningsArr.length; i++) {
    let {
      date,
      roundNum,
      momEarnings,
      dadEarnings,
      tiffEarnings,
      chrisEarnings,
    } = readEarningsArr[i];

    // Current earnings point accounts for all previous rounds
    if (i > 0) {
      const prevIndex = i - 1;
      const prevEarningsData = allEarningsData[prevIndex];

      momEarnings += prevEarningsData.momEarnings;
      dadEarnings += prevEarningsData.dadEarnings;
      tiffEarnings += prevEarningsData.tiffEarnings;
      chrisEarnings += prevEarningsData.chrisEarnings;
    }

    const currEarningsData = {
      date,
      roundNum,
      momEarnings,
      dadEarnings,
      tiffEarnings,
      chrisEarnings,
    };
    allEarningsData.push(currEarningsData);
  }

  const finalEarningsData = allEarningsData[allEarningsData.length - 1];
  console.log(
    `Got lifetime earnings data ending with round ${finalEarningsData?.roundNum}.`
  );
  res.send(allEarningsData);
});

// Get daily earnings data
app.get("/dailyEarnings", async (_req, res) => {
  const readEarningsRes = await connection.query("CALL mahjong.readEarnings2();");
  const readEarningsArr = readEarningsRes[0][0];
  const allEarningsData = [];

  // Get last date so we know what date we are looking at
  const lastEarningsDatapoint = readEarningsArr[readEarningsArr.length - 1];
  const lastDate = lastEarningsDatapoint.date.substring(0, 10);
  const earningsDataForDate = readEarningsArr.filter(
    ({ date }) => date.substring(0, 10) === lastDate
  );

  // Get first of these dates so we can start round numbers at one
  const firstEarningsDatapoint = earningsDataForDate[0];
  const firstRoundNum = firstEarningsDatapoint.roundNum - 1;
  const earningsDataWithLabels = earningsDataForDate.map(
    ({
      date,
      roundNum,
      momEarnings,
      dadEarnings,
      tiffEarnings,
      chrisEarnings,
    }) => ({
      date: date.substring(0, 10),
      roundNum: roundNum - firstRoundNum,
      momEarnings,
      dadEarnings,
      tiffEarnings,
      chrisEarnings,
    })
  );

  // Add one more datapoint to start everyone at zero for the day
  earningsDataWithLabels.unshift({
    date: lastDate,
    roundNum: 0,
    momEarnings: 0,
    dadEarnings: 0,
    tiffEarnings: 0,
    chrisEarnings: 0,
  });

  for (let i = 0; i < earningsDataWithLabels.length; i++) {
    let {
      date,
      roundNum,
      momEarnings,
      dadEarnings,
      tiffEarnings,
      chrisEarnings,
    } = earningsDataWithLabels[i];

    // Current earnings point accounts for all previous rounds
    if (i > 0) {
      const prevIndex = i - 1;
      const prevEarningsData = allEarningsData[prevIndex];

      momEarnings += prevEarningsData.momEarnings;
      dadEarnings += prevEarningsData.dadEarnings;
      tiffEarnings += prevEarningsData.tiffEarnings;
      chrisEarnings += prevEarningsData.chrisEarnings;
    }

    const currEarningsData = {
      date,
      roundNum,
      momEarnings,
      dadEarnings,
      tiffEarnings,
      chrisEarnings,
    };
    allEarningsData.push(currEarningsData);
  }

  const finalEarningsData = allEarningsData[allEarningsData.length - 1];
  console.log(
    `Got daily earnings data ending with round ${finalEarningsData?.roundNum}.`
  );
  res.send(allEarningsData);
});

// Get overall statistics
app.get("/stats", async (_req, res) => {
  const readStatsRes = await connection.query("CALL mahjong.readStats2();");
  const readStatsArr = readStatsRes[0][0];
  const numStats = readStatsArr.length;
  const allStatsData = [
    { name: "Mom", 雞糊: 0, 一番: 0, 两番: 0, 三番: 0, 爆棚: 0 },
    { name: "Dad", 雞糊: 0, 一番: 0, 两番: 0, 三番: 0, 爆棚: 0 },
    { name: "Tiff", 雞糊: 0, 一番: 0, 两番: 0, 三番: 0, 爆棚: 0 },
    { name: "Chris", 雞糊: 0, 一番: 0, 两番: 0, 三番: 0, 爆棚: 0 },
  ];

  let counts = [0, 0, 0, 0];
  for (const { name, quality } of readStatsArr) {
    const wantedIndex = nameToIndex[name];
    const wantedQuality = qualityToChinese[quality];

    allStatsData[wantedIndex][wantedQuality]++;
    counts[wantedIndex]++;
  }

  // Use counts to append win percentage to each player's name
  const allStatsDataWithPercent = allStatsData.map(
    ({ name, ...stats }, index) => ({
      name: `${name}: ${((counts[index] / numStats).toFixed(2) * 100).toFixed(
        0
      )}%`,
      ...stats,
    })
  );

  console.log(`Got all ${numStats} stats datapoints.`);
  res.send(allStatsDataWithPercent);
});

// Start the server on port 8888
app.listen(port, async () => {
  try {
    connection = await mysql.createConnection({
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: "root", // process.env.MYSQL_PASSWORD,
      multipleStatements: true,
    });
    console.log("Mahjong backend and MySQL connection are good to go.");
  } catch (err) {
    console.log("Error connecting to MySQL:");
    console.log(err);
  }
});
