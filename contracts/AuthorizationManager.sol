// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract AuthorizationManager {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    mapping(bytes32 => bool) public consumedAuthorizations;

    address public vault;
    bool public initialized;

    event AuthorizationConsumed(bytes32 indexed authorizationHash);
    event VaultInitialized(address indexed vault);

    // ❌ NO constructor with vault anymore
    constructor() {}

    function initialize(address _vault) external {
        require(!initialized, "Already initialized");
        require(_vault != address(0), "Invalid vault");
        vault = _vault;
        initialized = true;
        emit VaultInitialized(_vault);
    }

    function verifyAuthorization(
        address recipient,
        uint256 amount,
        uint256 nonce,
        bytes calldata signature
    ) external returns (bool) {
        require(initialized, "Not initialized");
        require(msg.sender == vault, "Only vault can call");

        bytes32 authorizationHash = keccak256(
            abi.encode(
                vault,
                block.chainid,
                recipient,
                amount,
                nonce
            )
        );

        require(!consumedAuthorizations[authorizationHash], "Authorization already used");

        address signer = authorizationHash
            .toEthSignedMessageHash()
            .recover(signature);

        require(signer != address(0), "Invalid signature");

        consumedAuthorizations[authorizationHash] = true;
        emit AuthorizationConsumed(authorizationHash);

        return true;
    }
}
