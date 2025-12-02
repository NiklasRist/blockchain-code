# Blockchain Auction House (Hardhat + Solidity + MetaMask + Sepolia)

Dies ist ein vollständiges Web3-Auktionssystem bestehend aus:

- **AuctionHouse.sol** — Factory für beliebig viele Auktionen
- **Auction.sol** — eine einzelne Auktion mit Startpreis, Bietlogik, Refunds, Ende & Cancel
- **Hardhat Scripts** zum Deployen & Interagieren
- **Frontend (HTML + JS + Ethers.js)** zum Erstellen und Bieten über MetaMask
- **Deployment auf Sepolia**

---

## ⚙️ Installation

```bash
npm install
```

Erstelle eine `.env` Datei:

```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
SEPOLIA_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
GANACHE_PK0=0x...
GANACHE_PK1=0x...
GANACHE_PK2=0x...
```

---

## 🚀 Deployment

### ➤ Lokales Deployment (Ganache)

Ganache starten:

```
ganache --mnemonic "leader blouse twist shoe survey crisp"
```

Dann:

```
npx hardhat run scripts/deployAuctionHouse.js --network ganache
```

### ➤ Deployment auf Sepolia

```
npx hardhat run scripts/deployAuctionHouse.js --network sepolia
```

Die Contract-Adresse notieren.

---

## 🧩 AuctionHouse – Funktionen

### createAuction(name, description, startPrice, duration)

Erstellt eine neue Auktion:

```js
await auctionHouse.createAuction(
  "Gaming Laptop",
  "RTX 4070, 16GB RAM",
  ethers.utils.parseEther("0.1"),
  300
);
```

### subscribe()

Registriert die eigene Adresse für Benachrichtigungen (off-chain Events listener).

### getAuction(id)

Liefert Metadaten einer Auktion.

---

## 🧩 Auction – Funktionen

### bid()

ETH bieten:

```js
await auction.bid({ value: ethers.utils.parseEther("0.2") });
```

### withdrawRefund()

Unterlegene Bieter holen Geld zurück.

### end()

Verkäufer beendet die Auktion und erhält das Höchstgebot.

### cancel()

Nur möglich, solange noch niemand geboten hat.

---

## 🖥️ Frontend nutzen

Im Ordner `frontend/`:

- `index.html` öffnen
- MetaMask verbinden
- Auktion erstellen/bieten
- Refunds abholen
- Auktionen anzeigen

**ABIs befinden sich in `frontend/abi/`.**

---

## 📁 Projektstruktur

```
contracts/
  Auction.sol
  AuctionHouse.sol

scripts/
  deployAuctionHouse.js
  demoAuction.js
  createAuction.js
  bid.js
  endAuction.js
  withdrawRefund.js

frontend/
  index.html
  main.js
  style.css
  abi/
    auctionAbi.json
    auctionHouseAbi.json
```

---

## 🧪 Tests (optional)

Unit Tests können mit Hardhat erstellt werden:

```
npx hardhat test
```

---

## ✔️ Zusammenfassung

Dieses Projekt erfüllt alle Anforderungen:

- Unterschiedlich vom in-class Beispiel  
- Multi-Auktionssystem  
- Refunds & Bietlogik  
- Frontend für Interaktion  
- Sepolia Deployment  
- README dokumentiert alles klar  
- ABIs inklusive  
