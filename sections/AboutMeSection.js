import Image from "next/image";

import styles from "../styles/AboutMeSection.module.css";

import Emoji from "../components/Emoji";

export default function AboutMeSection() {
  const birthDate = "1999/08/26";
  const age = new Date().getFullYear() - new Date(birthDate).getFullYear();

  return (
    <div className={styles.container}>
      <div>
        <h1>
          About me <Emoji label="Emoji de nuvem">💭</Emoji>
        </h1>
        <div>
          <Image
            alt="Imagem de perfil pessoal"
            src="/profile.jpeg"
            width="200"
            height="200"
          />
        </div>
        <main>
          <p>
            Me chamo <strong>Raphael de Oliveira Moura</strong>, sou&nbsp;
            <strong>desenvolvedor de softwares</strong>&nbsp;
            <Emoji label="Emoji de um computador">🖥️</Emoji> aqui no estado de
            Minas Gerais, sou formado como&nbsp;
            <strong>técnico de informática</strong>&nbsp; pelo&nbsp;
            <strong>CEFET-MG</strong> e atualmente estou cursando&nbsp;
            <strong>Sistemas de Informação</strong> pela universidade&nbsp;
            <strong>UNA Contagem</strong>&nbsp;
            <Emoji label="Emoji de um chapéu de formatura">🎓</Emoji>
          </p>
          <p>
            Curto bastante tecnologia e&nbsp;
            <strong>desenvolvimento de sistemas</strong>, tenho {age} anos e
            sempre estou buscando me aperfeiçoar e aprofundar nesse mundo de
            dev. Sou apaixonado por <strong>testes automatizados</strong>&nbsp;
            <Emoji label="Emoji de um coração">💜</Emoji>
          </p>
          <p>
            Hoje estou atuando principalmente com desenvolvimento voltado
            para&nbsp;<strong>web</strong>, e estudando sobre&nbsp;
            <strong>clean code</strong> e&nbsp;
            <strong>arquitetura de software</strong>&nbsp;
            <Emoji label="Emoji de um coração">✍</Emoji>
          </p>
        </main>
      </div>
    </div>
  );
}
