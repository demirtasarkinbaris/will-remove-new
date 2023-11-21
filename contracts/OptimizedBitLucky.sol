// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

// Importing OpenZeppelin's contract
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Importing the BitLuckyStruct contract
import "./BitLuckyStruct.sol";

// Randomness interface for selecting winners
interface BitLuckyRandomnessInterface {
    function getRandomNum(uint256 value) external view returns (uint256);
}

contract OptimizedBitLucky is ERC1155, Ownable {
    // Event that is emitted when a new product is created
    event ProductCreated(
        uint256 productID,
        uint256 ticketPrice,
        uint16 maxTickets,
        string productName
    );

    // Event emitted when a user buys tickets
    event TicketsBought(
        uint256 productID,
        address indexed buyer,
        uint256[] ticketIDs,
        uint256 ticketAmount
    );

    // Event emitted when a winner is selected
    event WinnerSelected(uint256 productID, address winner);

    // Event emitted when a product's closing time is updated
    event ClosingTimeUpdated(uint256 productID, uint256 newClosedTime);

    // Event emitted when a user claims a refund
    event RefundClaimed(
        uint256 productID,
        address claimer,
        uint256 refundAmount
    );

    // Mapping to track the tickets owned by each address for each product
    mapping(uint256 => mapping(address => uint256[])) public userTickets;
    // Mapping to track which address owns each ticket
    mapping(uint256 => mapping(uint256 => address)) public ticketOwners;
    // Mapping to track the productWinner by productID
    mapping(uint256 => address) public productWinners;
    // Mapping to store custom URIs for NFTs
    mapping(uint256 => string) public nftURIs;

    BitLuckyRandomnessInterface public bitluckyRandomnessContract;

    // Array of all products
    BitLuckyStruct.Product[] public products;
    // Count of all products
    uint256 public productCount;

    constructor(
        address _bitluckyRandomnessContractAddress
    ) payable ERC1155("") {
        bitluckyRandomnessContract = BitLuckyRandomnessInterface(
            _bitluckyRandomnessContractAddress
        );
    }

    /**
     * @notice Creates a new product with the given parameters.
     * @param _ticketPrice The price of each ticket for this product (in USDT).
     * @param _maxTickets The maximum number of tickets that can be sold for this product.
     * @param _closedTime The time when the raffle for this product will be closed.
     * @param _productName The name of the product.
     * @param _nftURI The custom URI for the NFT associated with the product.
     */
    function createProduct(
        uint256 _ticketPrice,
        uint16 _maxTickets,
        uint256 _closedTime,
        string memory _productName,
        string memory _productType,
        string memory _nftURI
    ) external onlyOwner {
        require(_ticketPrice != 0, "Ticket price must be greater than 0");
        require(_maxTickets != 0, "Max tickets must be greater than 0");
        require(
            bytes(_productName).length != 0,
            "Product name cannot be empty"
        );

        uint256 productID = productCount;

        BitLuckyStruct.Product memory newProduct = BitLuckyStruct.Product({
            ticketPrice: uint8(_ticketPrice),
            maxTickets: _maxTickets,
            ticketsSold: 0,
            closedTime: uint32((_closedTime * 1 minutes) + block.timestamp),
            productID: productCount,
            isAllSold: false,
            productWinner: address(0),
            productName: _productName,
            productType: _productType
        });

        products.push(newProduct);
        productCount++;

        nftURIs[productID] = _nftURI;
        _mint(msg.sender, productID, 1, "");
        _setURI(_nftURI);

        emit ProductCreated(productID, _ticketPrice, _maxTickets, _productName);
    }

    /**
     * @notice Allows a user to buy tickets for a product using USDT.
     * @param productID The ID of the product for which the user wants to buy tickets.
     * @param ticketAmount The number of tickets the user wants to buy.
     */
    function buyTickets(
        uint256 productID,
        uint256 ticketAmount,
        address usdtTokenAddress
    ) external {
        BitLuckyStruct.Product storage product = products[productID];

        require(product.productID == productID, "Invalid product ID");
        require(
            block.timestamp < product.closedTime,
            "Raffle closing time has passed"
        );

        uint256 remainingTickets = product.maxTickets - product.ticketsSold;
        require(
            ticketAmount <= remainingTickets,
            "Not enough available tickets"
        );

        uint256 totalCost = uint256(product.ticketPrice) * ticketAmount;

        IERC20 usdtToken = IERC20(address(usdtTokenAddress));

        require(
            usdtToken.allowance(msg.sender, address(this)) >= totalCost,
            "You must approve the contract to spend USDT tokens"
        );
        // Effects: Perform state changes
        product.ticketsSold += uint16(ticketAmount);
        if (product.ticketsSold == product.maxTickets) {
            product.isAllSold = true;
        }
        require(
            usdtToken.transferFrom(msg.sender, address(this), totalCost),
            "USDT transfer failed"
        );

        uint256[] memory ticketIDs = new uint256[](ticketAmount);
        for (uint256 i = 0; i < ticketAmount; ) {
            uint256 newTicketID = uint256(product.ticketsSold) + i;
            ticketIDs[i] = newTicketID;
            _mint(msg.sender, productID, 1, "");
            ticketOwners[productID][newTicketID] = msg.sender;

            unchecked {
                ++i;
            }
        }

        for (uint256 i = 0; i < ticketAmount; ) {
            userTickets[productID][msg.sender].push(ticketIDs[i]);

            unchecked {
                ++i;
            }
        }

        emit TicketsBought(productID, msg.sender, ticketIDs, ticketAmount);
    }

    /**
     * @notice Allows the owner of the contract to select a winner for a product.
     * @param productID The ID of the product for which the owner wants to select a winner.
     */
    function selectWinner(uint256 productID) external onlyOwner {
        BitLuckyStruct.Product storage product = products[productID];

        require(product.isAllSold, "All tickets are not sold for this product");
        require(
            product.closedTime < block.timestamp,
            "Raffle closing time has not passed yet"
        );

        uint256 randomNumber = 1;

        address winningTicketOwner = ticketOwners[productID][randomNumber - 1];

        product.productWinner = winningTicketOwner;
        productWinners[productID] = winningTicketOwner;

        emit WinnerSelected(productID, winningTicketOwner);
    }

    /**
     * @notice Allows the owner to update the closing time for a product by adding more time to the current closing time.
     * @param productID The ID of the product to update the closing time for.
     * @param additionalTime The additional time (in minutes) to add to the current closing time.
     */
    function updateClosedTime(
        uint256 productID,
        uint256 additionalTime
    ) external onlyOwner {
        BitLuckyStruct.Product storage product = products[productID];
        require(product.productID == productID, "Invalid product ID");
        require(
            block.timestamp < product.closedTime,
            "Raffle closing time has passed"
        );

        // Calculate the new closing time by adding the additional time
        uint256 newClosedTime = product.closedTime +
            (additionalTime * 1 minutes);
        product.closedTime = uint32(newClosedTime);

        emit ClosingTimeUpdated(productID, newClosedTime);
    }

    /**
     * @notice Allows a user to claim a refund for their ticket purchase if the raffle has closed and all tickets were not sold.
     * @param productID The ID of the product for which the user wants to claim a refund.
     */
    function refund(uint256 productID, address usdtTokenAddress) external {
        BitLuckyStruct.Product storage product = products[productID];
        require(product.productID == productID, "Invalid product ID");
        require(block.timestamp > product.closedTime, "Raffle closed.");
        require(
            !product.isAllSold,
            "All tickets are sold, no refund available"
        );

        uint256[] storage userTicketIDs = userTickets[productID][msg.sender];
        require(userTicketIDs.length != 0, "No tickets owned by this address");

        uint256 ticketPrice = uint256(product.ticketPrice);
        uint256 refundAmount = userTicketIDs.length * ticketPrice;

        uint256 userTicketIDsLength = userTicketIDs.length;

        for (uint256 i = 0; i < userTicketIDsLength; ) {
            uint256 ticketID = userTicketIDs[i];
            _burn(msg.sender, productID, 1);
            delete ticketOwners[productID][ticketID];

            unchecked {
                ++i;
            }
        }

        delete userTickets[productID][msg.sender];

        IERC20 usdtToken = IERC20(address(usdtTokenAddress));
        require(
            usdtToken.transfer(msg.sender, refundAmount),
            "Refund transfer failed"
        );

        emit RefundClaimed(productID, msg.sender, refundAmount);
    }

    /**
     * @notice Allows the owner to withdraw USDT from the contract.
     * @param amount The amount of USDT to withdraw.
     */
    function withdraw(
        uint256 amount,
        address usdtTokenAddress
    ) external onlyOwner {
        IERC20 usdtToken = IERC20(address(usdtTokenAddress));
        require(
            usdtToken.balanceOf(address(this)) >= amount,
            "Insufficient USDT balance in the contract"
        );

        require(usdtToken.transfer(owner(), amount), "USDT withdrawal failed");
    }
}
