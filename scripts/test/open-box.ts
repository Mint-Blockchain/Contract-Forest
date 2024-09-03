import { domain, getContract } from "./config";

async function main() {
  const rewardParams = {
    rewardId: 1,
    point: 123123,
  };
  const { contract, signer, deployer } = await getContract();
  await contract.openReward(
    rewardParams,
    signer.signTypedData(
      domain,
      {
        RewardParams: [
          { name: "user", type: "address" },
          { name: "rewardId", type: "uint256" },
          { name: "point", type: "uint256" },
        ],
      },
      { user: deployer.address, ...rewardParams }
    )
  );
}

main();
