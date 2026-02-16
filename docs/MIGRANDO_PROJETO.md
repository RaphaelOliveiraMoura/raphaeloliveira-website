## Migrando projetos

Regras doque deve ser considerado ao migrar projetos utilizando esse repositório como referencia:

### Diretivas

- [ ] antes de iniciar garanta que tem total entendimento sobre oque deve ser feito, caso tenha duvidas faça perguntas

- [ ] garantir que os metadados do projeto serao atualizados
  - name no package.json
  - qualquer outro lugar que tenha referencia a core-stack

- [ ] manter no projeto tudo que for generico (componentes, utilitarios...), apagar tudo que for muito especifico (paginas de exemplo, landing pages de exemplo...)

- [ ] se nao for utilizar backend no projeto, deletar a pasta backend e suas referencias em documentações e integrações
  - remover também configurações do husky para backend
  - remover configurações de ci/cd do backend

- [ ] garantir que tudo esteja internacionalizado com os padroes utilizados no projeto de i18n

- [ ] garantir o uso correto de logging seguindo o padrao de Wide Events pattern

- [ ] garantir que o build ira funcionar apos a migracao sem errors. `npm run build` (frontend) + `npm run build` (backend)

- [ ] garantir que os testes passam: `npm test` (ambos)

- [ ] Lint/format OK: `npm run lint` + `npm run format` (ambos)

- [ ] TypeScript strict completo: `npx tsc --noEmit`

- [ ] para toda migracao, sera passado algum outro repositorio ou pasta de referencia, sempre as alterações e adaptacoes em codigo devem ser realizadas nesse repositorio/pasta e nunca na pasta que foi enviada como referencia

- [ ] AGENTS.md revisado (adicionar regras específicas do projeto)
