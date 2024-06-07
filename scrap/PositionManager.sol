// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * @title Short Funding Bot
 * @license Apache 2.0
 * @author Volume.finance
 */

interface Bot {
    function deposit(uint256 amount0, CreateOrderParams calldata orderParams, uint256 swapMinAmount) external returns (uint256);
    function withdraw(uint256 amount0, CreateOrderParams calldata orderParams, uint256 swapMinAmount) external returns (uint256);
}

interface Router {
    function sendWnt(address receiver, uint256 amount) external payable;
    function sendTokens(address token, address receiver, uint256 amount) external payable;
    function createOrder(CreateOrderParams calldata params) external returns (bytes32);
}

interface ERC20 {
    function balanceOf(address owner) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract ShortFundingBot {

    struct CreateOrderParamsAddresses {
        address receiver;
        address callbackContract;
        address uiFeeReceiver;
        address market;
        address initialCollateralToken;
        address[] swapPath;
    }

    struct CreateOrderParamsNumbers {
        uint256 sizeDeltaUsd;
        uint256 initialCollateralDeltaAmount;
        uint256 triggerPrice;
        uint256 acceptablePrice;
        uint256 executionFee;
        uint256 callbackGasLimit;
        uint256 minOutputAmount;
    }

    enum OrderType {
        MarketSwap,
        LimitSwap,
        MarketIncrease,
        LimitIncrease,
        MarketDecrease,
        LimitDecrease,
        StopLossDecrease,
        Liquidation
    }

    enum DecreasePositionSwapType {
        NoSwap,
        SwapPnlTokenToCollateralToken,
        SwapCollateralTokenToPnlToken
    }

    struct CreateOrderParams {
        CreateOrderParamsAddresses addresses;
        CreateOrderParamsNumbers numbers;
        OrderType orderType;
        DecreasePositionSwapType decreasePositionSwapType;
        bool isLong;
        bool shouldUnwrapNativeToken;
        bytes32 referralCode;
    }

    uint256 public constant MAX_SIZE = 8;
    uint256 public constant DENOMINATOR = 10**18;
    address public constant GMX_ROUTER = 0x7C68C7866A64FA2160F78EEaE12217FFbf871fa8;
    address public constant ORDER_VAULT = 0x31eF83a530Fde1B38EE9A18093A333D8Bbbc40D5;
    address public constant USDC = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;
    address public constant WETH = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;
    address public constant GMX_MARKET = 0x6853EA96FF216fAb11D2d930CE3C508556A4bdc4;
    
    mapping(address => address) public botToOwner;
    address public blueprint;
    address public compass;
    bytes32 public paloma;

    event BotDeployed(address indexed owner, address indexed bot);
    event Deposited(address indexed bot, uint256 amount0, CreateOrderParams orderParams);
    event Withdrawn(address indexed bot, uint256 amount0, CreateOrderParams orderParams);
    event Canceled(address indexed bot);
    event UpdateBlueprint(address oldBlueprint, address newBlueprint);
    event UpdateCompass(address oldCompass, address newCompass);
    event SetPaloma(bytes32 paloma);

    constructor(address _blueprint, address _compass) {
        blueprint = _blueprint;
        compass = _compass;
        emit UpdateCompass(address(0), _compass);
        emit UpdateBlueprint(address(0), _blueprint);
    }

    function deployBot() external {
        address bot = createFromBlueprint(blueprint, msg.sender);
        botToOwner[bot] = msg.sender;
        emit BotDeployed(msg.sender, bot);
    }

    function deposit(address bot, uint256 amount0, CreateOrderParams calldata orderParams, uint256 swapMinAmount) external returns (uint256) {
        _palomaCheck();
        emit Deposited(bot, amount0, orderParams);
        return Bot(bot).deposit(amount0, orderParams, swapMinAmount);
    }

    function withdraw(address bot, uint256 amount0, CreateOrderParams calldata orderParams, uint256 swapMinAmount) external returns (uint256) {
        _palomaCheck();
        emit Withdrawn(bot, amount0, orderParams);
        return Bot(bot).withdraw(amount0, orderParams, swapMinAmount);
    }

    function depositedEvent(uint256 amount0, CreateOrderParams calldata orderParams) external {
        _botCheck();
        emit Deposited(msg.sender, amount0, orderParams);
    }

    function withdrawnEvent(uint256 amount0, CreateOrderParams calldata orderParams) external {
        _botCheck();
        emit Withdrawn(msg.sender, amount0, orderParams);
    }

    function canceledEvent() external {
        _botCheck();
        emit Canceled(msg.sender);
    }

    function updateCompass(address newCompass) external {
        _palomaCheck();
        compass = newCompass;
        emit UpdateCompass(msg.sender, newCompass);
    }

    function updateBlueprint(address newBlueprint) external {
        _palomaCheck();
        address oldBlueprint = blueprint;
        blueprint = newBlueprint;
        emit UpdateBlueprint(oldBlueprint, newBlueprint);
    }

    function setPaloma() external {
        require(msg.sender == compass && paloma == bytes32(0) && msg.data.length == 36, "Invalid");
        paloma = bytes32(slice(msg.data, 4, 32));
        emit SetPaloma(paloma);
    }

    receive() external payable {}

    function _palomaCheck() internal view {
        require(msg.sender == compass, "Not compass");
        require(paloma == bytes32(slice(msg.data, msg.data.length - 32, 32)), "Invalid paloma");
    }

    function _botCheck() internal view {
        require(botToOwner[msg.sender] != address(0), "Unauthorized");
    }

    function createFromBlueprint(address _blueprint, address owner) internal returns (address) {
        // Implement the logic to create a bot from a blueprint.
    }

    function slice(bytes memory data, uint start, uint length) pure returns (bytes memory) {
    bytes memory tempBytes;

    assembly {
        switch iszero(length)
        case 0 {
            tempBytes := mload(0x40)

            let lengthmod := and(length, 31)

            let mc := add(add(tempBytes, lengthmod), mul(0x20, iszero(lengthmod)))
            let end := add(mc, length)

            for {
                let cc := add(add(data, lengthmod), mul(0x20, iszero(lengthmod)))
            } lt(mc, end) {
                mc := add(mc, 0x20)
                cc := add(cc, 0x20)
            } {
                mstore(mc, mload(cc))
            }

            mstore(tempBytes, length)

            mstore(0x40, and(add(mc, 31), not(31)))
        }
        default {
            tempBytes := mload(0x40)
            mstore(tempBytes, 0)
            mstore(0x40, add(tempBytes, 0x20))
        }
    }

    return tempBytes;
}


}



