// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Auction {
    address public seller;
    uint256 public endAt;
    bool public ended;

    address public highestBidder;
    uint256 public highestBid;

    mapping(address => uint256) public refunds;

    event BidPlaced(address indexed bidder, uint256 amount);
    event AuctionEnded(address winner, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);

    constructor(uint256 _biddingTime) {
        seller = msg.sender;
        endAt = block.timestamp + _biddingTime;
    }

    modifier onlySeller() {
        require(msg.sender == seller, "Not seller");
        _;
    }

    modifier auctionActive() {
        require(block.timestamp < endAt, "Auction ended");
        _;
    }

    modifier auctionFinished() {
        require(block.timestamp >= endAt, "Auction not ended yet");
        require(!ended, "Auction already finalized");
        _;
    }

    function bid() external payable auctionActive {
        require(msg.value > highestBid, "Bid too low");
        require(msg.sender != seller, "Seller cannot bid");

        if (highestBidder != address(0)) {
            refunds[highestBidder] += highestBid;
        }

        highestBid = msg.value;
        highestBidder = msg.sender;

        emit BidPlaced(msg.sender, msg.value);
    }

    function withdraw() external {
        uint256 amount = refunds[msg.sender];
        require(amount > 0, "No refund available");

        refunds[msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        emit Withdraw(msg.sender, amount);
    }

    function endAuction() external onlySeller auctionFinished {
        ended = true;
        emit AuctionEnded(highestBidder, highestBid);
    }

    function withdrawProceeds() external onlySeller {
        require(ended, "Auction not ended yet");
        require(highestBid > 0, "No proceeds");

        uint256 amount = highestBid;
        highestBid = 0;
        payable(seller).transfer(amount);
    }
}
