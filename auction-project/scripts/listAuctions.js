require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const auctionHouseAddress = process.env.AUCTION_HOUSE;

  const AuctionHouse = await ethers.getContractFactory("AuctionHouse");
  const auctionHouse = AuctionHouse.attach(auctionHouseAddress);

  const count = await auctionHouse.getAuctionsCount();
  console.log("Total auctions:", count.toString());

  for (let i = 0; i < count; i++) {
    const a = await auctionHouse.getAuction(i);
    console.log(`Auction #${i}:`);
    console.log("- item:", a.itemName);
    console.log("- address:", a.auctionAddress);
    console.log("- startPrice:", ethers.utils.formatEther(a.startingPrice));
    console.log("- endsAt:", a.endAt.toString());
    console.log();
  }
}

main().catch(console.error);
