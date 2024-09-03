import moment from "moment";
import { domain, getContract } from "./config";

async function main() {
  const signParams = {
    time: moment().utc().startOf("day").unix(),
    point: 500,
  };
  const { contract, signer, deployer } = await getContract();
  await contract.signin(
    signParams,
    signer.signTypedData(
      domain,
      {
        SigninParams: [
          { name: "user", type: "address" },
          { name: "time", type: "uint64" },
          { name: "point", type: "uint256" },
        ],
      },
      { user: deployer.address, ...signParams }
    )
  );
}

main();
