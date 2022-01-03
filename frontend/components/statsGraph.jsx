import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";
import styles from "../styles/statsGraph.module.css";

const barData = [
  { dataKey: "雞糊", fill: "#85e085" },
  { dataKey: "一番", fill: "#5cd65c" },
  { dataKey: "两番", fill: "#33cc33" },
  { dataKey: "三番", fill: "#29a329" },
  { dataKey: "爆棚", fill: "#1f7a1f" },
];

const StatsGraph = ({ trigger }) => {
  const [statsData, setStatsData] = useState([
    { name: "Mom", 雞糊: 0, 一番: 0, 两番: 0, 三番: 0, 爆棚: 0 },
    { name: "Dad", 雞糊: 0, 一番: 0, 两番: 0, 三番: 0, 爆棚: 0 },
    { name: "Tiff", 雞糊: 0, 一番: 0, 两番: 0, 三番: 0, 爆棚: 0 },
    { name: "Chris", 雞糊: 0, 一番: 0, 两番: 0, 三番: 0, 爆棚: 0 },
  ]);
  useEffect(async () => {
    const statsDataRes = (await axios.get("http://localhost:8888/stats")).data;
    setStatsData(statsDataRes);
  }, [trigger]);

  return (
    <div className={styles.graphContainer}>
      <h3>Lifetime Stats</h3>
      <BarChart
        width={500}
        height={300}
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        barSize={50}
        data={statsData}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {barData.map(({ dataKey, fill }) => (
          <Bar stackId="stack" key={dataKey} dataKey={dataKey} fill={fill} />
        ))}
      </BarChart>
    </div>
  );
};

export default StatsGraph;
