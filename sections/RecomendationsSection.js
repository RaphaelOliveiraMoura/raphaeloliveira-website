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
          imageSrc="/recomendations_filipe_deschamps.png"
          title="Filipe Deschamps"
          description="Sempre trazendo contéudo com altíssima qualidade no youtube. Contéudo de tecnologia voltado para qualquer público independente da experiência."
        />
        <RecomendationCard
          imageSrc="/recomendations_rocketseat.png"
          title="Rocketseat"
          description="Empresa de tecnologia do ramo educacional, possui diversos cursos e conteúdos gratuítos no youtube sobre programação. "
          alignRight
        />
        <RecomendationCard
          imageSrc="/recomendations_mario_solto.png"
          title="Mario Solto"
          description="Instrutor na plataforma da Alura e youtuber. Seu canal (DevSoltinho) possui diversos vídeos que trazem vários Insigths sobre tecnologia e com uma qualidade excepcional."
        />
      </div>
    </section>
  );
}
