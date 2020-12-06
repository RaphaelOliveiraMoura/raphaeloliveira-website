import Image from "next/image";
import styles from "../styles/SocialMediaSection.module.css";

import SocialMediaCard from "../components/SocialMediaCard";

export default function SocialMediaSection() {
  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <a
          href="https://github.com/RaphaelOliveiraMoura/raphaeloliveira-website"
          target="_blank"
        >
          <Image
            src="/github-icon.svg"
            alt="Github repository link icon"
            width="32"
            height="32"
          />
        </a>
        <hr />
      </header>
      <main className={styles.main}>
        <h1>Raphael de Oliveira</h1>
        <h2>Software Engineer</h2>
        <hr />
      </main>
      <footer className={styles.footer}>
        <SocialMediaCard
          href="https://www.linkedin.com/in/raphaeloliveiramoura/"
          iconPath="/linkedin-icon.svg"
          iconLabel="Linkedin social media icon"
          activeColor="#1C4D96"
        />
        <SocialMediaCard
          href="https://github.com/RaphaelOliveiraMoura"
          iconPath="/github-icon.svg"
          iconLabel="Github social media icon"
          activeColor="#000"
        />
        <SocialMediaCard
          href="mailto:raphaeldeoliveiramoura@gmail.com"
          iconPath="/gmail-icon.svg"
          iconLabel="Gmail social media icon"
          activeColor="#BC1E1E"
        />
      </footer>
    </section>
  );
}
