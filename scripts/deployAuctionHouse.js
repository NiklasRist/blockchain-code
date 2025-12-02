require("dotenv").config();
const fs = require("fs");
const { ethers } = require("hardhat");

async function main() {
  const AuctionHouse = await ethers.getContractFactory("AuctionHouse");
  const auctionHouse = await AuctionHouse.deploy();
  await auctionHouse.deployed();

  console.log("AuctionHouse deployed to:", auctionHouse.address);

  let env = "";
  if (fs.existsSync(".env")) {
    env = fs.readFileSync(".env", "utf8");
  }

  const updated = env
    .split("\n")
    .filter(line => !line.startsWith("AUCTION_HOUSE="))
    .join("\n");

  const finalEnv = updated + `\nAUCTION_HOUSE=${auctionHouse.address}\n`;

  fs.writeFileSync(".env", finalEnv.trim() + "\n");

  console.log("Updated AUCTION_HOUSE in .env");
}

main().catch(console.error);
