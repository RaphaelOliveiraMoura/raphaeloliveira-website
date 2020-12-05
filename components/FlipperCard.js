import React from "react";

import styles from "../styles/FlipperCard.module.css";

export default function SocialMediaCard({ children, className, href }) {
  const { front, back, onMouseOver, onMouseOut } = children();

  return (
    <a href={href}>
      <article
        className={styles.container}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
      >
        <div className={`${className} ${styles.flipper}`}>
          <div className={styles["flip-card-front"]}>{front}</div>
          <div className={styles["flip-card-back"]}>{back}</div>
        </div>
      </article>
    </a>
  );
}
