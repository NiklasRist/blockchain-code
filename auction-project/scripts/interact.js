require("dotenv").config();
const fs = require("fs");
const { ethers, network } = require("hardhat");

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(
    network.config.url
  );

  const seller  = new ethers.Wallet(process.env.GANACHE_PK0, provider);
  const bidder1 = new ethers.Wallet(process.env.GANACHE_PK1, provider);
  const bidder2 = new ethers.Wallet(process.env.GANACHE_PK2, provider);

  // Load deployed address for this network
  const all = JSON.parse(fs.readFileSync("deployedAddresses.json"));
  const address = all[network.name];

  if (!address) {
    throw new Error(`No deployed address found for network: ${network.name}`);
  }

  console.log(`Using contract deployed on ${network.name}: ${address}`);

  const Auction = await ethers.getContractFactory("Auction");
  const auction = Auction.attach(address);

  const a1 = auction.connect(bidder1);
  const a2 = auction.connect(bidder2);

  let tx = await a1.bid({ value: ethers.utils.parseEther("0.1") });
  await tx.wait();

  tx = await a2.bid({ value: ethers.utils.parseEther("0.2") });
  await tx.wait();

  const refund = await auction.refunds(bidder1.address);
  console.log("Refund:", ethers.utils.formatEther(refund));
}

main();
