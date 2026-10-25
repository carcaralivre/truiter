# Truiter

Extensão para Firefox que devolve o Twitter cronológico, sem os penduricalhos do X.

Versão enxuta do [Control Panel for Twitter](https://github.com/insin/control-panel-for-twitter), só com as funções que eu uso, sempre ligadas. O código de `script.js` é o original com essas configurações fixadas e todo o resto removido; `styles.css` e `nav.js` são os retoques da própria Truiter por cima.

**Timeline inicial**
- Abre sempre em "Seguindo", ordenado pelos mais recentes.
- Esconde os Retweets, o "Ver novos Tweets", o conteúdo sugerido e os avisos no meio da timeline.
- Conteúdo, mídias e cards em largura total, sem a coluna lateral, em todas as páginas (menos nos resultados de busca, onde fica o campo de pesquisa).

**Melhorias**
- Bloqueio sem confirmação.
- Esconde citações e respostas de contas bloqueadas e silenciadas, e o conteúdo sugerido na busca.
- Nas listas, o menu da lista ganha "Desativar/Ativar Retweets" (a escolha fica salva).
- Na página de citações de um tweet, esconde o tweet citado repetido.

**Correções do X**
- Carrossel de mídias antigo, Twemoji, tema escuro "Lights out" e selo do Twitter Blue no lugar do selo azul.
- Esconde visualizações, a aba de seguidores verificados, upsells do Premium, "Editar imagem", Vagas, Assinaturas e recursos da NFL.
- Restaura a origem do tweet, as manchetes dos links e os links de citações e interações abaixo dos tweets.
- Mostra o país da conta no tweet aberto e no cartão do perfil.

**Interface**
- Fonte normal nos menus suspensos e botões Seguir/Seguindo monocromáticos, sem inversão.
- Pula a verificação de idade e tira o desfoque de conteúdo sensível.
- Esconde a barra lateral, o conteúdo do Explorar, "Mais deste autor", sugestões do "Descobrir" e o botão de escrever tweet.
- Esconde o botão Compartilhar, os links "Ver atividade", o trocador de contas e os itens Seguir, Creator Studio, Business, Anúncios e Criar Espaço.
- O menu "Mais" dá lugar a Listas e Configurações direto na barra lateral.
- Esconde a gaveta de mensagens e o botão flutuante do Grok no canto da janela; na busca, some a caixa "Try searching for…" enquanto o campo está vazio.
- Todas as páginas ficam com a mesma margem à direita que o Chat, as Chamadas e o Grok já têm.

## Desenvolvimento

```sh
npx web-ext lint    # valida
npx web-ext build   # gera o .zip em web-ext-artifacts/
npx web-ext sign --channel=unlisted --api-key=… --api-secret=…   # assina e gera o .xpi
npx web-ext sign --channel=listed --api-key=… --api-secret=…     # submete à revisão da loja (addons.mozilla.org)
```

Toda alteração precisa de um novo `version` no `manifest.json` antes de assinar.

## Atualizar a partir do original

Quando o X mudar algo e o Control Panel for Twitter corrigir, rode `tools/update.sh`: ele baixa a versão mais recente, fixa as configurações (objeto `FOLD` em `tools/prune.mjs`) e regenera o `script.js`. Para mudar uma opção, edite o `FOLD` e rode de novo.

## Licença

[MIT](LICENSE), a mesma do Control Panel for Twitter (veja também [NOTICE](NOTICE)).
