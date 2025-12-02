# Blockchain Auction House – Multi-Auction Factory System

This project implements a complete on-chain auction system consisting of two smart contracts:

- **AuctionHouse.sol** – Factory contract that creates and manages multiple auctions  
- **Auction.sol** – Individual auction with bidding, refunds, ending, and self-removal  

The system supports:

- Multiple parallel auctions  
- Automatic deletion of finished/cancelled auctions  
- Secure bidding with enforced starting price  
- Automatic refunds for outbid users  

---

## Features

### Multi‑Auction Factory  
Each auction gets:
- a unique ID  
- its own smart contract address  

### Automatic Removal of Auctions  
When an auction ends or is cancelled, it calls:  
`AuctionHouse.removeAuction(auctionId)`  

Which removes it using **swap‑and‑pop**, leaving no gaps.

### Secure Bidding Logic  
- Minimum starting price enforced  
- Requires strictly higher bid than current highest  
- Refunds tracked per address  
- Seller cannot bid  
- Auction ends after specified duration  

### Seller Controls  
Only the seller may:
- **end()** an auction (after time passed)  
- **cancel()** an auction (only before first bid)

### Frontend Integration  
HTML/JS frontend supports:
- Connecting via MetaMask  
- Creating auctions  
- Listing active auctions  
- Placing bids  
- Withdrawing refunds  
- Ending auctions  

---

## Installation

```
npm install
```

Create a `.env` file:

```
GANACHE_PK0=0x...
GANACHE_PK1=0x...
GANACHE_PK2=0x...

SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
SEPOLIA_PRIVATE_KEY=0xYOUR_PRIVATE_KEY

AUCTION_HOUSE=
AUCTION_0=
AUCTION_1=
```

---

## Deployment

### Ganache

Start Ganache:

```
ganache --mnemonic "leader blouse twist shoe survey crisp"
```

Deploy AuctionHouse:

```
npx hardhat run scripts/deployAuctionHouse.js --network ganache
```

This writes the address to `.env`:

```
AUCTION_HOUSE=0x123...
```

### Sepolia

```
npx hardhat run scripts/deployAuctionHouse.js --network sepolia
```

---

### Frontend

```
cd frontend
npx http-server .
```
Please only access it under http://127.0.0.1:8080/ to not break the application.

## Smart Contract Documentation

# AuctionHouse.sol

### createAuction(name, description, startPrice, biddingTime)

Deploys a new Auction contract.  
Returns:

- **auctionId**  
- **auctionAddress**  

Also emits `AuctionCreated`.

### removeAuction(id)

Automatically called by Auction.sol when:

- seller ends the auction  
- seller cancels the auction  

Uses **swap‑and‑pop** to maintain a compact array.

### getAuction(id)

Returns:

- auctionAddress  
- seller  
- itemName  
- startingPrice  
- endAt  

### getAuctionsCount()

Returns number of active auctions.

---

# Auction.sol

### bid()

Places a bid.

Requirements:

- msg.value ≥ startingPrice  
- msg.value > highestBid  
- seller cannot bid  
- auction not ended  

Tracks refunds for prior highest bidder.

### withdrawRefund()

Allows losing bidders to retrieve their funds.

### end()

Only seller.  
Requires time passed.  
Pays seller.  
Removes auction from AuctionHouse.  
Emits `AuctionEnded`.

### cancel()

Only seller.  
Only if no bids placed.  
Removes auction from AuctionHouse.  
Emits `AuctionCancelled`.

---

## Scripts

### Create a new auction

```
npx hardhat run scripts/createAuction.js --network ganache
```

Automatically writes:

```
AUCTION_0=0xABC...
AUCTION_1=0xDEF...
```

### Bid

```
npx hardhat run scripts/bid.js --network ganache
```

### Withdraw refund

```
npx hardhat run scripts/withdrawRefunds.js --network ganache
```

### End auction

```
npx hardhat run scripts/endAuction.js --network ganache
```

### List active auctions

```
npx hardhat run scripts/listAuctions.js --network ganache
```

---

## Frontend

Located in:

```
frontend/
```

Open `index.html` and:

- Connect MetaMask  
- Load AuctionHouse  
- Create auctions  
- Bid  
- Withdraw refunds  
- End auctions  

ABIs located in:

```
frontend/abi/auctionAbi.json
frontend/abi/auctionHouseAbi.json
```

---

## 🧪 Tests

Run:

```
npx hardhat test
```

Covers:

- Auction creation  
- Minimum bid logic  
- Overbidding  
- Refund system  
- Seller restrictions  
- Ending/cancel lifecycle  
- Auction removal via AuctionHouse  

---


