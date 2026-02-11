# Hooks & Utilitarios

> **Status:** `rascunho`
> **Prioridade:** `alta`
> **Ultima atualizacao:** 2026-02-11

## Resumo

Biblioteca de hooks customizados e wrappers de storage para o Core Stack. Inclui 16 hooks para debounce, throttle, media queries, storage tipado, clipboard, click outside, intersection observer, keyboard shortcuts, toggle, status de rede, dimensões da janela, scroll e event listeners. Também cobre wrappers para localStorage (com expiração), sessionStorage, cookies e padrão de cookie consent banner em conformidade com LGPD.

## Motivacao

Projetos Next.js frequentemente precisam de hooks reutilizáveis para UX (debounce em buscas, media query para responsividade, clipboard), mas cada equipe reimplementa soluções. O Core Stack deve oferecer uma base testada e SSR-safe para acelerar desenvolvimento. Storage (localStorage, cookies) é acessível apenas no cliente—wrappers tipados com fallback evitam erros de hidratação e melhoram DX.

## Requisitos Funcionais

- **RF01:** `useDebounce(value, delay)` — retorna valor debounced, útil para buscas e inputs
- **RF02:** `useThrottle(callback, delay)` — retorna callback throttled para scroll/resize
- **RF03:** `useMediaQuery(query)` — retorna `boolean` indicando match da media query
- **RF04:** `useLocalStorage(key, initialValue)` — valor tipado com suporte SSR (undefined até hydration)
- **RF05:** `useSessionStorage(key, initialValue)` — idem para sessionStorage
- **RF06:** `useClipboard()` — `{ copy, copied, error }` para copy-to-clipboard com estado de sucesso
- **RF07:** `useOnClickOutside(ref, handler)` — detecta cliques fora do elemento referenciado
- **RF08:** `useIntersectionObserver(ref, options)` — observa visibilidade do elemento
- **RF09:** `useKeyboardShortcut(keys, callback)` — registra hotkeys (ex: `ctrl+k`, `escape`)
- **RF10:** `usePrevious(value)` — retorna valor da renderização anterior
- **RF11:** `useToggle(initialValue)` — toggle booleano com `[value, toggle, setTrue, setFalse]`
- **RF12:** `useOnlineStatus()` — retorna `boolean` indicando status da rede
- **RF13:** `useWindowSize()` — `{ width, height }` das dimensões do viewport
- **RF14:** `useScrollPosition()` — posição de scroll (x, y) ou elemento específico
- **RF15:** `useEventListener(event, handler, element)` — event listener tipado com cleanup
- **RF16:** Wrapper localStorage com suporte a expiração (TTL)
- **RF17:** Utilitários de sessionStorage tipados
- **RF18:** Cookie management: `get`, `set`, `delete`, `parse` com tipagem
- **RF19:** Cookie consent banner em conformidade com LGPD (Lei Geral de Protecao de Dados). Categorias: essenciais (sempre ativos), analytics (opt-in), marketing (opt-in).

## Requisitos Nao-Funcionais

- **RNF01:** Hooks devem ser SSR-safe — sem acesso a `window`, `document` ou storage durante SSR
- **RNF02:** TypeScript estrito — tipos genéricos onde aplicável (localStorage, sessionStorage)
- **RNF03:** Cleanup adequado — remover event listeners e subscriptions no unmount
- **RNF04:** Sem dependências pesadas — priorizar implementação própria ou libs mínimas

## Design da API / Interface

### Hooks de Utilidade

