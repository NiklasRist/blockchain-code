const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Auction System", function () {
  let AuctionHouse, Auction, auctionHouse;
  let owner, seller, bidder1, bidder2;

  beforeEach(async () => {
    [owner, seller, bidder1, bidder2] = await ethers.getSigners();

    AuctionHouse = await ethers.getContractFactory("AuctionHouse");
    auctionHouse = await AuctionHouse.deploy();
    await auctionHouse.deployed();

    Auction = await ethers.getContractFactory("Auction");
  });

  async function createAuction() {
    const tx = await auctionHouse
      .connect(seller)
      .createAuction(
        "Laptop",
        "Gaming RTX 4080",
        ethers.utils.parseEther("0.1"),
        60
      );

    const receipt = await tx.wait();
    const event = receipt.events.find((e) => e.event === "AuctionCreated");

    return {
      auctionId: event.args.auctionId.toNumber(),
      auctionAddress: event.args.auctionAddress,
    };
  }

  describe("AuctionHouse", function () {
    it("creates a new auction with correct parameters", async () => {
      const { auctionId, auctionAddress } = await createAuction();

      expect(auctionId).to.equal(0);
      expect(ethers.utils.isAddress(auctionAddress)).to.be.true;

      const info = await auctionHouse.getAuction(auctionId);

      expect(info.itemName).to.equal("Laptop");
      expect(info.seller).to.equal(seller.address);
      expect(info.startingPrice).to.equal(ethers.utils.parseEther("0.1"));
    });
  });

  describe("Auction", function () {
    it("enforces starting price", async () => {
      const { auctionAddress } = await createAuction();
      const auction = Auction.attach(auctionAddress);

      await expect(
        auction.connect(bidder1).bid({
          value: ethers.utils.parseEther("0.05"),
        })
      ).to.be.revertedWith("Bid too low");
    });

    it("accepts a valid first bid", async () => {
      const { auctionAddress } = await createAuction();
      const auction = Auction.attach(auctionAddress);

      await auction.connect(bidder1).bid({
        value: ethers.utils.parseEther("0.1"),
      });

      expect(await auction.highestBid()).to.equal(
        ethers.utils.parseEther("0.1")
      );
      expect(await auction.highestBidder()).to.equal(bidder1.address);
    });

    it("rejects lower bids", async () => {
      const { auctionAddress } = await createAuction();
      const auction = Auction.attach(auctionAddress);

      await auction.connect(bidder1).bid({
        value: ethers.utils.parseEther("0.2"),
      });

      await expect(
        auction.connect(bidder2).bid({
          value: ethers.utils.parseEther("0.1"),
        })
      ).to.be.revertedWith("Bid too low");
    });

    it("tracks refunds for outbid users", async () => {
      const { auctionAddress } = await createAuction();
      const auction = Auction.attach(auctionAddress);

      // bidder1 bids
      await auction.connect(bidder1).bid({
        value: ethers.utils.parseEther("0.2"),
      });

      // bidder2 outbids
      await auction.connect(bidder2).bid({
        value: ethers.utils.parseEther("0.3"),
      });

      const refund = await auction.refunds(bidder1.address);
      expect(refund).to.equal(ethers.utils.parseEther("0.2"));
    });

    it("allows losing bidders to withdraw refund", async () => {
      const { auctionAddress } = await createAuction();
      const auction = Auction.attach(auctionAddress);

      await auction.connect(bidder1).bid({
        value: ethers.utils.parseEther("0.2"),
      });

      await auction.connect(bidder2).bid({
        value: ethers.utils.parseEther("0.3"),
      });

      const balanceBefore = await bidder1.getBalance();

      const tx = await auction.connect(bidder1).withdrawRefund();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

      const balanceAfter = await bidder1.getBalance();

      expect(balanceAfter.add(gasUsed)).to.be.closeTo(
        balanceBefore.add(ethers.utils.parseEther("0.2")),
        ethers.utils.parseEther("0.00001")
      );
    });

    it("prevents seller from bidding", async () => {
      const { auctionAddress } = await createAuction();
      const auction = Auction.attach(auctionAddress);

      await expect(
        auction.connect(seller).bid({
          value: ethers.utils.parseEther("0.3"),
        })
      ).to.be.revertedWith("Seller cannot bid");
    });

    it("allows seller to end after time", async () => {
      const { auctionAddress } = await createAuction();
      const auction = Auction.attach(auctionAddress);

      await ethers.provider.send("evm_increaseTime", [61]);
      await ethers.provider.send("evm_mine");

      await expect(
        auction.connect(bidder1).bid({ value: ethers.utils.parseEther("0.1") })
      ).to.be.revertedWith("Auction ended");

      await expect(auction.connect(bidder1).end())
        .to.be.revertedWith("Not seller");

      await auction.connect(seller).end();
      expect(await auction.state()).to.equal(1); 
    });

    it("seller can cancel only if no bids", async () => {
      const { auctionAddress } = await createAuction();
      const auction = Auction.attach(auctionAddress);

      await auction.connect(seller).cancel();
      expect(await auction.state()).to.equal(2); // Cancelled
    });

    it("cannot cancel after bid", async () => {
      const { auctionAddress } = await createAuction();
      const auction = Auction.attach(auctionAddress);

      await auction.connect(bidder1).bid({
        value: ethers.utils.parseEther("0.2"),
      });

      await expect(auction.connect(seller).cancel())
        .to.be.revertedWith("Already bids");
    });
  });
});
