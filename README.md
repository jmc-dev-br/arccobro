# ArcCobro

**Shareable USDC payment links with on-chain verification on Arc Mainnet.**

## Current safety status

The hosted GitHub Pages domain displayed a MetaMask warning that the site may show phishing or wallet-draining behavior. Until this is reviewed and resolved with MetaMask, the published app is intentionally in **safe-demo mode**: wallet connection and live payment submission are disabled. Open the site with `?demo=1` to exercise the checkout interface using a placeholder address; this does not connect a wallet, submit a transaction, move funds, or prove on-chain payment.

Do **not** bypass the warning by choosing “Connect anyway.” The alert alone does not establish why the domain was classified, so it needs investigation rather than guesswork.

ArcCobro is a small, dependency-free web app for freelancers and small businesses. A recipient can create a payment request, share a URL, and let the payer send USDC directly to the recipient's wallet. After payment, the app checks the public Arc RPC receipt and requires a successful transaction with a USDC `Transfer` event matching the configured token interface, recipient, and exact amount.

## What works in this prototype

- Responsive landing page and payment request creator.
- Shareable payment URLs using query parameters (no database required for this MVP).
- Safe demo checkout with a placeholder recipient; it uses no wallet and sends no transaction.
- Read-only receipt verification code is present, but must be tested separately.
- Arc Mainnet configuration is documented below.

## Temporarily disabled

- Wallet connection and live payment submission are disabled in the published front end while the MetaMask website warning is investigated. Do not enable live payments until the alert has been reviewed and the transaction flow has been independently checked.

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
3. Open `http://localhost:8000` in a browser.
4. Use `http://localhost:8000/?demo=1` to test the checkout interface with no wallet and no funds. Do not enable live payment submission until the MetaMask warning is resolved.

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
