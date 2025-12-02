// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Auction.sol";

contract AuctionHouse {

    // Jede Auction wird sauber gespeichert
    struct AuctionInfo {
        address auctionAddress;
        address seller;
        string itemName;
        uint256 startingPrice;
        uint256 endAt;
    }

    AuctionInfo[] public auctions;

    // Events
    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed auctionAddress,
        address indexed seller,
        string itemName,
        uint256 startingPrice,
        uint256 endAt
    );

    event AuctionRemoved(uint256 indexed auctionId);

    // ----------------------------------------------------------
    // Neue Auktion erstellen
    // ----------------------------------------------------------

    function createAuction(
        string calldata _itemName,
        string calldata _description,
        uint256 _startingPrice,
        uint256 _biddingTime
    ) external returns (uint256 auctionId, address auctionAddress)
    {
        auctionId = auctions.length; // aktuelle Länge = neue ID

        // Auction erzeugen — jetzt mit ID und AuctionHouse-Adresse
        Auction auction = new Auction(
            msg.sender,
            _itemName,
            _description,
            _startingPrice,
            _biddingTime,
            auctionId,
            address(this)
        );

        auctionAddress = address(auction);

        // Speichern im Array
        auctions.push(
            AuctionInfo({
                auctionAddress: auctionAddress,
                seller: msg.sender,
                itemName: _itemName,
                startingPrice: _startingPrice,
                endAt: block.timestamp + _biddingTime
            })
        );

        emit AuctionCreated(
            auctionId,
            auctionAddress,
            msg.sender,
            _itemName,
            _startingPrice,
            block.timestamp + _biddingTime
        );
    }

    // ----------------------------------------------------------
    // Auction löschen → wird von Auction selbst gerufen
    // ----------------------------------------------------------

    function removeAuction(uint256 id) external {
        require(msg.sender == auctions[id].auctionAddress,
            "Only auction contract may remove itself");

        uint256 lastIndex = auctions.length - 1;

        // Swap-and-pop
        if (id != lastIndex) {
            auctions[id] = auctions[lastIndex];
        }

        auctions.pop();
        emit AuctionRemoved(id);
    }

    // ----------------------------------------------------------
    // Getter
    // ----------------------------------------------------------

    function getAuctionsCount() external view returns (uint256) {
        return auctions.length;
    }

    function getAuction(uint256 id)
        external
        view
        returns (AuctionInfo memory)
    {
        require(id < auctions.length, "Invalid auction ID");
        return auctions[id];
    }
}
