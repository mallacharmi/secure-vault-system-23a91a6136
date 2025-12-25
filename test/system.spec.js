const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Secure Vault System", function () {
  let authManager;
  let vault;
  let deployer;
  let user;
  let recipient;

  beforeEach(async function () {
    [deployer, user, recipient] = await ethers.getSigners();

    // Deploy AuthorizationManager
    const AuthorizationManager = await ethers.getContractFactory(
      "AuthorizationManager"
    );
    authManager = await AuthorizationManager.deploy();
    await authManager.waitForDeployment();

    // Deploy SecureVault
    const SecureVault = await ethers.getContractFactory("SecureVault");
    vault = await SecureVault.deploy(await authManager.getAddress());
    await vault.waitForDeployment();

    // Initialize AuthorizationManager
    await authManager.initialize(await vault.getAddress());
  });

  it("accepts deposits", async function () {
    await deployer.sendTransaction({
      to: await vault.getAddress(),
      value: ethers.parseEther("1"),
    });

    const balance = await ethers.provider.getBalance(
      await vault.getAddress()
    );
    expect(balance).to.equal(ethers.parseEther("1"));
  });

  it("allows authorized withdrawal exactly once", async function () {
    // Deposit ETH
    await deployer.sendTransaction({
      to: await vault.getAddress(),
      value: ethers.parseEther("1"),
    });

    const amount = ethers.parseEther("0.5");
    const nonce = 1;

    // Build authorization hash (same as contract)
    const authHash = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256", "address", "uint256", "uint256"],
        [
          await vault.getAddress(),
          1337,
          recipient.address,
          amount,
          nonce,
        ]
      )
    );

    // Sign authorization
    const signature = await deployer.signMessage(
      ethers.getBytes(authHash)
    );

    // Withdraw
    await expect(
      vault.withdraw(recipient.address, amount, nonce, signature)
    ).to.not.be.reverted;

    // Reuse same authorization → must fail
    await expect(
      vault.withdraw(recipient.address, amount, nonce, signature)
    ).to.be.revertedWith("Authorization already used");
  });

  it("rejects withdrawal with invalid authorization", async function () {
    const amount = ethers.parseEther("0.1");

    await expect(
      vault.withdraw(recipient.address, amount, 99, "0x")
    ).to.be.reverted;
  });
});
