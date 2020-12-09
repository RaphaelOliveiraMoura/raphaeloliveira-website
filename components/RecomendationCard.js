import styles from "../styles/RecomendationCard.module.css";

export default function Recomendation({
  imageSrc,
  title,
  description,
  alignRight = false,
}) {
  const containerStyles = alignRight
    ? [styles.container, styles["align-right"]].join(" ")
    : styles.container;

  return (
    <article className={containerStyles}>
      <img src={imageSrc} alt={title} />
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </article>
  );
}
