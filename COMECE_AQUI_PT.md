# ArcCobro — guia rápido

## O que está pronto

- Página em inglês, adequada para demonstrar o projeto a avaliadores internacionais.
- Criação de links de cobrança compartilháveis.
- Conexão com uma carteira EVM, como MetaMask, e troca para Arc Mainnet.
- Envio de USDC direto para a carteira indicada pelo link.
- Verificação do recibo na RPC pública da Arc e do evento `Transfer` com o destinatário e valor esperados.
- Verificação manual usando hash da transação.

## Limitações importantes

Este é um MVP sem servidor e sem banco de dados. Os dados da cobrança estão na URL; alguém pode alterar o link, e as cobranças não ficam registradas em uma conta. A verificação compara a transferência com os dados do link aberto, mas isso não torna o link autêntico nem impede reutilização de comprovantes em solicitações idênticas. É uma prova de conceito, não um sistema de faturamento pronto para produção.

O site **não está publicado ainda** e o ZIP não cria um repositório público automaticamente. Nenhuma transferência foi enviada por mim. Ao usar a Mainnet, você pode mover dinheiro real: confira destinatário e valor na carteira e nunca compartilhe sua frase-semente.

## Publicar rapidamente no GitHub Pages

1. Baixe e extraia `ArcCobro-Mainnet.zip`.
2. No GitHub, crie um repositório **público** chamado `arccobro`.
3. Envie os arquivos `index.html`, `styles.css`, `app.js`, `README.md` e este guia para a raiz do repositório (os arquivos do site precisam ficar no mesmo nível que `index.html`).
4. Abra **Settings → Pages** no repositório. Em “Build and deployment”, escolha **Deploy from a branch**, selecione `main` e `/ (root)` e salve.
5. Quando o GitHub Pages mostrar a URL, abra o site nela e teste a criação de link. Para verificar uma cobrança na Mainnet, use uma carteira compatível com saldo de USDC suficiente também para as taxas.
6. Use o link público e o repositório como parte da inscrição, sem declarar funções que você ainda não testou.

Se você já tiver domínio próprio e acesso ao DNS/hospedagem, pode apontá-lo para o novo site. Não precisa apagar seu jogo para testar o ArcCobro: guarde uma cópia do projeto atual antes de substituir qualquer publicação. Eu não tenho acesso ao seu provedor de domínio/hospedagem por este pacote.

## Testar localmente no Windows

Com Python instalado, abra o PowerShell na pasta extraída e execute:

```powershell
py -m http.server 8000
```

Depois acesse `http://localhost:8000` no navegador. O site precisa ser servido por HTTP para que o fluxo de carteira e a chamada RPC sejam mais previsíveis.
