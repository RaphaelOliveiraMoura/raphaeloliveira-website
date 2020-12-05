import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

import SocialMediaCard from "../components/SocialMediaCard";

export default function Home() {
  return (
    <>
      <Head>
        <title>Raphael Oliveira</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className={styles.header}>
        <Image
          src="/github-icon.svg"
          alt="Github icon"
          width="32"
          height="32"
        />
        <hr />
      </header>
      <main className={styles.main}>
        <h1>Raphael de Oliveira</h1>
        <h2>Software Engineer</h2>
        <hr />
      </main>
      <footer className={styles.footer}>
        <SocialMediaCard
          href=""
          iconPath="/linkedin-icon.svg"
          iconLabel="Linkedin icon"
          activeColor="#1C4D96"
        />
        <SocialMediaCard
          href=""
          iconPath="/github-icon.svg"
          iconLabel="Github icon"
          activeColor="#000"
        />
        <SocialMediaCard
          href=""
          iconPath="/gmail-icon.svg"
          iconLabel="Gmail icon"
          activeColor="#BC1E1E"
        />
      </footer>
    </>
  );
}
