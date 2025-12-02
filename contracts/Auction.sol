// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAuctionHouse {
    function removeAuction(uint256 id) external;
}

contract Auction {

    enum State { Running, Ended, Cancelled }

    address public immutable seller;
    string public itemName;
    string public itemDescription;

    uint256 public immutable startingPrice;
    uint256 public immutable endAt;

    uint256 public immutable auctionId;
    address public immutable auctionHouse;

    State public state;

    address public highestBidder;
    uint256 public highestBid;

    mapping(address => uint256) public refunds;

    event BidPlaced(address bidder, uint256 amount);
    event AuctionEnded(address winner, uint256 amount);
    event AuctionCancelled();
    event RefundWithdrawn(address user, uint256 amount);

    constructor(
        address _seller,
        string memory _itemName,
        string memory _itemDescription,
        uint256 _startingPrice,
        uint256 _biddingTime,
        uint256 _auctionId,
        address _auctionHouse
    ) {
        require(_seller != address(0), "Seller zero");
        require(_biddingTime > 0, "Invalid duration");

        seller = _seller;
        itemName = _itemName;
        itemDescription = _itemDescription;
        startingPrice = _startingPrice;
        endAt = block.timestamp + _biddingTime;

        auctionId = _auctionId;
        auctionHouse = _auctionHouse;

        state = State.Running;
    }

    modifier onlySeller() {
        require(msg.sender == seller, "Not seller");
        _;
    }

    modifier inState(State s) {
        require(state == s, "Wrong state");
        _;
    }

    modifier active() {
        require(state == State.Running, "Not running");
        require(block.timestamp < endAt, "Auction ended");
        _;
    }

    function bid() external payable active {
        require(msg.sender != seller, "Seller cannot bid");

        require(msg.value >= startingPrice, "Bid too low");

        require(msg.value > highestBid, "Bid too low");

        if (highestBidder != address(0)) {
            refunds[highestBidder] += highestBid;
        }

        highestBid = msg.value;
        highestBidder = msg.sender;

        emit BidPlaced(msg.sender, msg.value);
    }

    function withdrawRefund() external {
        uint256 amount = refunds[msg.sender];
        require(amount > 0, "No refund");

        refunds[msg.sender] = 0;

        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        require(ok, "Refund failed");

        emit RefundWithdrawn(msg.sender, amount);
    }

    function cancel() external onlySeller inState(State.Running) {
        require(highestBidder == address(0), "Already bids");

        state = State.Cancelled;

        IAuctionHouse(auctionHouse).removeAuction(auctionId);

        emit AuctionCancelled();
    }

    function end() external onlySeller inState(State.Running) {
        require(block.timestamp >= endAt, "Too early");

        state = State.Ended;

        if (highestBid > 0) {
            (bool ok, ) = payable(seller).call{value: highestBid}("");
            require(ok, "Payout failed");
        }

        IAuctionHouse(auctionHouse).removeAuction(auctionId);

        emit AuctionEnded(highestBidder, highestBid);
    }
}
