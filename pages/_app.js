import Head from "next/head";

import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Raphael Oliveira</title>
        <meta charSet="UTF-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="My personal website created with nextjs ❤️ Raphael Oliveira, Software Engineer"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
