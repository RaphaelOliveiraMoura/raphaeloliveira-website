import React from "react";
import Image from "next/image";

import FlipperCard from "./FlipperCard";
import styles from "../styles/SocialMediaCard.module.css";

export default function SocialMediaCard({
  href,
  iconPath,
  iconLabel,
  activeColor,
}) {
  const [isHovered, setHover] = React.useState(false);

  const flipperCardStyles = isHovered
    ? `${styles.card} ${styles["card-hovered"]}`
    : styles.card;

  return (
    <FlipperCard href={href} className={flipperCardStyles}>
      {() => ({
        onMouseOver: () => setHover(true),
        onMouseOut: () => setHover(false),
        front: (
          <div>
            <Image src={iconPath} alt={iconLabel} width="64" height="64" />
          </div>
        ),
        back: (
          <div
            className={styles["card-content"]}
            style={{ background: activeColor }}
          >
            <Image src={iconPath} alt={iconLabel} width="64" height="64" />
          </div>
        ),
      })}
    </FlipperCard>
  );
}
