(() => {
  "use strict";
  const ARC = {
    chainId: "0x13b2", // 5042
    chainIdDecimal: 5042,
    name: "Arc Mainnet",
    rpc: "https://rpc.mainnet.arc.io",
    explorer: "https://explorer.arc.io",
    currency: { name: "USDC", symbol: "USDC", decimals: 18 },
    usdc: "0x3600000000000000000000000000000000000000", // ERC-20 interface: 6 decimals
    transferTopic: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
    transferSelector: "a9059cbb"
  };
  const $ = (selector) => document.querySelector(selector);
  const form = $("#charge-form");
  const toast = $("#toast");
  const createView = $("#create-view");
  const paymentView = $("#payment-view");
  const hero = $("#hero");
  const descriptionInput = $("#description");
  const amountInput = $("#amount");
  const walletInput = $("#wallet");
  const amountRegex = /^(?:0|[1-9]\d*)(?:\.\d{1,6})?$/;
  let toastTimer;
  let charge = null;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }
  function setStatus(target, message, kind = "", isHtml = false) {
    target.classList.remove("hidden", "error", "success");
    if (kind) target.classList.add(kind);
    if (isHtml) target.innerHTML = message;
    else target.textContent = message;
  }
  function shorten(address) {
    return address && address.length > 17 ? `${address.slice(0, 8)}…${address.slice(-6)}` : (address || "");
  }
  function validAddress(value) { return /^0x[a-fA-F0-9]{40}$/.test(value || ""); }
  function validTxHash(value) { return /^0x[a-fA-F0-9]{64}$/.test(value || ""); }
  function amountToUnits(value) {
    const text = String(value).trim();
    if (!amountRegex.test(text) || Number(text) <= 0 || Number(text) > 1000000) throw new Error("Enter an amount greater than 0 and up to 1,000,000 USDC (maximum 6 decimal places).");
    const [whole, fraction = ""] = text.split(".");
    return BigInt(whole) * 1000000n + BigInt((fraction + "000000").slice(0, 6));
  }
  function formatAmount(value) {
    const number = Number(value);
    return number.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  }
  function makeId() {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
  }
  async function copyText(value, label) {
    try {
      await navigator.clipboard.writeText(value);
      showToast(`${label} copied.`);
    } catch {
      const temp = document.createElement("textarea");
      temp.value = value;
      temp.style.position = "fixed";
      temp.style.opacity = "0";
      document.body.appendChild(temp); temp.select();
      const ok = document.execCommand("copy"); temp.remove();
      showToast(ok ? `${label} copied.` : "Could not copy automatically.");
    }
  }
  function makeLink(request) {
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    url.searchParams.set("id", request.id);
    url.searchParams.set("d", request.description);
    url.searchParams.set("a", request.amount);
    url.searchParams.set("to", request.wallet);
    return url.toString();
  }
  async function rpc(method, params) {
    const response = await fetch(ARC.rpc, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params })
    });
    if (!response.ok) throw new Error(`Arc RPC returned HTTP ${response.status}. Try again shortly.`);
    const payload = await response.json();
    if (payload.error) throw new Error(payload.error.message || "Arc RPC request failed.");
    return payload.result;
  }
  async function addOrSwitchArc(ethereum) {
    const current = await ethereum.request({ method: "eth_chainId" });
    if (current.toLowerCase() === ARC.chainId) return;
    try {
      await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: ARC.chainId }] });
    } catch (error) {
      if (error.code !== 4902) throw error;
      await ethereum.request({ method: "wallet_addEthereumChain", params: [{
        chainId: ARC.chainId,
        chainName: ARC.name,
        rpcUrls: [ARC.rpc],
        blockExplorerUrls: [ARC.explorer],
        nativeCurrency: ARC.currency
      }] });
      await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: ARC.chainId }] });
    }
  }
  async function connectWallet() {
    if (!window.ethereum || typeof window.ethereum.request !== "function") {
      throw new Error("No EVM wallet detected. Install MetaMask or open this page in a compatible wallet browser.");
    }
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (!accounts || !accounts[0]) throw new Error("No wallet account was selected.");
    await addOrSwitchArc(window.ethereum);
    return accounts[0];
  }
  function encodeAddress(address) { return address.slice(2).toLowerCase().padStart(64, "0"); }
  function encodeUint(value) { return value.toString(16).padStart(64, "0"); }
  function topicAddress(topic) { return "0x" + topic.slice(-40).toLowerCase(); }
  function linkForTx(hash) { return `${ARC.explorer}/tx/${hash}`; }
  function showTxLink(hash, target = "#tx-link") {
    const link = $(target);
    link.href = linkForTx(hash);
    link.classList.remove("hidden");
    link.textContent = `View transaction on Arc Explorer ↗`;
  }

  async function verifyReceipt(hash, request, { waitForReceipt = false } = {}) {
    const wantedUnits = amountToUnits(request.amount);
    let receipt = null;
    const attempts = waitForReceipt ? 35 : 1;
    for (let i = 0; i < attempts; i++) {
      receipt = await rpc("eth_getTransactionReceipt", [hash]);
      if (receipt) break;
      if (i < attempts - 1) await new Promise(resolve => setTimeout(resolve, 900));
    }
    if (!receipt) return { ok: false, pending: true, message: "The transaction is not visible on Arc yet. Wait a moment, then try verifying again." };
    if (receipt.status !== "0x1") return { ok: false, message: "The transaction failed on-chain. This request is not marked as paid." };
    const matching = (receipt.logs || []).some(log => {
      if ((log.address || "").toLowerCase() !== ARC.usdc.toLowerCase()) return false;
      if (!log.topics || log.topics.length < 3 || log.topics[0].toLowerCase() !== ARC.transferTopic) return false;
      const from = topicAddress(log.topics[1]);
      const to = topicAddress(log.topics[2]);
      let units;
      try { units = BigInt(log.data); } catch { return false; }
      return to === request.wallet.toLowerCase() && units === wantedUnits && validAddress(from);
    });
    if (!matching) return { ok: false, message: "A successful receipt exists, but it does not contain a matching USDC transfer to this recipient for the exact requested amount." };
    return { ok: true, message: `Verified on Arc Mainnet: ${formatAmount(request.amount)} USDC transferred to ${shorten(request.wallet)}.` };
  }
  function currentRequest() {
    const params = new URLSearchParams(window.location.search);
    const description = (params.get("d") || "").trim();
    const amount = (params.get("a") || "").trim();
    const wallet = (params.get("to") || "").trim();
    const id = (params.get("id") || "").trim();
    if (!description || description.length > 100 || !amountRegex.test(amount) || Number(amount) <= 0 || Number(amount) > 1000000 || !validAddress(wallet)) return null;
    try { amountToUnits(amount); } catch { return null; }
    return { id, description, amount, wallet };
  }
  function renderRequest(request) {
    charge = request;
    $("#payment-description").textContent = request.description;
    $("#payment-amount").textContent = formatAmount(request.amount);
    $("#payment-recipient").textContent = shorten(request.wallet);
    $("#payment-recipient").title = request.wallet;
    hero.classList.add("hidden");
    createView.classList.add("hidden");
    paymentView.classList.remove("hidden");
    document.title = `Pay ${formatAmount(request.amount)} USDC — ArcCobro`;
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    const description = descriptionInput.value.trim();
    const amount = amountInput.value.trim();
    const wallet = walletInput.value.trim();
    if (!description || description.length > 100 || !validAddress(wallet)) {
      showToast("Add a description and a valid 0x wallet address."); return;
    }
    try { amountToUnits(amount); } catch (error) { showToast(error.message); return; }
    charge = { id: makeId(), description, amount, wallet };
    $("#preview-description").textContent = description;
    $("#preview-amount").textContent = formatAmount(amount);
    $("#preview-wallet").textContent = shorten(wallet);
    $("#preview-wallet").title = wallet;
    $("#share-link").value = makeLink(charge);
    $("#empty-preview").classList.add("hidden");
    $("#charge-preview").classList.remove("hidden");
    showToast("Payment link created. Copy and share it with your client.");
  });

  $("#use-wallet").addEventListener("click", async () => {
    const button = $("#use-wallet");
    button.disabled = true;
    try {
      const account = await connectWallet();
      walletInput.value = account;
      showToast("Arc wallet connected; receiving address filled in.");
    } catch (error) { showToast(error.message || "Wallet connection failed."); }
    finally { button.disabled = false; }
  });
  $("#copy-link").addEventListener("click", () => { if (charge) copyText($("#share-link").value, "Payment link"); });
  $("#copy-wallet").addEventListener("click", () => { if (charge) copyText(charge.wallet, "Wallet address"); });
  $("#open-payment").addEventListener("click", () => {
    if (!charge) return;
    window.location.href = makeLink(charge);
  });
  $("#copy-recipient").addEventListener("click", () => { if (charge) copyText(charge.wallet, "Recipient address"); });

  $("#pay-button").addEventListener("click", async () => {
    if (!charge) return;
    const button = $("#pay-button");
    const original = button.innerHTML;
    button.disabled = true;
    try {
      const sender = await connectWallet();
      const data = `0x${ARC.transferSelector}${encodeAddress(charge.wallet)}${encodeUint(amountToUnits(charge.amount))}`;
      setStatus($("#payment-status"), "Confirm the USDC transfer in your wallet. Arc Mainnet uses USDC for transaction fees.");
      const hash = await window.ethereum.request({ method: "eth_sendTransaction", params: [{ from: sender, to: ARC.usdc, data }] });
      setStatus($("#payment-status"), "Transaction sent. Waiting for the Arc receipt and checking the USDC Transfer event…");
      showTxLink(hash);
      const result = await verifyReceipt(hash, charge, { waitForReceipt: true });
      setStatus($("#payment-status"), result.message, result.ok ? "success" : "error");
      if (result.ok) showToast("Payment verified on Arc Mainnet.");
    } catch (error) {
      const message = error && error.code === 4001 ? "Wallet request cancelled. No payment was submitted by this action." : (error.message || "The wallet transaction could not be completed.");
      setStatus($("#payment-status"), message, "error");
    } finally { button.disabled = false; button.innerHTML = original; }
  });

  $("#verify-button").addEventListener("click", async () => {
    const hash = $("#tx-hash").value.trim();
    const button = $("#verify-button");
    if (!validTxHash(hash)) { setStatus($("#verify-status"), "Enter a valid 0x transaction hash (64 hexadecimal characters).", "error"); return; }
    button.disabled = true;
    try {
      setStatus($("#verify-status"), "Checking the Arc Mainnet receipt and matching the USDC transfer…");
      const result = await verifyReceipt(hash, charge);
      setStatus($("#verify-status"), result.message, result.ok ? "success" : "error");
      if (result.ok) { showTxLink(hash); showToast("Matching payment verified."); }
    } catch (error) { setStatus($("#verify-status"), error.message || "Could not verify this transaction.", "error"); }
    finally { button.disabled = false; }
  });

  const incomingRequest = currentRequest();
  if (incomingRequest) renderRequest(incomingRequest);
  else if (window.location.search) {
    const p = new URLSearchParams(window.location.search);
    if (p.has("id") || p.has("d") || p.has("a") || p.has("to")) showToast("This payment link looks incomplete or invalid.");
  }
})();
