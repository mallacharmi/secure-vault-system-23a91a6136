// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAuthorizationManager {
    function verifyAuthorization(
        address recipient,
        uint256 amount,
        uint256 nonce,
        bytes calldata signature
    ) external returns (bool);
}

/**
 * @title SecureVault
 * @notice Holds ETH and executes authorized withdrawals
 */
contract SecureVault {
    IAuthorizationManager public authorizationManager;

    event Deposit(address indexed from, uint256 amount);
    event Withdrawal(address indexed to, uint256 amount);

    constructor(address _authorizationManager) {
        require(_authorizationManager != address(0), "Invalid auth manager");
        authorizationManager = IAuthorizationManager(_authorizationManager);
    }

    /**
     * @notice Accept ETH deposits
     */
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @notice Withdraw ETH after authorization validation
     */
    function withdraw(
        address payable recipient,
        uint256 amount,
        uint256 nonce,
        bytes calldata signature
    ) external {
        require(address(this).balance >= amount, "Insufficient vault balance");

        // Ask AuthorizationManager to validate permission
        bool authorized = authorizationManager.verifyAuthorization(
            recipient,
            amount,
            nonce,
            signature
        );
        require(authorized, "Authorization failed");

        // Effects before interaction
        emit Withdrawal(recipient, amount);

        // Transfer ETH
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "ETH transfer failed");
    }
}
