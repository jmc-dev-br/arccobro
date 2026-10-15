# ArcCobro — guia rápido (modo seguro)

## Situação atual

O site publicado disparou um alerta de segurança da MetaMask ao tentar conectar a carteira. Por precaução, esta versão **desativa conexão de carteira e envio de pagamentos reais** até a classificação ser revisada. Não clique em “Connect anyway” e não use dinheiro real neste teste. O alerta pode precisar de investigação; não vamos presumir a causa.

## O que você pode testar sem gastar

- A página principal e o formulário de cobrança.
- A criação e abertura de um link de checkout.
- O botão de simulação, que não conecta uma carteira, não envia uma transação e não verifica pagamento on-chain.

## Atualizar o repositório existente

1. Extraia o ZIP `ArcCobro-Atualizacao-Segura-GitHub.zip`.
2. Abra https://github.com/jmc-dev-br/arccobro.
3. Clique em **Add file → Upload files**.
4. Envie os arquivos `index.html`, `app.js`, `styles.css` e `README.md` extraídos do ZIP. Se o GitHub avisar que já existem, confirme a substituição. Também pode enviar este guia se desejar manter as instruções atualizadas.
5. Clique em **Commit changes** e aguarde o GitHub Pages atualizar.
6. Abra https://jmc-dev-br.github.io/arccobro/?demo=1
7. Clique em **Create payment link**, depois **Open checkout** e, por fim, **Simulate demo — no funds**. A mensagem final confirma que nenhum dinheiro foi movimentado.

## O que não fazer

- Não clique em “Connect anyway”.
- Não insira frase de recuperação ou chave privada em nenhum site.
- Não envie USDC para o endereço fictício da demonstração.
- Não declare que pagamentos reais estão funcionando; estão desativados na versão segura.

## Investigar o alerta

A MetaMask recomenda não conectar a carteira a sites que disparam esse alerta. Se você acredita que é uma classificação incorreta, a orientação oficial explica como reportar o domínio: https://support.metamask.io/stay-safe/safety-in-web3/deceptive-site-ahead-when-trying-to-connect-to-a-site/
