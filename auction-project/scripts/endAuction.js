require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const auctionAddress = process.env.AUCTION_ADDRESS;
  if (!auctionAddress) throw new Error("Missing AUCTION_ADDRESS in .env");

  const [seller] = await ethers.getSigners();

  const Auction = await ethers.getContractFactory("Auction");
  const auction = Auction.attach(auctionAddress);

  const tx = await auction.connect(seller).end();
  await tx.wait();

  console.log("Auction ended by:", seller.address);
}

main().catch(console.error);
