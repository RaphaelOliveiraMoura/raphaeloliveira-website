import styles from "../styles/RecomendationsSection.module.css";

import RecomendationCard from "../components/RecomendationCard";
import Emoji from "../components/Emoji";

export default function RecomendationsSection() {
  return (
    <section className={styles.container}>
      <div>
        <h1>
          People & organizations who helped me&nbsp;
          <Emoji label="Emoji de uma mão">🤚</Emoji>
        </h1>
        <RecomendationCard
          imageSrc="/recomendations_branas.jpeg"
          title="Rodrigo Branas"
          description="Desenvolvedor e autor, conhecido por seus cursos e livros sobre programação. Seu canal no YouTube oferece uma vasta gama de conteúdos educativos sobre desenvolvimento de software."
        />
        <RecomendationCard
          imageSrc="/recomendations_elemar_jr.jpeg"
          title="Elemar Jr"
          description="Consultor e arquiteto de software, reconhecido por suas palestras e artigos que abordam arquitetura de software e desenvolvimento ágil. Seu trabalho contribui significativamente para a comunidade técnica."
          alignRight
        />
        <RecomendationCard
          imageSrc="/recomendations_fabio_akita.jpeg"
          title="Fábio Akita"
          description="Empresário e desenvolvedor, fundador da Codeminer 42. É conhecido por suas palestras e vídeos no YouTube onde discute temas avançados de desenvolvimento e cultura de engenharia de software."
        />
        <RecomendationCard
          imageSrc="/recomendations_manguinho.jpeg"
          title="Rodrigo Manguinho"
          description="Instrutor e desenvolvedor, conhecido por seus cursos na Udemy e seu canal no YouTube 'Mango Academy', onde compartilha conteúdos sobre desenvolvimento full stack e práticas de mercado."
          alignRight
        />
        <RecomendationCard
          imageSrc="/recomendations_filipe_deschamps.png"
          title="Filipe Deschamps"
          description="Engenheiro de software e youtuber, seu canal no YouTube é uma referência para desenvolvedores, oferecendo vídeos educativos e insights sobre a indústria de tecnologia e desenvolvimento de software."
        />
        <RecomendationCard
          imageSrc="/recomendations_erick_wendel.jpeg"
          title="Erick Wendel"
          description="Especialista em Node.js e desenvolvedor de software, é conhecido por suas palestras, cursos e tutoriais. Seu trabalho ajuda desenvolvedores a se aprofundarem no ecossistema JavaScript."
          alignRight

        />
        <RecomendationCard
          imageSrc="/recomendations_lucas_montano.jpeg"
          title="Lucas Montano"
          description="Desenvolvedor e criador de conteúdo, seu canal no YouTube aborda temas diversos de programação e desenvolvimento pessoal na carreira de tecnologia, sempre com um toque motivacional e didático."
        />
        <RecomendationCard
          imageSrc="/recomendations_mario_solto.png"
          title="Mario Solto"
          description="Instrutor na plataforma da Alura e youtuber. Seu canal (DevSoltinho) possui diversos vídeos que trazem vários insights sobre tecnologia com uma qualidade excepcional."
          alignRight

        />
        <RecomendationCard
          imageSrc="/recomendations_rocketseat.png"
          title="Rocketseat"
          description="Empresa de tecnologia do ramo educacional, oferece diversos cursos e conteúdos gratuitos no YouTube sobre programação. Focada em acelerar a carreira de desenvolvedores através de uma metodologia prática e imersiva."

        />
      </div>
    </section>
  );
}
