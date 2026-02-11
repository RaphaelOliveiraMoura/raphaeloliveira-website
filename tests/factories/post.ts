import { factory } from "./factory";

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  published: boolean;
  createdAt: string;
}

export const postFactory = factory<Post>(() => ({
  id: crypto.randomUUID(),
  title: "Post de exemplo",
  content: "Conteúdo do post de exemplo.",
  authorId: crypto.randomUUID(),
  published: false,
  createdAt: new Date().toISOString(),
}));
