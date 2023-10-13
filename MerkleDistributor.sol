// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20 {
    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function balanceOf(address account) external view returns (uint256);
}

contract MerkleDistributor is Ownable {
    bytes32 public merkleRoot;
    IERC20 public rewardToken;
    mapping(address => bool) public claimed;

    event Claimed(address indexed user, uint256 amount);

    constructor(
        address _rewardTokenAddress,
        bytes32 _merkleRoot,
        address _initialOwner
    ) Ownable(_initialOwner) {
        rewardToken = IERC20(_rewardTokenAddress);
        merkleRoot = _merkleRoot;
    }

    function claim(
        address user,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external {
        // Ensure the user hasn't claimed their reward yet
        require(!claimed[user], "Reward already claimed!");

        // Convert the uint256 reward to bytes32
        bytes32 fullRewardBytes = bytes32(amount);

        // Extract the last 12 bytes (24 characters in hex) from the bytes32 representation
        bytes12 rewardBytes = bytes12(fullRewardBytes << 160);

        // Concatenate and hash the user's address and truncated reward
        bytes32 leaf = keccak256(abi.encodePacked(user, rewardBytes));

        bytes32 node = leaf;
        for (uint256 i = 0; i < merkleProof.length; i++) {
            if (node < merkleProof[i]) {
                node = keccak256(abi.encodePacked(node, merkleProof[i]));
            } else {
                node = keccak256(abi.encodePacked(merkleProof[i], node));
            }
        }

        // Ensure the computed node (hash) matches the stored Merkle root
        require(node == merkleRoot, "Invalid Merkle proof");

        // Mark the reward as claimed for this user
        claimed[user] = true;

        // Transfer the reward to the user
        require(rewardToken.transfer(user, amount), "Reward transfer failed!");

        emit Claimed(user, amount);
    }

    function uintToBytes(uint256 value) internal pure returns (bytes memory) {
        bytes32 result = bytes32(value);
        return abi.encodePacked(result);
    }

    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount should be greater than 0");
        uint256 contractBalance = rewardToken.balanceOf(address(this));
        require(contractBalance >= amount, "Insufficient contract balance");
        require(rewardToken.transfer(owner(), amount), "Withdrawal failed");
    }
}
