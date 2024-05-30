import Image from "next/image";

import styles from "../styles/AboutMeSection.module.css";

import Emoji from "../components/Emoji";

export default function AboutMeSection() {
  const birthDate = "1999/08/26";
  const age = new Date().getFullYear() - new Date(birthDate).getFullYear();

  return (
    <section className={styles.container}>
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
            Me chamo Raphael de Oliveira Moura, sou desenvolvedor de softwares
            formado em Sistemas de Informação pela universidade UNA Contagem e
            técnico de informática pelo CEFET-MG
          </p>
          <p>
            Com +5 anos de experiência em desenvolvimento de software,
            possuo uma profunda compreensão das melhores práticas e tendências
            do setor. Além disso, sou capaz de liderar equipes de
            desenvolvedores e garantir a entrega de projetos de alta qualidade.
          </p>
          <p>
            Meu objetivo é continuar aprendendo e aplicando tecnologias
            inovadoras para resolver desafios complexos e alcançar resultados
            excepcionais para meus clientes e equipe. Tenho como um de meus
            objetivos aprimorar minhas habilidades de impactar positivamente
            outras pessoas.
          </p>
        </main>
      </div>
    </section>
  );
}
