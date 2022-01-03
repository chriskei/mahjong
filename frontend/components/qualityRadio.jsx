import React from "react";
import { Field } from "formik";
import styles from "../styles/qualityRadio.module.css";

const qualities = ["雞糊", "一番", "两番", "三番", "爆棚"];

const QualityRadio = () => {
  return (
    <div>
      <p className={styles.qualityHeader}>Quality</p>
      <div className={styles.qualityContainer}>
        {qualities.map((quality, index) => (
          <div className={styles.labelContainer} key={`quality-${quality}`}>
            <Field type="radio" name="quality" value={index.toString()} />
            <p className={styles.labelText}>{quality}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QualityRadio;
