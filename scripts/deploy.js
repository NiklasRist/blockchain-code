const fs = require("fs");
const { ethers, network } = require("hardhat");

async function main() {
  const Auction = await ethers.getContractFactory("Auction");
  const auction = await Auction.deploy(300);
  await auction.deployed();

  console.log(`Auction deployed to ${network.name}:`, auction.address);

  const file = "deployedAddresses.json";
  let data = {};

  if (fs.existsSync(file)) {
    data = JSON.parse(fs.readFileSync(file, "utf8"));
  }

  data[network.name] = auction.address;

  fs.writeFileSync(file, JSON.stringify(data, null, 2));

  console.log(`Saved address for ${network.name}`);
}

main();
