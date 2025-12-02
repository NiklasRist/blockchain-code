require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const auctionAddress = process.env.AUCTION_0;
  if (!auctionAddress) throw new Error("Missing AUCTION_0 in .env");

  const [_, bidder] = await ethers.getSigners();

  const Auction = await ethers.getContractFactory("Auction");
  const auction = Auction.attach(auctionAddress);

  const tx = await auction.connect(bidder).withdrawRefund();
  await tx.wait();

  console.log("Refund withdrawn:", bidder.address);
}

main().catch(console.error);
