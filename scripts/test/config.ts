import { Wallet } from "ethers";
import { ethers, network } from "hardhat";

export const domain = {
  name: "MintForest",
  version: "1",
  chainId: 1687,
  verifyingContract: "0x12906892aaa384ad59f2c431867af6632c68100a",
};

export async function getContract() {
  const provider = new ethers.JsonRpcProvider((network.config as any).url);
  const signer = new Wallet(process.env.SIGNER_KEY as string, provider);
  const [deployer] = await ethers.getSigners();
  const V1contract = await ethers.getContractFactory("MintForestV1", deployer);
  const contract: any = await V1contract.attach(domain.verifyingContract);
  return { contract, signer, deployer };
}
