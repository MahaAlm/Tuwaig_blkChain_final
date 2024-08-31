import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("Voting", function(){
  it("should create a proposal", async function() {
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();
    await voting.waitForDeployment();
    const [owner,other] = await hre.ethers.getSigners();

    const tx = await voting.connect(owner).CreateProp("John Doe proposal");
    // Optional: Log the transaction receipt if it contains events that might be useful

    const proposal = await voting.getProp(0);
    expect(proposal.retTxt).to.equal("John Doe proposal");
});

  it("Should mint and vote", async function () {
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();
    await voting.waitForDeployment();

    const [owner, Aziz, notVoter] = await hre.ethers.getSigners();

    await voting.mint(owner.address, 100);
    await voting.mint(Aziz.address, 100);

    await voting.connect(owner).CreateProp("Proposal 1");
    await voting.connect(Aziz).CreateProp("Proposal 2");

    await voting.connect(owner).Vote(0, true);
    await voting.connect(Aziz).Vote(1, false);

    const proposal1 = await voting.proposals(0);
    const proposal2 = await voting.proposals(1);

    expect(proposal1.yesVotes).to.equal(1);
    expect(proposal1.noVotes).to.equal(0);
    expect(proposal2.yesVotes).to.equal(0);
    expect(proposal2.noVotes).to.equal(1);
  });

  it("shouldn't vote if not Voter", async function(){
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();
    await voting.waitForDeployment();

    const [owner, notVoter] = await hre.ethers.getSigners();

    await voting.mint(owner.address, 100);

    await voting.connect(owner).CreateProp("Proposal 1");

    expect(!voting.connect(notVoter).Vote(0, true));

  });

  it("shouldn't vote if more or equal to five", async function(){
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();
    await voting.waitForDeployment();

    const [owner, voter1,voter2,voter3,voter4,voter5] = await hre.ethers.getSigners();

    await voting.mint(owner.address, 100);
    await voting.mint(voter1.address, 100);
    await voting.mint(voter2.address, 100);
    await voting.mint(voter3.address, 100);
    await voting.mint(voter4.address, 100);
    await voting.mint(voter5.address, 100);

    await voting.connect(owner).CreateProp("Proposal 1");

    await voting.connect(voter1).Vote(0, true);
    await voting.connect(voter2).Vote(0, true);
    await voting.connect(voter3).Vote(0, true);
    await voting.connect(voter4).Vote(0, true);
    await voting.connect(voter5).Vote(0, true);

    expect(!voting.connect(owner).Vote(0, true));

  });
  it("shouldn't vote if already voted", async function(){
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();
    await voting.waitForDeployment();

    const [owner, voter] = await hre.ethers.getSigners();

    await voting.mint(owner.address, 100);
    await voting.mint(voter.address, 100);

    await voting.connect(owner).CreateProp("Proposal 1");
    await voting.connect(voter).Vote(0, true);

    expect(!voting.connect(voter).Vote(0, false));

  });
});