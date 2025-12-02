require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const auctionAddress = process.env.AUCTION_ADDRESS;
  if (!auctionAddress) throw new Error("Missing AUCTION_ADDRESS in .env");

  const [_, bidder] = await ethers.getSigners();

  const Auction = await ethers.getContractFactory("Auction");
  const auction = Auction.attach(auctionAddress);

  const tx = await auction.connect(bidder).bid({
    value: ethers.utils.parseEther("0.2")
  });

  await tx.wait();
  console.log("Bid of 0.2 ETH placed by:", bidder.address);
}

main().catch(console.error);