```tsx
// useDebounce - atrasa atualização do valor
import { useDebounce } from '@/hooks/useDebounce';

function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) fetchSearch(debouncedQuery);
  }, [debouncedQuery]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}

// useThrottle - limita frequência de execução
import { useThrottle } from '@/hooks/useThrottle';

function ScrollLogger() {
  const handleScroll = useThrottle(() => {
    console.log('scroll', window.scrollY);
  }, 100);

  useEventListener('scroll', handleScroll, window);
}

// useMediaQuery - breakpoint responsive
import { useMediaQuery } from '@/hooks/useMediaQuery';

function ResponsiveNav() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return isMobile ? <MobileNav /> : <DesktopNav />;
}

// useLocalStorage - persistência tipada com SSR safety
import { useLocalStorage } from '@/hooks/useLocalStorage';

function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  return <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>{theme}</button>;
}

// useClipboard
import { useClipboard } from '@/hooks/useClipboard';

function CopyButton({ text }: { text: string }) {
  const { copy, copied } = useClipboard();
  return (
    <button onClick={() => copy(text)}>
      {copied ? 'Copiado!' : 'Copiar'}
    </button>
  );
}

// useOnClickOutside - fechar modal/dropdown
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

function Dropdown() {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useOnClickOutside(ref, () => setOpen(false));
  return <div ref={ref}>...</div>;
}

// useIntersectionObserver - lazy load, infinite scroll
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

function LazyImage({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { isIntersecting } = useIntersectionObserver(ref, { threshold: 0.1 });
  return isIntersecting ? <img src={src} /> : <div ref={ref} style={{ minHeight: 200 }} />;
}

// useKeyboardShortcut
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

function CommandPalette() {
  const [open, setOpen] = useState(false);
  useKeyboardShortcut('ctrl+k', (e) => { e.preventDefault(); setOpen(true); });
  useKeyboardShortcut('escape', () => setOpen(false));
}

// useToggle - retorna [value, toggle, setTrue, setFalse]
import { useToggle } from '@/hooks/useToggle';

function Accordion() {
  const [isOpen, toggle, setTrue, setFalse] = useToggle(false)
  // Ou desestruture com nomes customizados:
  const [expanded, toggleExpanded, expand, collapse] = useToggle(false)
  return <div onClick={toggleExpanded}>{expanded ? '▼' : '▶'}</div>;
}

// useOnlineStatus
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

function OfflineBanner() {
  const isOnline = useOnlineStatus();
  return !isOnline ? <Banner>Você está offline</Banner> : null;
}

// useWindowSize
import { useWindowSize } from '@/hooks/useWindowSize';

function BreakpointDebug() {
  const { width, height } = useWindowSize();
  return <span>{width}×{height}</span>;
}

// usePrevious
import { usePrevious } from '@/hooks/usePrevious';

function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);
  return <span>Atual: {count}, Anterior: {prevCount ?? '-'}</span>;
}

// useScrollPosition
import { useScrollPosition } from '@/hooks/useScrollPosition';

function BackToTopButton() {
  const { x, y } = useScrollPosition()

  // Exemplo: mostrar botao "voltar ao topo" quando scrollou mais de 500px
  const showBackToTop = y > 500

  return showBackToTop
    ? <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑ Topo</button>
    : null;
}

// useEventListener
import { useEventListener } from '@/hooks/useEventListener';

function KeyHandler() {
  useEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') doSomething();
  }, typeof window !== 'undefined' ? window : null);
}
```

### Storage Wrappers (lib/storage)

> O hook `useLocalStorage` e para uso em componentes React (com re-render). O wrapper `storage.local` e para uso fora de componentes (utilidades, server-side). Ambos compartilham a mesma logica de serialization/TTL.

```ts
// localStorage com expiração
import { storage } from '@/lib/storage';

const typedStorage = storage.local<{ theme: string }>();

typedStorage.set('theme', 'dark');
typedStorage.get('theme'); // 'dark'

// Com TTL (time-to-live em ms)
typedStorage.setWithExpiry('session', data, 1000 * 60 * 30); // 30 min
typedStorage.getWithExpiry('session'); // null se expirado

// Cookies
import { cookies } from '@/lib/storage/cookies';

cookies.set('consent', 'accepted', { maxAge: 365 * 24 * 60 * 60, path: '/' });
cookies.get('consent'); // 'accepted' | undefined
cookies.delete('consent');
cookies.parse(document.cookie); // Record<string, string>
```

### Cookie Consent Banner

Cookie consent banner em conformidade com LGPD (Lei Geral de Protecao de Dados). Categorias: essenciais (sempre ativos), analytics (opt-in), marketing (opt-in).

