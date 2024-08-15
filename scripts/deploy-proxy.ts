import { ethers, upgrades } from "hardhat";

async function main() {
  const V1contract = await ethers.getContractFactory("MintForestV1");
  console.log("Deploying V1contract...");
  const v1contract = await upgrades.deployProxy(V1contract as any, ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'], {
    initializer: "initialize",
    kind: "uups",
  });
  await v1contract.waitForDeployment();
  console.log("V1 Contract deployed to:", await v1contract.getAddress());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
