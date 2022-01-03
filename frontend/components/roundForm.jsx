import React from "react";
import { Form, Formik } from "formik";
import axios from "axios";
import WinnerRadio from "./winnerRadio";
import QualityRadio from "./qualityRadio";
import ThrowerRadio from "./throwerRadio";
import styles from "../styles/roundForm.module.css";

const RoundForm = ({ trigger, setTrigger }) => {
  return (
    <div className={styles.formContainer}>
      <Formik
        initialValues={{ winner: "", quality: "", thrower: "" }}
        onSubmit={async (
          { winner, quality, thrower },
          { setSubmitting, resetForm }
        ) => {
          await axios.post("http://localhost:8888/", {
            winner,
            quality,
            thrower,
          });
          setSubmitting(false);
          resetForm();
          setTrigger(!trigger);
        }}
      >
        <Form>
          <WinnerRadio />
          <QualityRadio />
          <ThrowerRadio />
          <button type="submit" className={styles.submitButton}>
            <p className={styles.submitText}>Submit Round</p>
          </button>
        </Form>
      </Formik>
    </div>
  );
};

export default RoundForm;
