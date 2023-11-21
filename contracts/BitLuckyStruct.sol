// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/**
 * @title BitLuckyStruct
 * @dev This contract defines a structure for a product in a raffle system.
 */
contract BitLuckyStruct {
    /**
     * @dev Defines the structure for a product in the raffle.
     * @notice Each product has a ticket price, maximum number of tickets, number of tickets sold, closing time for the raffle, and a flag to indicate if the raffle is closed or all tickets are sold.
     */
    struct Product {
        uint8 ticketPrice; // Price of each ticket for this product
        uint16 maxTickets; // Maximum number of tickets that can be sold for this product
        uint16 ticketsSold; // Number of tickets already sold for this product
        uint32 closedTime; // Time when the raffle for this product was closed
        uint256 productID; // Unique identifier for the product
        bool isAllSold; // Flag to indicate if all tickets for this product are sold
        address productWinner; // Address of the product winner
        string productName; // Name of the product
        string productType; // Type of the product
    }
}
