"use client";

import { useEffect } from "react";

/**
 * Captura erros que ocorrem fora do root layout.
 * Precisa incluir <html> e <body> pois substitui o layout inteiro.
 * Nao utiliza componentes internos (podem estar indisponiveis).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          padding: "1rem",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Algo deu errado</h1>
        <p
          style={{
            maxWidth: "24rem",
            textAlign: "center",
            fontSize: "0.875rem",
            color: "#666",
          }}
        >
          Ocorreu um erro critico na aplicacao. Tente recarregar a pagina.
        </p>
        <button
          onClick={reset}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            backgroundColor: "#000",
            color: "#fff",
            fontSize: "0.875rem",
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
          }}
        >
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
