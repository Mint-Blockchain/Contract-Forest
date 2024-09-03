import moment from "moment";
import { domain, getContract } from "./config";

async function main() {
  const turntableParams = {
    time: moment().utc().startOf("day").unix(),
    count: 1,
    point: 123123,
  };

  const { contract, signer, deployer } = await getContract();
  await contract.turntable(
    turntableParams,
    signer.signTypedData(
      domain,
      {
        TurntableParams: [
          { name: "user", type: "address" },
          { name: "time", type: "uint64" },
          { name: "count", type: "uint16" },
          { name: "point", type: "uint256" },
        ],
      },
      { user: deployer.address, ...turntableParams }
    )
  );
}

main();
