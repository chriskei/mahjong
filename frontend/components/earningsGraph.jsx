import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  ReferenceLine,
} from "recharts";
import styles from "../styles/earningsGraph.module.css";

const lineData = [
  { dataKey: "momEarnings", name: "Mom", stroke: "#ff8000" },
  { dataKey: "dadEarnings", name: "Dad", stroke: "#005ce6" },
  { dataKey: "tiffEarnings", name: "Tiff", stroke: "#bb99ff" },
  { dataKey: "chrisEarnings", name: "Chris", stroke: "#e30000" },
];

const EarningsGraph = ({ trigger }) => {
  const [earningsData, setEarningsData] = useState([
    {
      date: "",
      roundNum: 0,
      momEarnings: 0,
      dadEarnings: 0,
      tiffEarnings: 0,
      chrisEarnings: 0,
    },
  ]);
  const [absLimit, setAbsLimit] = useState(0);

  useEffect(async () => {
    const earningsDataRes = (await axios.get("http://localhost:8888/earnings"))
      .data;
    const earningsDataWithLabels = earningsDataRes.map(
      ({
        date,
        roundNum,
        momEarnings,
        dadEarnings,
        tiffEarnings,
        chrisEarnings,
      }) => ({
        label: `${date.substring(8, 10)}.${roundNum}`,
        momEarnings,
        dadEarnings,
        tiffEarnings,
        chrisEarnings,
      })
    );
    setEarningsData(earningsDataWithLabels);

    // Determine max abs value to center zero line
    let tempAbsLimit = 0;
    for (const earningsData of earningsDataRes) {
      for (const key in earningsData) {
        if (key !== "date" && key !== "roundNum") {
          const singleEarnings = Math.abs(earningsData[key]);
          if (singleEarnings > tempAbsLimit) {
            tempAbsLimit = singleEarnings;
          }
        }
      }
    }
    setAbsLimit(tempAbsLimit);
  }, [trigger]);

  return (
    <div className={styles.graphContainer}>
      <h3>Lifetime Earnings</h3>
      <LineChart
        width={500}
        height={300}
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        data={earningsData}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis
          domain={[-absLimit, absLimit]}
          ticks={[-absLimit, 0, absLimit]}
          tickFormatter={(tick) => "$ " + tick}
        />
        <Tooltip />
        <Legend />
        {lineData.map(({ dataKey, name, stroke }) => (
          <Line
            type="natural"
            dot={false}
            strokeWidth={3}
            key={name}
            dataKey={dataKey}
            name={name}
            stroke={stroke}
          />
        ))}
        <ReferenceLine y="0" stroke="#aaaaaa" />
      </LineChart>
    </div>
  );
};

export default EarningsGraph;
