import { ethers, upgrades } from "hardhat";

function delay(s: number) {
  return new Promise((res, rej) => {
    setTimeout(res, s * 1000, "done");
  });
}

const PROXY = "0x12906892AaA384ad59F2c431867af6632c68100a";
const IMPLEMENT = "";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address: " + deployer.address);
  await delay(3);
  console.log("Deploying.....");
  const contract = await ethers.getContractFactory("MintForestV2", deployer);
  await upgrades.upgradeProxy(PROXY, contract);
  console.log("Upgrade successful.....");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
