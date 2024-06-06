// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * @title Short Funding Bot
 * @license Apache 2.0
 * @notice This contract is created by Volume.finance
 */
import { OrderStorage } from "./OrderStorage.sol";


interface Router {
    function sendWnt(address receiver, uint256 amount) external payable;
    function sendTokens(address token, address receiver, uint256 amount) external payable;
    function createOrder(CreateOrderParams calldata params) external returns (bytes32);
}

interface ERC20 {
    function balanceOf(address owner) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

interface Factory {
    function deposited_event(uint256 amount0, CreateOrderParams calldata order_params) external;
    function withdrawn_event(uint256 amount0, CreateOrderParams calldata order_params) external;
    function canceled_event() external;
}

contract HedgePositionManager is OrderStorage {

    
    uint256 public constant MAX_SIZE = 8;
    uint256 public constant DENOMINATOR = 10**18;
    address public constant GMX_ROUTER = 0x7C68C7866A64FA2160F78EEaE12217FFbf871fa8;
    address public constant ORDER_VAULT = 0x31eF83a530Fde1B38EE9A18093A333D8Bbbc40D5;
  //  address public constant USDC = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;
    address public constant WETH = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;
    address public constant GMX_MARKET = 0x6853EA96FF216fAb11D2d930CE3C508556A4bdc4;
    address public immutable ORDER_STORAGE;


    constructor() {}

    function _safeTransfer(address _token, address _to, uint256 _value) internal {
        require(ERC20(_token).transfer(_to, _value), "Failed transfer");
    }

    function _safeTransferFrom(address _token, address _from, address _to, uint256 _value) internal {
        require(ERC20(_token).transferFrom(_from, _to, _value), "Failed transferFrom");
    }

    // caller must be vault
    // can pass vault ID instead - Vault ID refers to the orderStorage struct
    function deposit(uint256 amount0, uint256 vaultId, uint256 swapMinAmount) external returns (uint256) {
        // from vault
        _safeTransferFrom(WETH, OWNER, GMX_ROUTER, amount0);

        // get order params
        CreateOrderParams memory params = orderParams[vaultId];
       
        Router(GMX_ROUTER).createOrder(params);
        
    }

    function _withdraw(uint256 amount0, CreateOrderParams calldata orderParams, uint256 swapMinAmount) internal returns (uint256) {
        Router(GMX_ROUTER).createOrder(orderParams);
        CreateOrderParams memory swapParams = CreateOrderParams({
            addresses: CreateOrderParamsAddresses({
                receiver: address(this),
                callbackContract: address(0),
                uiFeeReceiver: address(0),
                market: address(0),
                initialCollateralToken: WETH,
                swapPath: new address 
            }),
            numbers: CreateOrderParamsNumbers({
                sizeDeltaUsd: 0,
                initialCollateralDeltaAmount: 0,
                triggerPrice: 0,
                acceptablePrice: 0,
                executionFee: 0,
                callbackGasLimit: 0,
                minOutputAmount: swapMinAmount
            }),
            orderType: OrderType.MarketSwap,
            decreasePositionSwapType: DecreasePositionSwapType.NoSwap,
            isLong: false,
            shouldUnwrapNativeToken: true,
            referralCode: bytes32(0)
        });
        swapParams.addresses.swapPath[0] = GMX_MARKET;
        _safeTransfer(WETH, GMX_ROUTER, amount0);
        uint256 bal = ERC20(USDC).balanceOf(address(this));
        Router(GMX_ROUTER).createOrder(swapParams);
        bal = ERC20(USDC).balanceOf(address(this)) - bal;
        Factory(FACTORY).withdrawn_event(amount0, orderParams);
        return bal;
    }

    function withdraw(uint256 amount0, CreateOrderParams calldata orderParams, uint256 swapMinAmount) external returns (uint256) {
        _checkSender(msg.sender, FACTORY);
        return _withdraw(amount0, orderParams, swapMinAmount);
    }

    function withdrawAndEndBot(uint256 amount0, CreateOrderParams calldata orderParams, uint256 swapMinAmount) external returns (uint256) {
        _checkSender(msg.sender, OWNER);
        uint256 amount = _withdraw(amount0, orderParams, swapMinAmount);
        _safeTransfer(USDC, OWNER, ERC20(USDC).balanceOf(address(this)));
        Factory(FACTORY).canceled_event();
        return amount;
    }

    function endBot() external {
        _checkSender(msg.sender, OWNER);
        _safeTransfer(USDC, OWNER, ERC20(USDC).balanceOf(address(this)));
        Factory(FACTORY).canceled_event();
    }

    receive() external payable {}
}
