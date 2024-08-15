import { ethers, upgrades } from "hardhat";

function delay(s: number) {
  return new Promise((res, rej) => {
    setTimeout(res, s * 1000, "done");
  });
}

const PROXY = "";
const IMPLEMENT = "";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address: " + deployer.address);
  await delay(3);
  console.log("Deploying.....");
  const contract = await ethers.getContractFactory("MintForestV1", deployer);
  const contractDeployed: any = await contract.attach(PROXY);
  console.log(await contractDeployed.stake([132]));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
