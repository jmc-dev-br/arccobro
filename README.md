# ArcCobro

**Shareable USDC payment links with on-chain verification on Arc Mainnet.**

ArcCobro is a small, dependency-free web app for freelancers and small businesses. A recipient can create a payment request, share a URL, and let the payer send USDC directly to the recipient's wallet. After payment, the app checks the public Arc RPC receipt and requires a successful transaction with a USDC `Transfer` event matching the configured token interface, recipient, and exact amount.

## What works in this prototype

- Responsive landing page and payment request creator.
- Shareable payment URLs using query parameters (no database required for this MVP).
- Browser wallet connection using an EIP-1193 provider such as MetaMask.
- Adds/switches the wallet to Arc Mainnet (chain ID `5042`).
- Submits a USDC ERC-20 `transfer` through the wallet; the payer authorizes the transaction.
- Verifies the receipt and exact transfer event using Arc's public RPC.
- Allows manual verification using a transaction hash.
- Links verified transaction receipts to Arc Explorer.

## Important limitations

This is an **early proof of concept**, not a production payment service. It has no backend/database, so requests are not stored centrally; the recipient, amount, and description are encoded in the URL and can be edited by whoever changes that URL. Verification proves that a matching transfer is in the receipt against the details in the current link; it does not guarantee that a link is authentic or prevent the same transfer from being presented against multiple identical requests. Do not use it as an accounting system.

Only send real funds after checking the address and amount in your wallet. Transactions are irreversible in normal circumstances. The app never needs or asks for a seed phrase or private key. A compatible browser wallet and sufficient USDC on Arc are required; Arc uses USDC for gas. Wallet support can vary.

## Run locally

This site is plain HTML/CSS/JavaScript and has no build step.

1. Extract this folder.
2. Start a local server in this folder:

   ```bash
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in a browser with a compatible EVM wallet.
4. For a live payment test, use a wallet with Arc Mainnet enabled and enough USDC for both the transfer and gas. You can test the form and URL creation without connecting a wallet.

## Publish for free

You can publish this folder as a static site using a static host. The easiest workflow is to create a public GitHub repository, upload these files, then import that repository into a static host such as Cloudflare Pages or Netlify. No custom domain is required to test the hosted app. A public GitHub repo and a live URL are separate steps; this ZIP does not publish either automatically.

## Arc configuration

- Mainnet chain ID: `5042` (`0x13b2`)
- RPC: `https://rpc.mainnet.arc.io`
- Explorer: `https://explorer.arc.io`
- USDC ERC-20 interface: `0x3600000000000000000000000000000000000000`
- USDC ERC-20 transfer precision: 6 decimals

Arc documentation notes that native USDC gas precision is 18 decimals while the ERC-20 interface uses 6 decimals. This app uses the documented ERC-20 interface for payment transfers.

Official references:
- https://docs.arc.io/arc/references/rpc-endpoints
- https://docs.arc.io/arc/references/contract-addresses
- https://docs.arc.io/arc/references/usdc-system-events

## Before production

Add server-side request records and authentication, signed or otherwise tamper-resistant invoice details, replay/double-payment policies, invoice expiry, distinct underpayment/overpayment handling, automated tests, error reporting, rate limits, accessibility and cross-wallet QA, and a security review.
