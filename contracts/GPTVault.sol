// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

import "./IExchangeRouter.sol";
import "./IERC20.sol";
import "./IVaultToken.sol";

contract HedgeVault {
    address public GMX_ROUTER;
    address public WETH;
    address public VAULT_TOKEN;
    address public owner;

    mapping(address => bytes32) public orderKeys;
    mapping(address => uint256) public userDeposits;

    struct CreateOrderParams {
        address initialCollateralToken;
        uint256 sizeDeltaUsd;
        uint256 executionFee;
        uint256 callbackGasLimit;
        address receiver;
        bool isLong;
        bool shouldUnwrapNativeToken;
    }

    event Deposit(address indexed depositor, uint256 amount, address token);
    event HedgeOpened(address indexed sender, bytes32 orderKey, uint256 sizeDeltaUsd);
    event HedgeClosed(address indexed sender, bytes32 orderKey, uint256 sizeDeltaUsd);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    constructor(address _GMX_ROUTER, address _WETH, address _VAULT_TOKEN) {
        GMX_ROUTER = _GMX_ROUTER;
        WETH = _WETH;
        VAULT_TOKEN = _VAULT_TOKEN;
        owner = msg.sender;
    }

    receive() external payable {
        depositETH();
    }

    function depositETH() public payable {
        require(msg.value > 0, "No ETH sent");
        uint256 sizeDeltaUsd = _getSizeDeltaUsd(msg.value);

        CreateOrderParams memory orderParams = CreateOrderParams({
            initialCollateralToken: WETH,
            sizeDeltaUsd: sizeDeltaUsd,
            executionFee: 0, // Adjust as needed
            callbackGasLimit: 0, // Adjust as needed
            receiver: msg.sender,
            isLong: true, // Adjust based on hedging strategy
            shouldUnwrapNativeToken: false
        });

        _safeTransferETH(WETH, msg.value);
        bytes32 orderKey = _createOrder(orderParams);
        
        userDeposits[msg.sender] = msg.value;
        orderKeys[msg.sender] = orderKey;

        emit Deposit(msg.sender, msg.value, WETH);
        emit HedgeOpened(msg.sender, orderKey, sizeDeltaUsd);
    }

    function depositToken(address token, uint256 amount) public {
        require(amount > 0, "No tokens sent");
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        uint256 sizeDeltaUsd = _getSizeDeltaUsd(amount);

        CreateOrderParams memory orderParams = CreateOrderParams({
            initialCollateralToken: token,
            sizeDeltaUsd: sizeDeltaUsd,
            executionFee: 0, // Adjust as needed
            callbackGasLimit: 0, // Adjust as needed
            receiver: msg.sender,
            isLong: true, // Adjust based on hedging strategy
            shouldUnwrapNativeToken: false
        });

        bytes32 orderKey = _createOrder(orderParams);

        userDeposits[msg.sender] = amount;
        orderKeys[msg.sender] = orderKey;

        emit Deposit(msg.sender, amount, token);
        emit HedgeOpened(msg.sender, orderKey, sizeDeltaUsd);
    }

    function _safeTransferETH(address to, uint256 amount) internal {
        (bool success, ) = to.call{value: amount}("");
        require(success, "ETH transfer failed");
    }

    function _createOrder(CreateOrderParams memory orderParams) internal returns (bytes32) {
        bytes32 orderKey = IExchangeRouter(GMX_ROUTER).createOrder(orderParams);

        // Store the orderKey in the contract's storage
        orderKeys[orderParams.receiver] = orderKey;

        // Emit HedgeOpened event
        emit HedgeOpened(orderParams.receiver, orderKey, orderParams.sizeDeltaUsd);

        return orderKey;
    }

    function _getSizeDeltaUsd(uint256 amount) internal view returns (uint256) {
        // Implement the logic to get sizeDelta in USD based on the current price
        // This is a placeholder implementation, replace with actual logic
        uint256 price = 2000 * 1e18; // Example: assuming ETH price is $2000
        return (amount * price) / 1e18;
    }

    function mintVaultTokens(address depositor, uint256 amount) external onlyOwner {
        IVaultToken(VAULT_TOKEN).mint(depositor, amount);
    }

    function closeHedge(address sender) external onlyOwner {
        // Retrieve the orderKey for the sender
        bytes32 orderKey = orderKeys[sender];

        // Perform necessary logic to close the hedge (implementation depends on your requirements)

        // Emit HedgeClosed event
        emit HedgeClosed(sender, orderKey, /*sizeDeltaUsd*/); // Pass the correct sizeDeltaUsd value

        // Clear the orderKey from storage
        delete orderKeys[sender];
    }
}

// Define the interfaces for the external contracts
interface IExchangeRouter {
    function createOrder(CreateOrderParams calldata params) external returns (bytes32);
}

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

interface IVaultToken {
    function mint(address to, uint256 amount) external;
}