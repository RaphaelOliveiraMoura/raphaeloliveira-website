import styles from "../styles/SocialMedia.module.css";

export default function SocialMediaCard({ children }) {
  return <article className={styles.container}>{children}</article>;
}
