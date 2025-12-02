require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const [seller, bidder1, bidder2] = await ethers.getSigners();

  const auctionHouseAddress = process.env.AUCTION_HOUSE;
  if (!auctionHouseAddress) throw new Error("Missing AUCTION_HOUSE in .env");

  const AuctionHouse = await ethers.getContractFactory("AuctionHouse");
  const auctionHouse = AuctionHouse.attach(auctionHouseAddress);

  console.log("\n--- Creating Auction ---");

  const txCreate = await auctionHouse.connect(seller).createAuction(
    "Gaming Laptop",
    "RTX 4070, 16GB RAM, 1TB SSD",
    ethers.utils.parseEther("0.1"),
    300
  );

  const receipt = await txCreate.wait();
  const event = receipt.events.find(e => e.event === "AuctionCreated");

  const auctionId = event.args.auctionId.toNumber();
  const auctionAddress = event.args.auctionAddress;

  console.log(`Auction ${auctionId} created at: ${auctionAddress}`);

  const Auction = await ethers.getContractFactory("Auction");
  const auction = Auction.attach(auctionAddress);

  console.log("\n--- Bidding Phase ---");

  // Bidder 1
  let tx = await auction.connect(bidder1).bid({
    value: ethers.utils.parseEther("0.2"),
  });
  await tx.wait();
  console.log("Bidder1 bid 0.2 ETH");

  // Bidder 2
  tx = await auction.connect(bidder2).bid({
    value: ethers.utils.parseEther("0.3"),
  });
  await tx.wait();
  console.log("Bidder2 bid 0.3 ETH");

  console.log("\n--- Current Auction State ---");
  console.log("Highest bidder:", await auction.highestBidder());
  console.log(
    "Highest bid:",
    ethers.utils.formatEther(await auction.highestBid())
  );

  console.log("\n--- Refund Check ---");
  const refund1 = await auction.refunds(bidder1.address);
  console.log("Refund bidder1:", ethers.utils.formatEther(refund1), "ETH");

  // Optional: End the auction (if time expired or endAt=0 for test)
  /*
  console.log("\n--- Ending Auction ---");
  await auction.connect(seller).end();
  console.log("Auction ended");
  */

  console.log("\nDemo completed.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
