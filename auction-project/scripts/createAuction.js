const { ethers } = require("hardhat");

async function main() {
  const [seller] = await ethers.getSigners();

  const auctionHouseAddress = process.env.AUCTION_HOUSE;
  if (!auctionHouseAddress) throw new Error("Missing AUCTION_HOUSE in .env");

  const AuctionHouse = await ethers.getContractFactory("AuctionHouse");
  const auctionHouse = AuctionHouse.attach(auctionHouseAddress);

  const tx = await auctionHouse.createAuction(
    "Gaming Laptop",
    "RTX 4070, 16GB, 1TB SSD",
    ethers.utils.parseEther("0.1"),
    300
  );

  const receipt = await tx.wait();
  const event = receipt.events.find(e => e.event === "AuctionCreated");

  console.log("Auction created:");
  console.log("ID:", event.args.auctionId.toString());
  console.log("Address:", event.args.auctionAddress);
}

main().catch(console.error);
