import React, { useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import RoundForm from "../components/roundForm";
import styles from "../styles/Home.module.css";

// Prevent Next from erroring about Recharts ids differing
const DynamicEarningsGraph = dynamic(
  () => import("../components/earningsGraph"),
  { ssr: false }
);
const DynamicDailyEarningsGraph = dynamic(
  () => import("../components/dailyEarningsGraph"),
  { ssr: false }
);
const DynamicStatsGraph = dynamic(() => import("../components/statsGraph"), {
  ssr: false,
});

export default function Home() {
  const [trigger, setTrigger] = useState(false);

  return (
    <div className={styles.container}>
      <Head>
        <title>PONG PONG WU</title>
        <meta
          name="description"
          content="Small web-app to track family mahjong winnings and statistics."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.graphContainer}>
          <DynamicEarningsGraph trigger={trigger} />
          <DynamicDailyEarningsGraph trigger={trigger} />
        </div>
        <div className={styles.graphContainer}>
          <RoundForm trigger={trigger} setTrigger={setTrigger} />
          <DynamicStatsGraph trigger={trigger} />
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://chriskei.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Chris Kei, 2021
        </a>
      </footer>
    </div>
  );
}
