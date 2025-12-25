const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting Secure Vault deployment");

  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deployer address:", deployer.address);

  const network = await hre.ethers.provider.getNetwork();
  console.log("🌐 Network name:", hre.network.name);
  console.log("🔢 Chain ID:", network.chainId.toString());

  // 1️⃣ Deploy AuthorizationManager (no vault yet)
  const AuthorizationManager = await hre.ethers.getContractFactory(
    "AuthorizationManager"
  );
  const authManager = await AuthorizationManager.deploy();
  await authManager.waitForDeployment();

  const authManagerAddress = await authManager.getAddress();
  console.log("✅ AuthorizationManager deployed at:", authManagerAddress);

  // 2️⃣ Deploy SecureVault with AuthorizationManager address
  const SecureVault = await hre.ethers.getContractFactory("SecureVault");
  const vault = await SecureVault.deploy(authManagerAddress);
  await vault.waitForDeployment();

  const vaultAddress = await vault.getAddress();
  console.log("✅ SecureVault deployed at:", vaultAddress);

  // 3️⃣ Initialize AuthorizationManager with Vault address
  const tx = await authManager.initialize(vaultAddress);
  await tx.wait();

  console.log("🔐 AuthorizationManager initialized with vault");
  console.log("🎉 Deployment completed successfully");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