```tsx
// src/components/shared/CookieConsentBanner.tsx
import { useCookieConsent } from '@/hooks/useCookieConsent';

export function CookieConsentBanner() {
  const { consent, accept, decline, shouldShow } = useCookieConsent();

  if (!shouldShow) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-muted border-t">
      <p>Usamos cookies para melhorar sua experiência.</p>
      <div className="flex gap-2 mt-2">
        <button onClick={accept}>Aceitar</button>
        <button onClick={decline}>Recusar</button>
      </div>
    </div>
  );
}
```

## Estrutura de Arquivos

```
src/
├── hooks/
│   ├── useDebounce.ts
│   ├── useThrottle.ts
│   ├── useMediaQuery.ts
│   ├── useLocalStorage.ts
│   ├── useSessionStorage.ts
│   ├── useClipboard.ts
│   ├── useOnClickOutside.ts
│   ├── useIntersectionObserver.ts
│   ├── useKeyboardShortcut.ts
│   ├── usePrevious.ts
│   ├── useToggle.ts
│   ├── useOnlineStatus.ts
│   ├── useWindowSize.ts
│   ├── useScrollPosition.ts
│   ├── useEventListener.ts
│   ├── useCookieConsent.ts
│   └── index.ts
├── lib/
│   └── storage/
│       ├── local.ts         # localStorage + expiry
│       ├── session.ts        # sessionStorage
│       ├── cookies.ts        # cookie get/set/delete/parse
│       └── index.ts
└── components/
    └── shared/
        └── CookieConsentBanner.tsx
```

## Dependencias

### Bibliotecas Externas

- Nenhuma obrigatória para os hooks base; implementação própria preferida
- Opcional: `usehooks-ts` ou `ahooks` como referência de implementação (não como dependência)

### Specs Relacionados

- [Design System](../a-fundacao-visual/design-system.md) — estilos do CookieConsentBanner
- [Seguranca & Configuracao](../e-infraestrutura/seguranca-configuracao.md) — CSP e cookies
- [Formularios](../b-dados-formularios/formularios.md) — uso de useDebounce em inputs de busca

## Criterios de Aceite

- [ ] Todos os 16 hooks implementados e exportados via `hooks/index.ts`
- [ ] useLocalStorage e useSessionStorage retornam `undefined` durante SSR
- [ ] useMediaQuery não causa hydration mismatch (estado inicial consistente)
- [ ] Wrapper localStorage com `setWithExpiry` e `getWithExpiry` funcionando
- [ ] Utilitários de cookies: get, set, delete, parse tipados
- [ ] CookieConsentBanner funcional com useCookieConsent
- [ ] Testes unitários para hooks com `renderHook` (Vitest)
- [ ] Documentação de cada hook no README ou JSDoc

## Notas de Implementacao

- Esta spec define a **implementacao canonica** dos hooks. Outras specs (Layouts, Interacoes, Navegacao) documentam **patterns de uso** desses hooks em seus contextos especificos.
- Hooks que aparecem em outras specs como exemplos de uso:
  - `useMediaQuery` / `useBreakpoint` → usados em [Layouts & Responsividade](../a-fundacao-visual/layouts-responsividade.md)
  - `useClipboard` → usado em [Interacoes Avancadas](../f-padroes-ux/interacoes-avancadas.md)
  - `useKeyboardShortcut` → usado em [Interacoes Avancadas](../f-padroes-ux/interacoes-avancadas.md)
  - `useLocalStorage` → usado em [Navegacao, URL & Busca](../d-navegacao/navegacao-url-busca.md) para buscas recentes
  - `useOnlineStatus` → usado em [Feedback & Orientacao](../f-padroes-ux/feedback-orientacao.md) para offline detection

## Referencias

- [useHooks - useDebounce](https://usehooks.com/usedebounce/)
- [React useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)
- [MDN - MatchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia)
- [GDPR Cookie Consent Guidelines](https://gdpr.eu/cookies/)
