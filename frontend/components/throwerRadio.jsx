import React from "react";
import { Field } from "formik";
import styles from "../styles/throwerRadio.module.css";

const throwers = ["mom", "dad", "tiff", "chris", "自摸"];

const ThrowerRadio = () => {
  return (
    <div>
      <p className={styles.throwerHeader}>Thrower</p>
      <div className={styles.throwerContainer}>
        {throwers.map((thrower) => (
          <div className={styles.labelContainer} key={`thrower-${thrower}`}>
            <Field type="radio" name="thrower" value={thrower} />
            <p className={styles.labelText}>{thrower}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThrowerRadio;
