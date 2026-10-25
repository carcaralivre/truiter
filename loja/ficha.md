# Truiter — ficha para addons.mozilla.org

**Envio de código-fonte obrigatório:** `script.js` é gerado. No upload da versão, marque "Yes" em "Do You Need to Submit Source Code?" e anexe `web-ext-artifacts/truiter-<versão>-fontes.zip` (gerado por `sh tools/fontes.sh`). As instruções de build estão no `BUILD.md` dentro do zip.

- Nome: **Truiter** (livre na AMO)
- Resumo (≤ 250): Devolve o Twitter cronológico, sem os penduricalhos do X. Abre em "Seguindo" por ordem de data, esconde retweets, sugestões, métricas e upsells, usa a largura toda e põe Listas e Configurações na barra lateral.
- Categorias: Redes sociais e comunicação · Aparência
- Tags: twitter, x, cronológico, limpar
- Licença: MIT (a mesma do Control Panel for Twitter; ver NOTICE)
- Site: (repositório, se criar) · Suporte: (seu e-mail)
- Ícone: `icone-128.png`
- Capturas: 1) Home em largura total, aba Following · 2) barra lateral com Lists e Settings (você tira)

## Descrição

Extensão para Firefox que devolve o Twitter cronológico, sem os penduricalhos do X.

Versão enxuta do Control Panel for Twitter, só com as funções que uso, sempre ligadas:

Timeline inicial
- Abre sempre em "Seguindo", ordenado pelos mais recentes.
- Esconde os Retweets, o "Ver novos Tweets", o conteúdo sugerido e os avisos no meio da timeline.
- Conteúdo, mídias e cards em largura total, sem a coluna lateral, em todas as páginas (menos nos resultados de busca, onde fica o campo de pesquisa).

Melhorias
- Bloqueio sem confirmação; esconde citações e respostas de contas bloqueadas e silenciadas.
- Nas listas, o menu da lista ganha "Desativar/Ativar Retweets".
- Na página de citações de um tweet, esconde o tweet citado repetido.

Correções do X
- Carrossel de mídias antigo, Twemoji, tema escuro "Lights out" e selo do Twitter Blue no lugar do selo azul.
- Esconde visualizações, a aba de seguidores verificados, upsells do Premium, "Editar imagem", Vagas, Assinaturas e recursos da NFL.
- Restaura a origem do tweet, as manchetes dos links e os links de citações e interações.
- Mostra o país da conta no tweet aberto e no cartão do perfil.

Interface
- Fonte normal nos menus suspensos e botões Seguir/Seguindo monocromáticos.
- Esconde a barra lateral, o conteúdo do Explorar, "Mais deste autor", sugestões e o botão de escrever tweet.
- O menu "Mais" dá lugar a Listas e Configurações direto na barra lateral; sem gaveta de mensagens nem botão flutuante do Grok.

Nenhum dado sai do navegador. A única configuração guardada é a escolha de retweets por lista.

## Notas ao revisor (English)

A trimmed build of Control Panel for Twitter (MIT, by Jonny Buchanan) with a fixed configuration. `script.js` is **generated**: upstream `script.js` at the commit in `tools/upstream-commit`, text-patched by `tools/pre.py`, then constant-folded and dead-code-eliminated by `tools/prune.mjs` (Babel + recast). The source archive contains the tools, the lockfile and `BUILD.md`; the build is deterministic (byte-identical output). `content.js` injects `script.js` into the page (it needs React props/state, like upstream) and relays one setting (`listRetweets`) via `storage.local`. `styles.css` and `nav.js` are hand-written: layout tweaks and two nav links (Lists, Settings) cloned from X's own nav items; navigation uses the app's router read from React props through `wrappedJSObject`, falling back to a normal link. No network requests of its own, no remote code.
