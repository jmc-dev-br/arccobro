# Atualizar o ArcCobro no GitHub (modo seguro)

Esta versão pausa conexão de carteira e pagamentos reais após o alerta de segurança exibido pela MetaMask. Ela mantém uma demonstração de checkout sem carteira e sem movimentar fundos.

1. Extraia o ZIP no computador.
2. Abra o repositório https://github.com/jmc-dev-br/arccobro e clique em **Add file → Upload files**.
3. Arraste os arquivos atualizados `index.html`, `app.js`, `styles.css` e `README.md` para o GitHub. Se o GitHub indicar que os arquivos já existem, confirme a substituição.
4. Clique em **Commit changes**.
5. Aguarde a atualização do GitHub Pages. Abra https://jmc-dev-br.github.io/arccobro/?demo=1
6. Na demonstração, clique em **Create payment link**, depois em **Open checkout** e em **Simulate demo — no funds**. A mensagem final deixa claro que nada foi enviado on-chain.

**Não selecione “Connect anyway” na MetaMask.** O modo seguro não conecta uma carteira, não solicita assinatura, não envia transação e não prova pagamento on-chain. A classificação do site precisa ser revisada antes de reativar pagamentos reais.
