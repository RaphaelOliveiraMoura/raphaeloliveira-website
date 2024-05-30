import Image from "next/image";
import styles from "../styles/SocialMediaSection.module.css";

import { motion } from "framer-motion";

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            gap: 34,
            paddingLeft: 12,
          }}
        >
          <div>
            <motion.div
              className="box"
              animate={{
                scale: [1, 2, 1, 1],
                rotate: [0, 0, 180, 180, 0],
                borderRadius: ["50%", "10%", "50%", "10%", "50%"],
              }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                times: [0, 0.2, 0.5, 0.8, 1],
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />
          </div>
          <div>
            <h1>Raphael de Oliveira</h1>
            <h2>Software Engineer</h2>
          </div>
        </div>
        <hr />
      </main>
      <footer className={styles.footer} style={{ flex: 1}}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 26,
          }}
        >
          {[
            { src: "/techs/amazondynamodb.svg", alt: "Dynamo DB" },
            { src: "/techs/amazonwebservices.svg", alt: "Amazon Services" },
            { src: "/techs/docker.svg", alt: "Docker" },
            { src: "/techs/figma.svg", alt: "Figma" },
            { src: "/techs/javascript.svg", alt: "Javascript" },
            { src: "/techs/typescript.svg", alt: "Typescript" },
            { src: "/techs/nestjs.svg", alt: "NestJs" },
            { src: "/techs/nextdotjs.svg", alt: "Nextjs" },
            { src: "/techs/nodedotjs.svg", alt: "NodeJs" },
            { src: "/techs/postgresql.svg", alt: "PostgresDb" },
            { src: "/techs/react.svg", alt: "React" },
          ].map((item) => (
            <Image src={item.src} alt={item.alt} width="64" height="64" />
          ))}
        </div>
      </footer>
    </section>
  );
}
