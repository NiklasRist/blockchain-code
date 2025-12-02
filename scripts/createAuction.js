require("dotenv").config();
const fs = require("fs");
const { ethers } = require("hardhat");

async function main() {
  const auctionHouseAddress = process.env.AUCTION_HOUSE;
  if (!auctionHouseAddress) throw new Error("Missing AUCTION_HOUSE in .env");

  const AuctionHouse = await ethers.getContractFactory("AuctionHouse");
  const auctionHouse = AuctionHouse.attach(auctionHouseAddress);

  // Neue Auction erstellen
  const tx = await auctionHouse.createAuction(
    "Gaming Laptop",
    "RTX 4070, 16GB RAM",
    ethers.utils.parseEther("0.1"),
    300
  );

  const receipt = await tx.wait();
  const event = receipt.events.find(e => e.event === "AuctionCreated");

  const auctionId = event.args.auctionId.toNumber();
  const auctionAddress = event.args.auctionAddress;

  console.log("Auction created:");
  console.log("ID:", auctionId);
  console.log("Address:", auctionAddress);

  // ENV laden
  let env = fs.readFileSync(".env", "utf8").split("\n");

  // Neuen Eintrag AUCTION_<id> hinzufügen
  env = env.filter(line => !line.startsWith(`AUCTION_${auctionId}=`)); // falls existiert
  env.push(`AUCTION_${auctionId}=${auctionAddress}`);

  // NICHTS ANDERES löschen
  fs.writeFileSync(".env", env.join("\n") + "\n");

  console.log(`Stored AUCTION_${auctionId} in .env`);
}

main().catch(console.error);
