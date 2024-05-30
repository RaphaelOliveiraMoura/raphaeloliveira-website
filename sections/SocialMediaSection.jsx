import Image from "next/image";
import styles from "../styles/SocialMediaSection.module.css";

import SocialMediaCard from "../components/SocialMediaCard";

export default function SocialMediaSection() {
  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a
            href="https://github.com/RaphaelOliveiraMoura/raphaeloliveira-website"
            target="_blank"
          >
            <Image
              src="/github-icon.svg"
              alt="Github repository link icon"
              width="42"
              height="42"
            />
          </a>
          <a
            href="https://www.linkedin.com/in/raphaeloliveiramoura/"
            target="_blank"
          >
            <Image
              src="/linkedin-icon.svg"
              alt="Linkedin social media icon"
              width="48"
              height="48"
            />
          </a>
        </div>

        <hr />
      </header>
      <main className={styles.main}>
        <h1>Raphael de Oliveira</h1>
        <h2>Software Engineer</h2>
        <hr />
      </main>
      <footer className={styles.footer}>
        
      </footer>
    </section>
  );
}
