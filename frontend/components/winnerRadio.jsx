import React from "react";
import { Field } from "formik";
import styles from "../styles/winnerRadio.module.css";

const winners = ["mom", "dad", "tiff", "chris"];

const WinnerRadio = () => {
  return (
    <div>
      <p className={styles.winnerHeader}>Winner</p>
      <div className={styles.winnerContainer}>
        {winners.map((winner) => (
          <div className={styles.labelContainer} key={`winner-${winner}`}>
            <Field type="radio" name="winner" value={winner} />
            <p className={styles.labelText}>{winner}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WinnerRadio;
