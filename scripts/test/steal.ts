import moment from "moment";
import { domain, getContract } from "./config";

async function main() {
  const { contract, signer, deployer } = await getContract();
  const stealParams = {
    target: "0xFD95c4496A60272Fc7DD6Ae9d10896790955fC9c".toLocaleLowerCase(),
    time: moment().utc().startOf("day").unix(),
    point: 1200,
  };
  await contract.steal(
    stealParams,
    signer.signTypedData(
      domain,
      {
        StealParams: [
          { name: "user", type: "address" },
          { name: "target", type: "address" },
          { name: "time", type: "uint64" },
          { name: "point", type: "uint256" },
        ],
      },
      { user: deployer.address, ...stealParams }
    )
  );
}

main();
