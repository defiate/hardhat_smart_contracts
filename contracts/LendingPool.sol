// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

interface pTRYTokenInterface {
    function mint(address to, uint256 amount) external;

    function burnFrom(address account, uint256 amount) external;

    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);
}

interface IERC20 {
    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);
}

error NotEnoughApproval();
error NotUnderCollateralize();

contract LendingPool is AccessControl {
    /* Variables */
    bytes32 public constant COLLATERAL_ADMIN_ROLE =
        keccak256("COLLATERAL_ADMIN_ROLE");

    IERC20 private immutable i_CollateralToken;
    pTRYTokenInterface private immutable i_pTRYToken;
    AggregatorV3Interface private immutable i_oracle;

    struct Vault {
        uint256 margin;
        uint256 dept;
    }

    Vault public vault;
    uint8 private s_minCollateralRatio;

    constructor(pTRYTokenInterface _pTRYToken, address _oracle) {
        i_CollateralToken = IERC20(0xDF1742fE5b0bFc12331D8EAec6b478DfDbD31464); // DAI on goerli testnet
        i_pTRYToken = pTRYTokenInterface(_pTRYToken);
        i_oracle = AggregatorV3Interface(_oracle);
        _grantRole(COLLATERAL_ADMIN_ROLE, msg.sender);
        s_minCollateralRatio = 10;
    }

    /**@dev Mint pTRY token
     * @notice Only acceptable collateral is DAI
     * @param amount requested amount to mint
     */
    function mintPTRY(uint256 amount) external {
        uint256 reqCollateral = getRequiredCollateral(amount);
        if (
            i_CollateralToken.allowance(msg.sender, address(this)) <
            reqCollateral
        ) revert NotEnoughApproval();
        vault.dept += amount;
        vault.margin += reqCollateral;
        i_CollateralToken.transferFrom(
            msg.sender,
            address(this),
            reqCollateral
        );
        i_pTRYToken.mint(msg.sender, amount);
    }

    function burnPTRY(uint256 amount) external {
        if (i_pTRYToken.allowance(msg.sender, address(this)) < amount)
            revert NotEnoughApproval();

        uint256 reqCollateral = getRequiredCollateral(amount);
        i_pTRYToken.burnFrom(msg.sender, amount);
        i_CollateralToken.transfer(msg.sender, reqCollateral);
        vault.dept -= amount;
        vault.margin -= reqCollateral;
    }

    function setCollateralRatio(
        uint8 _ratio
    ) external onlyRole(COLLATERAL_ADMIN_ROLE) {
        s_minCollateralRatio = _ratio;
    }

    function liquidate() public {
        if (!checkLiquidation()) revert NotUnderCollateralize();

        uint256 _debt = vault.dept;
        uint256 _margin = vault.margin;
        if (i_pTRYToken.allowance(msg.sender, address(this)) < _debt)
            revert NotEnoughApproval();

        i_pTRYToken.burnFrom(msg.sender, _debt);
        i_CollateralToken.transfer(msg.sender, _margin);
        vault.dept -= _debt;
        vault.margin -= _margin;
    }

    function checkLiquidation() public view returns (bool) {
        uint256 collateralRatio = checkCollateralRatio();
        if (collateralRatio < s_minCollateralRatio) {
            return true;
        } else {
            return false;
        }
    }

    function checkCollateralRatio()
        public
        view
        returns (uint256 collateralRatio_)
    {
        collateralRatio_ = uint256(
            ((vault.margin - getRequiredCollateral(vault.dept)) /
                vault.margin) * 100
        );
    }

    function getRate() public view returns (int256 answer_) {
        (, answer_, , , ) = i_oracle.latestRoundData();
    }

    function getPTRYToken() external view returns (address) {
        return address(i_pTRYToken);
    }

    function getCollateralToken() external view returns (address) {
        return address(i_CollateralToken);
    }

    function getRequiredCollateral(
        uint256 amount
    ) private view returns (uint256 reqCollateral_) {
        uint256 _rate = uint256(getRate());
        reqCollateral_ = (amount * _rate) / 100000000;
    }
}
