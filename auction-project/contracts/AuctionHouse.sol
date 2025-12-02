// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Auction.sol";

/// @title AuctionHouse - erstellt und verwaltet mehrere Auktionen
contract AuctionHouse {
    struct AuctionInfo {
        address auctionAddress;
        address seller;
        string itemName;
        uint256 startingPrice;
        uint256 endAt;
    }

    AuctionInfo[] public auctions;

    // simples Subscribe-System
    mapping(address => bool) public isSubscriber;
    address[] public subscribers;

    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed auctionAddress,
        address indexed seller,
        string itemName,
        uint256 startingPrice,
        uint256 endAt
    );

    event Subscribed(address indexed user);

    /// @notice User tragen sich als "interessiert" ein (für Off-Chain-Notification)
    function subscribe() external {
        require(!isSubscriber[msg.sender], "already subscribed");
        isSubscriber[msg.sender] = true;
        subscribers.push(msg.sender);
        emit Subscribed(msg.sender);
    }

    /// @notice Neue Auktion für ein Item erstellen
    function createAuction(
        string calldata _itemName,
        string calldata _description,
        uint256 _startingPrice,
        uint256 _biddingTime
    ) external returns (uint256 auctionId, address auctionAddress) {
        Auction auction = new Auction(
            msg.sender,
            _itemName,
            _description,
            _startingPrice,
            _biddingTime
        );

        auctionAddress = address(auction);

        auctions.push(
            AuctionInfo({
                auctionAddress: auctionAddress,
                seller: msg.sender,
                itemName: _itemName,
                startingPrice: _startingPrice,
                endAt: block.timestamp + _biddingTime
            })
        );

        auctionId = auctions.length - 1;

        emit AuctionCreated(
            auctionId,
            auctionAddress,
            msg.sender,
            _itemName,
            _startingPrice,
            block.timestamp + _biddingTime
        );
    }

    function getAuctionsCount() external view returns (uint256) {
        return auctions.length;
    }

    function getAuction(uint256 _id)
        external
        view
        returns (AuctionInfo memory)
    {
        require(_id < auctions.length, "invalid id");
        return auctions[_id];
    }

    function getSubscribers() external view returns (address[] memory) {
        return subscribers;
    }
}
