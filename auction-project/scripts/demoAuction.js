const { ethers } = require("hardhat");

async function main() {
  const [seller, bidder1, bidder2] = await ethers.getSigners();

  const auctionHouseAddress = "PASTE_AUCTION_HOUSE_ADDRESS_HERE";

  const AuctionHouse = await ethers.getContractFactory("AuctionHouse");
  const auctionHouse = AuctionHouse.attach(auctionHouseAddress);

  // Seller erstellt neue Auktion
  const txCreate = await auctionHouse.connect(seller).createAuction(
    "Gaming Laptop",
    "RTX 4070, 16GB RAM, 1TB SSD",
    ethers.utils.parseEther("0.1"), // Startpreis 0.1 ETH
    300                              // 5 Minuten Laufzeit
  );

  const receipt = await txCreate.wait();
  const event = receipt.events.find(e => e.event === "AuctionCreated");

  const auctionId = event.args.auctionId.toNumber();
  const auctionAddress = event.args.auctionAddress;

  console.log("Created auction", auctionId, "at", auctionAddress);

  const Auction = await ethers.getContractFactory("Auction");
  const auction = Auction.attach(auctionAddress);

  // Bieter 1
  let tx = await auction.connect(bidder1).bid({
    value: ethers.utils.parseEther("0.2"),
  });
  await tx.wait();
  console.log("Bidder1 bid 0.2 ETH");

  // Bieter 2 überbietet
  tx = await auction.connect(bidder2).bid({
    value: ethers.utils.parseEther("0.3"),
  });
  await tx.wait();
  console.log("Bidder2 bid 0.3 ETH");

  console.log("Highest bidder:", await auction.highestBidder());
  console.log(
    "Highest bid:",
    ethers.utils.formatEther(await auction.highestBid())
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
