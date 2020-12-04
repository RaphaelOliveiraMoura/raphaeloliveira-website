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
        <SocialMediaCard>
          <Image
            src="/linkedin-icon.svg"
            alt="Linkedin icon"
            width="80"
            height="80"
          />
        </SocialMediaCard>
        <SocialMediaCard>
          <Image
            src="/github-icon.svg"
            alt="Github icon"
            width="80"
            height="80"
          />
        </SocialMediaCard>
        <SocialMediaCard>
          <Image
            src="/gmail-icon.svg"
            alt="Gmail icon"
            width="80"
            height="80"
          />
        </SocialMediaCard>
      </footer>
    </>
  );
}
