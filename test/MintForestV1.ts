import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat"
import moment from 'moment';


function generateWallet() {
  const wallet = new ethers.Wallet('0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61', provider);
  return wallet;
}


const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545')

describe("MintForestV1", function () {
  async function deployFixture() {
    const V1contract = await ethers.getContractFactory("MintForestV1");
    const [owner] = await ethers.getSigners();
    const v1contract = await upgrades.deployProxy(V1contract as any, ['0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'], {
      initializer: "initialize",
      kind: "uups",
    });
    const contract = await v1contract.waitForDeployment();
    const publicUser = generateWallet();

    const contractAddress = await contract.getAddress();
    const { chainId } = await provider.getNetwork();
    const domain = {
      name: "www.mintchain.io",
      version: "1",
      chainId,
      verifyingContract: contractAddress
    };
    return {
      contract,
      owner,
      publicUser,
      domain
    };
  }

  async function setRightSigner(contract: any) {
    const wallet = new ethers.Wallet('0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e', provider);
    await contract.setSigner(wallet.address);
    return { signer: wallet }
  }

  describe("Deployment", function () {
    it("Set right owner", async () => {
      const { contract, owner } = await loadFixture(deployFixture);
      await expect(await contract.owner()).to.equal(owner.address);
    });
  });

  describe('Save Message', function () {
    it("Should't date verified", async () => {
      const { contract, publicUser, domain } = await loadFixture(deployFixture);
      const contractCaller: any = contract.connect(publicUser);

      const signParams = {
        userAddress: publicUser.address,
        time: moment().unix(),
        point: 500
      }

      await expect(contractCaller.signin(signParams, publicUser.signTypedData(domain, {
        SigninParams: [
          { name: "userAddress", type: "address" },
          { name: "time", type: "uint256" },
          { name: "point", type: "uint256" }
        ]
      }, signParams))).to.be.revertedWithCustomError(contract, "InvalidTime")
    })

    it("Should't signature verified", async () => {
      const { contract, publicUser, domain } = await loadFixture(deployFixture);
      const contractCaller: any = contract.connect(publicUser);

      const signParams = {
        time: moment().utc().startOf('day').unix(),
        point: 500
      }

      await expect(contractCaller.signin(signParams, publicUser.signTypedData(domain, {
        SigninParams: [
          { name: "user", type: "address" },
          { name: "time", type: "uint64" },
          { name: "point", type: "uint256" }
        ]
      }, { user: publicUser.address, ...signParams }))).to.be.revertedWithCustomError(contract, "InvalidSignature")
    })

    it("Should't insert twice data", async () => {
      const { contract, publicUser, domain } = await loadFixture(deployFixture);
      const contractCaller: any = contract.connect(publicUser);
      const { signer } = await setRightSigner(contract);
      const signParams = {
        time: moment().utc().startOf('day').unix(),
        point: 500
      }
      const signAgainParams = {
        time: moment().utc().startOf('day').unix(),
        point: 1000
      }

      await contractCaller.signin(signParams, signer.signTypedData(domain, {
        SigninParams: [
          { name: "user", type: "address" },
          { name: "time", type: "uint64" },
          { name: "point", type: "uint256" }
        ]
      }, { user: publicUser.address, ...signParams }));
      await expect(contractCaller.signin(signAgainParams, signer.signTypedData(domain, {
        SigninParams: [
          { name: "user", type: "address" },
          { name: "time", type: "uint64" },
          { name: "point", type: "uint256" }
        ]
      }, { user: publicUser.address, ...signAgainParams }))).to.be.revertedWithCustomError(contract, 'DuplicateData')

    })

    describe("Simulate real user behavior", () => {
      it("User daily signin", async () => {
        const { contract, publicUser, domain } = await loadFixture(deployFixture);
        const contractCaller: any = contract.connect(publicUser);
        const { signer } = await setRightSigner(contract);
        const signParams = {
          time: moment().utc().startOf('day').unix(),
          point: 500
        }

        await contractCaller.signin(signParams, signer.signTypedData(domain, {
          SigninParams: [
            { name: "user", type: "address" },
            { name: "time", type: "uint64" },
            { name: "point", type: "uint256" }
          ]
        }, { user: publicUser.address, ...signParams }));
        await expect(await contract.signinRecord(publicUser.address, signParams.time)).to.be.equal(signParams.point)
      })

      it("User steal other unclaimed ME", async () => {
        const { contract, publicUser, domain } = await loadFixture(deployFixture);
        const contractCaller: any = contract.connect(publicUser);
        const { signer } = await setRightSigner(contract);

        const stealParams = {
          target: ethers.Wallet.createRandom().address,
          time: moment().utc().startOf('day').unix(),
          point: 500
        }

        await contractCaller.steal(stealParams, signer.signTypedData(domain, {
          StealParams: [
            { name: "user", type: "address" },
            { name: "target", type: "address" },
            { name: "time", type: "uint64" },
            { name: "point", type: "uint256" }
          ]
        }, { user: publicUser.address, ...stealParams }));
        await expect(await contract.stealRecord(stealParams.target, stealParams.time)).to.be.equal(stealParams.point)
      })

      it("User open reward", async () => {
        const { contract, publicUser, domain } = await loadFixture(deployFixture);
        const { signer } = await setRightSigner(contract);
        const contractCaller: any = contract.connect(publicUser);

        const rewardParams = {
          rewardId: 1,
          point: 123123
        }

        await contractCaller.openReward(rewardParams, signer.signTypedData(domain, {
          RewardParams: [
            { name: "user", type: "address" },
            { name: "rewardId", type: "uint256" },
            { name: "point", type: "uint256" }
          ]
        }, { user: publicUser.address, ...rewardParams }));

        await expect(await contract.rewardRecord(publicUser.address, rewardParams.rewardId)).to.be.equal(rewardParams.point)
      })

      it("User turntable", async () => {
        const { contract, publicUser, domain } = await loadFixture(deployFixture);
        const { signer } = await setRightSigner(contract);
        const contractCaller: any = contract.connect(publicUser);

        const turntableParams = {
          time: moment().utc().startOf('day').unix(),
          count: 1,
          point: 123123
        }

        await contractCaller.turntable(turntableParams, signer.signTypedData(domain, {
          TurntableParams: [
            { name: "user", type: "address" },
            { name: "time", type: "uint64" },
            { name: "count", type: "uint16" },
            { name: "point", type: "uint256" }
          ]
        }, { user: publicUser.address, ...turntableParams }));

        await expect(await contract.turntableRecord(publicUser.address, turntableParams.time, turntableParams.count)).to.be.equal(turntableParams.point)
      })

    })
  })
});
