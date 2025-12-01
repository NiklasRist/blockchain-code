const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Auction", function () {
  let auction, seller, bidder1, bidder2;

  beforeEach(async function () {
    [seller, bidder1, bidder2] = await ethers.getSigners();

    const Auction = await ethers.getContractFactory("Auction");
    auction = await Auction.connect(seller).deploy(60); // 1 minute
    await auction.deployed();
  });

  it("should accept bids and refund properly", async function () {
    await auction.connect(bidder1).bid({ value: ethers.utils.parseEther("1") });
    await auction.connect(bidder2).bid({ value: ethers.utils.parseEther("2") });

    expect(await auction.refunds(bidder1.address)).to.equal(
      ethers.utils.parseEther("1")
    );
  });
});
