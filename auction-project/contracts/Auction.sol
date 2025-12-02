// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Einzelne Auktion für ein bestimmtes Item
contract Auction {
    enum State { Running, Ended, Cancelled }

    address public immutable seller;
    string public itemName;
    string public itemDescription;

    uint256 public immutable startingPrice;
    uint256 public immutable endAt;

    State public state;

    address public highestBidder;
    uint256 public highestBid;

    // Guthaben, das unterlegene Bieter zurückholen können
    mapping(address => uint256) public refunds;

    event BidPlaced(address indexed bidder, uint256 amount);
    event AuctionEnded(address winner, uint256 amount);
    event AuctionCancelled();
    event RefundWithdrawn(address indexed user, uint256 amount);

    constructor(
        address _seller,
        string memory _itemName,
        string memory _itemDescription,
        uint256 _startingPrice,
        uint256 _biddingTime
    ) {
        require(_seller != address(0), "seller = zero");
        require(_biddingTime > 0, "biddingTime = 0");

        seller = _seller;
        itemName = _itemName;
        itemDescription = _itemDescription;
        startingPrice = _startingPrice;
        endAt = block.timestamp + _biddingTime;
        state = State.Running;
    }

    modifier onlySeller() {
        require(msg.sender == seller, "not seller");
        _;
    }

    modifier inState(State expected) {
        require(state == expected, "wrong state");
        _;
    }

    modifier auctionActive() {
        require(state == State.Running, "not running");
        require(block.timestamp < endAt, "auction ended");
        _;
    }

    /// @notice Gebot abgeben
    function bid() external payable auctionActive {
        require(msg.sender != seller, "seller cannot bid");

        uint256 newBid = msg.value;

        if (highestBid == 0) {
            require(newBid >= startingPrice, "below start price");
        } else {
            require(newBid > highestBid, "bid too low");
            // bisherige Höchstbieter bekommen ihr Gebot als Refund gutgeschrieben
            refunds[highestBidder] += highestBid;
        }

        highestBid = newBid;
        highestBidder = msg.sender;

        emit BidPlaced(msg.sender, newBid);
    }

    /// @notice Unterlegene Bieter holen sich ihr Guthaben ab
    function withdrawRefund() external {
        uint256 amount = refunds[msg.sender];
        require(amount > 0, "no refund");

        refunds[msg.sender] = 0;

        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        require(ok, "transfer failed");

        emit RefundWithdrawn(msg.sender, amount);
    }

    /// @notice Verkäufer kann die Auktion abbrechen, solange noch niemand geboten hat
    function cancel() external onlySeller inState(State.Running) {
        require(highestBidder == address(0), "already bids");
        state = State.Cancelled;
        emit AuctionCancelled();
    }

    /// @notice Verkäufer beendet die Auktion und bekommt das Geld
    function end() external onlySeller inState(State.Running) {
        require(block.timestamp >= endAt, "too early");
        state = State.Ended;

        if (highestBid > 0) {
            (bool ok, ) = payable(seller).call{value: highestBid}("");
            require(ok, "payout failed");
        }

        emit AuctionEnded(highestBidder, highestBid);
    }

    /// @return Sekunden bis Auktionsende (0 falls schon vorbei)
    function getTimeLeft() external view returns (uint256) {
        if (block.timestamp >= endAt) {
            return 0;
        }
        return endAt - block.timestamp;
    }
}
