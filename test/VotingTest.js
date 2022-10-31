const { expectRevert, expectEvent, BN } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const Voting = artifacts.require("Voting");

contract("Voting", function (accounts) {
  const owner = accounts[0];
  const voterOne = accounts[1];
  const voterTwo = accounts[2];
  const voterThree = accounts[3];
  const notOwner = accounts[4];
  const notVoter = accounts[5];

  let VotingInstance;

  // ::::::::::::: CONTRACT CREATION ::::::::::::: //

  describe("Contract deployment", () => {
    before(async () => {
      VotingInstance = await Voting.new({ from: owner });
    });

    it("check the owner has created Voting contract", async () => {
      expect(await VotingInstance.owner()).to.equal(owner);
    });

    it("check the init workflow status is RegisteringVoters", async () => {
      const currentStatus = await VotingInstance.workflowStatus.call();
      expect(currentStatus).to.be.bignumber.equal(BN(0));
    });
  });

  // :::::::::::::::::::::::::: REGISTRATION and GETTER :::::::::::::::::::::::::: //

  describe("Adding and Getting a voter", () => {
    beforeEach(async () => {
      VotingInstance = await Voting.new({ from: owner });
    });

    it("check current workflow status is RegisteringVoters", async () => {
      const currentStatus = await VotingInstance.workflowStatus.call();
      expect(currentStatus).to.be.bignumber.equal(BN(0));
    });

    it("add a voter and check data", async () => {
      await VotingInstance.addVoter(voterOne, {
        from: owner,
      });
      resultGetVoter = await VotingInstance.getVoter(voterOne, {
        from: voterOne,
      });
      expect(resultGetVoter.isRegistered).to.equal(true);
      expect(resultGetVoter.hasVoted).to.equal(false);
      expect(resultGetVoter.votedProposalId).to.be.bignumber.equal(BN(0));
    });

  });

  // :::::::::::::::::::::::::: PROPOSAL AND GETTER ::::::::::::::::::::::::::: //

  describe("Adding and Getting a proposal", () => {
    beforeEach(async () => {
      VotingInstance = await Voting.new({ from: owner });
      await VotingInstance.addVoter(voterOne, {
        from: owner,
      });
      await VotingInstance.startProposalsRegistering({
        from: owner,
      });
    });

    it("check current workflow status is ProposalsRegistrationStarted", async () => {
      const currentStatus = await VotingInstance.workflowStatus.call();
      expect(currentStatus).to.be.bignumber.equal(BN(1));
    });

    it("add a proposal and check data", async () => {
      await VotingInstance.addProposal("First Proposal", {
        from: voterOne,
      });
      resultGetOneProposal = await VotingInstance.getOneProposal(BN(1), {
        from: voterOne,
      });
      expect(resultGetOneProposal.description).to.equal("First Proposal");
      expect(resultGetOneProposal.voteCount).to.be.bignumber.equal(BN(0));
    });

    it("check UNSPECIFIED : request a non existing proposal (to be fixed by development)", async () => {
      await expectRevert.unspecified(
        VotingInstance.getOneProposal(BN(1), {
          from: voterOne,
        })
      );
    });

    it("add several proposals and select the third one", async () => {
      await VotingInstance.addProposal("First Proposal", {
        from: voterOne,
      });
      await VotingInstance.addProposal("Second Proposal", {
        from: voterOne,
      });

      await VotingInstance.addProposal("Third Proposal", {
        from: voterOne,
      });

      await VotingInstance.addProposal("Fourth Proposal", {
        from: voterOne,
      });

      resultGetOneProposal = await VotingInstance.getOneProposal(BN(3), {
        from: voterOne,
      });
      expect(resultGetOneProposal.description).to.equal("Third Proposal");
      expect(resultGetOneProposal.voteCount).to.be.bignumber.equal(BN(0));
    });
  });

  // :::::::::::::::::::::::::: VOTE :::::::::::::::::::::::::: //

  describe("Setting a vote", () => {
    beforeEach(async () => {
      VotingInstance = await Voting.new({ from: owner });
      await VotingInstance.addVoter(voterOne, {
        from: owner,
      });
      await VotingInstance.addVoter(voterTwo, {
        from: owner,
      });
      await VotingInstance.addVoter(voterThree, {
        from: owner,
      });
      await VotingInstance.startProposalsRegistering({
        from: owner,
      });
      await VotingInstance.addProposal("First Proposal", {
        from: voterOne,
      });
      await VotingInstance.addProposal("Second Proposal", {
        from: voterOne,
      });
      await VotingInstance.endProposalsRegistering({
        from: owner,
      });
      await VotingInstance.startVotingSession({
        from: owner,
      });
    });

    it("check current workflow status is VotingSessionStarted", async () => {
      const currentStatus = await VotingInstance.workflowStatus.call();
      expect(currentStatus).to.be.bignumber.equal(BN(3));
    });

    it("set a vote to First Proposal and check data", async () => {

      // check data before Vote
      resultGetOneProposal = await VotingInstance.getOneProposal(BN(1), {
        from: voterOne,
      });
      expect(resultGetOneProposal.description).to.equal("First Proposal");
      expect(resultGetOneProposal.voteCount).to.be.bignumber.equal(BN(0));

      // set vote
      await VotingInstance.setVote(BN(1), {
        from: voterOne,
      });

      // check proposal counter has been update
      resultGetOneProposal = await VotingInstance.getOneProposal(BN(1), {
        from: voterOne,
      });
      expect(resultGetOneProposal.description).to.equal("First Proposal");
      expect(resultGetOneProposal.voteCount).to.be.bignumber.equal(BN(1));

      //check Voter ProposalID  has been updated
      resultGetVoter = await VotingInstance.getVoter(voterOne, {
        from: voterOne,
      });
      expect(resultGetVoter.isRegistered).to.equal(true);
      expect(resultGetVoter.hasVoted).to.equal(true);
      expect(resultGetVoter.votedProposalId).to.be.bignumber.equal(BN(1));
    });

    it("set three votes on two proposals and check data", async () => {
      await VotingInstance.setVote(BN(1), {
        from: voterOne,
      });
      await VotingInstance.setVote(BN(1), {
        from: voterTwo,
      });
      await VotingInstance.setVote(BN(2), {
        from: voterThree,
      });

      // check proposal's counter and has been update
      resultGetOneProposal = await VotingInstance.getOneProposal(BN(1), {
        from: voterOne,
      });
      expect(resultGetOneProposal.description).to.equal("First Proposal");
      expect(resultGetOneProposal.voteCount).to.be.bignumber.equal(BN(2));

      resultGetOneProposal = await VotingInstance.getOneProposal(BN(2), {
        from: voterOne,
      });
      expect(resultGetOneProposal.description).to.equal("Second Proposal");
      expect(resultGetOneProposal.voteCount).to.be.bignumber.equal(BN(1));

      //check Voter's ProposalID  has been updated
      resultGetVoter = await VotingInstance.getVoter(voterOne, {
        from: voterOne,
      });
      expect(resultGetVoter.isRegistered).to.equal(true);
      expect(resultGetVoter.hasVoted).to.equal(true);
      expect(resultGetVoter.votedProposalId).to.be.bignumber.equal(BN(1));

      resultGetVoter = await VotingInstance.getVoter(voterTwo, {
        from: voterOne,
      });
      expect(resultGetVoter.isRegistered).to.equal(true);
      expect(resultGetVoter.hasVoted).to.equal(true);
      expect(resultGetVoter.votedProposalId).to.be.bignumber.equal(BN(1));

      resultGetVoter = await VotingInstance.getVoter(voterThree, {
        from: voterOne,
      });
      expect(resultGetVoter.isRegistered).to.equal(true);
      expect(resultGetVoter.hasVoted).to.equal(true);
      expect(resultGetVoter.votedProposalId).to.be.bignumber.equal(BN(2));
    });
  });

  // :::::::::::::::::::::::::: STATE :::::::::::::::::::::::::: //

  describe("startProposalsRegistering", () => {
    beforeEach(async () => {
      VotingInstance = await Voting.new({ from: owner });
    });

    it("check current workflow status is RegisteringVoters", async () => {
      const currentStatus = await VotingInstance.workflowStatus.call();
      expect(currentStatus).to.be.bignumber.equal(BN(0));
    });

    it("check new current workflow status is ProposalsRegistrationStarted", async () => {
      await VotingInstance.startProposalsRegistering({
        from: owner,
      });
      const currentStatus = await VotingInstance.workflowStatus.call();
      expect(currentStatus).to.be.bignumber.equal(BN(1));
    });

    it("check initial proposal is 'GENESIS'", async () => {
      VotingInstance = await Voting.new({ from: owner });
      await VotingInstance.addVoter(voterOne, {
        from: owner,
      });
      await VotingInstance.startProposalsRegistering({
        from: owner,
      });
      resultGetOneProposal = await VotingInstance.getOneProposal(BN(0), {
        from: voterOne,
      });
      expect(resultGetOneProposal.description).to.equal("GENESIS");
      expect(resultGetOneProposal.voteCount).to.be.bignumber.equal(BN(0));
    });
  });

  describe("endProposalsRegistering", () => {
    beforeEach(async () => {
      VotingInstance = await Voting.new({ from: owner });
      await VotingInstance.startProposalsRegistering({
        from: owner,
      });
    });

    it("check current workflow status is ProposalsRegistrationStarted", async () => {
      const currentStatus = await VotingInstance.workflowStatus.call();
      expect(currentStatus).to.be.bignumber.equal(BN(1));
    });

    it("check new current workflow status is ProposalsRegistrationEnded", async () => {
      await VotingInstance.endProposalsRegistering({
        from: owner,
      });
      const currentStatus = await VotingInstance.workflowStatus.call();
      expect(currentStatus).to.be.bignumber.equal(BN(2));
    });
  });

  describe("startVotingSession", () => {
    beforeEach(async () => {
      VotingInstance = await Voting.new({ from: owner });
      await VotingInstance.startProposalsRegistering({
        from: owner,
      });
      await VotingInstance.endProposalsRegistering({
        from: owner,
      });
    });

    it("check before workflow status is ProposalsRegistrationEnded", async () => {
      const currentStatus = await VotingInstance.workflowStatus.call();
      expect(currentStatus).to.be.bignumber.equal(BN(2));
    });

    it("check new current workflow status is VotingSessionStarted", async () => {
      await VotingInstance.startVotingSession({
        from: owner,
      });
      const currentStatus = await VotingInstance.workflowStatus.call();
      expect(currentStatus).to.be.bignumber.equal(BN(3));
    });
  });

  describe("endVotingSession", () => {
    beforeEach(async () => {
      VotingInstance = await Voting.new({ from: owner });
      await VotingInstance.startProposalsRegistering({
        from: owner,
      });
      await VotingInstance.endProposalsRegistering({
        from: owner,
      });
      await VotingInstance.startVotingSession({
        from: owner,
      });
    });

    it("check before workflow status is VotingSessionStarted", async () => {
      const currentStatus = await VotingInstance.workflowStatus.call();
      expect(currentStatus).to.be.bignumber.equal(BN(3));
    });

    it("check new current workflow status is VotingSessionEnded", async () => {
      await VotingInstance.endVotingSession({
        from: owner,
      });
      const currentStatus = await VotingInstance.workflowStatus.call();
      expect(currentStatus).to.be.bignumber.equal(BN(4));
    });
  });

  describe("tallyVotes", () => {
    beforeEach(async () => {
      VotingInstance = await Voting.new({ from: owner });
      await VotingInstance.addVoter(voterOne, {
        from: owner,
      });
      await VotingInstance.addVoter(voterTwo, {
        from: owner,
      });
      await VotingInstance.addVoter(voterThree, {
        from: owner,
      });
      await VotingInstance.startProposalsRegistering({
        from: owner,
      });
      await VotingInstance.addProposal("First Proposal", {
        from: voterOne,
      });
      await VotingInstance.addProposal("Second Proposal", {
        from: voterOne,
      });
      await VotingInstance.endProposalsRegistering({
        from: owner,
      });
      await VotingInstance.startVotingSession({
        from: owner,
      });
      await VotingInstance.setVote(BN(1), {
        from: voterOne,
      });
      await VotingInstance.setVote(BN(1), {
        from: voterTwo,
      });
      await VotingInstance.setVote(BN(2), {
        from: voterThree,
      });
      await VotingInstance.endVotingSession({
        from: owner,
      });
    });

    it("check before workflow status is VotingSessionEnded", async () => {
      const currentStatus = await VotingInstance.workflowStatus.call();
      expect(currentStatus).to.be.bignumber.equal(BN(4));
    });

    it("check new current workflow status is VotingSessionEnded", async () => {
      await VotingInstance.tallyVotes({
        from: owner,
      });
      const currentStatus = await VotingInstance.workflowStatus.call();
      expect(currentStatus).to.be.bignumber.equal(BN(5));
    });

    it("check winningProposalID is equal to 1", async () => {
      await VotingInstance.tallyVotes({
        from: owner,
      });
      winningProposalID = await VotingInstance.winningProposalID.call();
      expect(winningProposalID).to.be.bignumber.equal(BN(1));
    });
  });

  // :::::::::::::::::::::::::: ALL REQUIRES :::::::::::::::::::::::::: //

  describe("Check requires", () => {
    beforeEach(async () => {
      VotingInstance = await Voting.new({ from: owner });
    });

    it("require addVoter: only the owner can add a voter", async () => {
      await expectRevert(
        VotingInstance.addVoter(voterOne, { from: notOwner }),
        "Ownable: caller is not the owner"
      );
    });

    it("require addVoter: a voter can't be addded twice", async () => {
      await VotingInstance.addVoter(voterOne, { from: owner });
      await expectRevert(
        VotingInstance.addVoter(voterOne, { from: owner }),
        "Already registered"
      );
    });

    it("require addVoter: voter registration must be opened", async () => {
      await VotingInstance.startProposalsRegistering({
        from: owner,
      });
      await expectRevert(
        VotingInstance.addVoter(voterOne, { from: owner }),
        "Voters registration is not open yet"
      );
    });

    it("require getVoter: only a voter can get a voter", async () => {
      await VotingInstance.addVoter(voterOne, { from: owner });
      await expectRevert(
        VotingInstance.getVoter(voterOne, { from: notVoter }),
        "You're not a voter"
      );
    });

    it("require addProposal: proposal registration must be opened", async () => {
      await VotingInstance.addVoter(voterOne, { from: owner });
      await expectRevert(
        VotingInstance.addProposal("First proposal", { from: voterOne }),
        "Proposals are not allowed yet"
      );
    });

    it("require addProposal: only a voter can add a proposal", async () => {
      await VotingInstance.startProposalsRegistering({ from: owner });
      await expectRevert(
        VotingInstance.addProposal("First proposal", { from: notVoter }),
        "You're not a voter"
      );
    });

    it("require addProposal: a proposal can't be empty", async () => {
      await VotingInstance.addVoter(voterOne, { from: owner });
      await VotingInstance.startProposalsRegistering({ from: owner });
      await expectRevert(
        VotingInstance.addProposal("", { from: voterOne }),
        "Vous ne pouvez pas ne rien proposer"
      );
    });

    it("require getOneProposal: only a voter can get a proposal", async () => {
      await VotingInstance.addVoter(voterOne, { from: owner });
      await VotingInstance.startProposalsRegistering({ from: owner });
      await expectRevert(
        VotingInstance.getOneProposal(BN(0), { from: notVoter }),
        "You're not a voter"
      );
    });

    it("require SetVote: only a voter can vote", async () => {
      VotingInstance = await Voting.new({ from: owner });
      await VotingInstance.addVoter(voterOne, { from: owner });
      await VotingInstance.startProposalsRegistering({ from: owner });
      await VotingInstance.addProposal("First Proposal", { from: voterOne });
      await VotingInstance.endProposalsRegistering({ from: owner });
      await VotingInstance.startVotingSession({ from: owner });
      await expectRevert(
        VotingInstance.setVote(BN(1), { from: notVoter }),
        "You're not a voter"
      );
    });

    it("require setVote: voting session must be opened", async () => {
      await VotingInstance.addVoter(voterOne, { from: owner });
      await VotingInstance.startProposalsRegistering({ from: owner });
      await VotingInstance.addProposal("First Proposal", { from: voterOne });
      await VotingInstance.endProposalsRegistering({ from: owner });
      await expectRevert(
        VotingInstance.setVote(BN(1), { from: voterOne }),
        "Voting session havent started yet"
      );
    });

    it("require setVote: proposal can't be empty", async () => {
      await VotingInstance.addVoter(voterOne, { from: owner });
      await VotingInstance.startProposalsRegistering({
        from: owner,
      });
      await expectRevert(
        VotingInstance.addProposal("", {
          from: voterOne,
        }),
        "Vous ne pouvez pas ne rien proposer"
      );
    });

    it("require setVote: proposal must exist", async () => {
      await VotingInstance.startProposalsRegistering({
        from: owner,
      });
      VotingInstance = await Voting.new({ from: owner });
      await VotingInstance.addVoter(voterOne, {
        from: owner,
      });
      await VotingInstance.startProposalsRegistering({
        from: owner,
      });
      await VotingInstance.addProposal("First Proposal", {
        from: voterOne,
      });
      await VotingInstance.endProposalsRegistering({
        from: owner,
      });
      await VotingInstance.startVotingSession({
        from: owner,
      });
      await expectRevert(
        VotingInstance.setVote(BN(2), {
          from: voterOne,
        }),
        "Proposal not found"
      );
    });

    it("require startProposalsRegistering: onlyOwner", async () => {
      await expectRevert(
        VotingInstance.startProposalsRegistering({
          from: notOwner,
        }),
        "Ownable: caller is not the owner"
      );
    });

    it("require startProposalsRegistering: workflow status is VotingSessionStarted", async () => {
      await VotingInstance.startProposalsRegistering({
        from: owner,
      }),
        await expectRevert(
          VotingInstance.startProposalsRegistering({
            from: owner,
          }),
          "Registering proposals cant be started now"
        );
    });

    it("require endProposalsRegistering: onlyOwner", async () => {
      await expectRevert(
        VotingInstance.endProposalsRegistering({
          from: notOwner,
        }),
        "Ownable: caller is not the owner"
      );
    });

    it("require endProposalsRegistering: ProposalsRegistrationStarted", async () => {
      await expectRevert(
        VotingInstance.endProposalsRegistering({
          from: owner,
        }),
        "Registering proposals havent started yet"
      );
    });

    it("require startVotingSession: onlyOwner", async () => {
      await expectRevert(
        VotingInstance.startVotingSession({
          from: notOwner,
        }),
        "Ownable: caller is not the owner"
      );
    });

    it("require startVotingSession: ProposalsRegistrationEnded", async () => {
      await expectRevert(
        VotingInstance.startVotingSession({
          from: owner,
        }),
        "Registering proposals phase is not finished"
      );
    });

    it("require endVotingSession: onlyOwner", async () => {
      await expectRevert(
        VotingInstance.endVotingSession({
          from: notOwner,
        }),
        "Ownable: caller is not the owner"
      );
    });

    it("require endVotingSession: VotingSessionStarted", async () => {
      await expectRevert(
        VotingInstance.endVotingSession({
          from: owner,
        }),
        "Voting session havent started yet"
      );
    });

    it("require tallyVotes: onlyOwner", async () => {
      await expectRevert(
        VotingInstance.tallyVotes({
          from: notOwner,
        }),
        "Ownable: caller is not the owner"
      );
    });

    it("require tallyVotes: VotingSessionEnded", async () => {
      await expectRevert(
        VotingInstance.tallyVotes({
          from: owner,
        }),
        "Current status is not voting session ended"
      );
    });
  });

  // :::::::::::::::::::::::::: ALL EVENTS :::::::::::::::::::::::::: //

  describe("Check events", () => {
    beforeEach(async () => {
      VotingInstance = await Voting.new({ from: owner });
    });

    it("event addVoter : a voter has been registered", async () => {
      const resultAddVoter = await VotingInstance.addVoter(voterOne, {
        from: owner,
      });
      expectEvent(resultAddVoter, "VoterRegistered", {
        voterAddress: voterOne,
      });
    });

    it("event addProposal : a proposal has been registered", async () => {
      await VotingInstance.addVoter(voterOne, { from: owner });
      await VotingInstance.startProposalsRegistering({
        from: owner,
      });
      const resultAddProposal = await VotingInstance.addProposal(
        "First proposal",
        {
          from: voterOne,
        }
      );
      expectEvent(resultAddProposal, "ProposalRegistered", {
        proposalId: BN(1),
      });
    });

    it("event setVote: has voted", async () => {
      await VotingInstance.startProposalsRegistering({
        from: owner,
      });
      VotingInstance = await Voting.new({ from: owner });
      await VotingInstance.addVoter(voterOne, {
        from: owner,
      });
      await VotingInstance.startProposalsRegistering({
        from: owner,
      });
      await VotingInstance.addProposal("First Proposal", {
        from: voterOne,
      });
      await VotingInstance.endProposalsRegistering({
        from: owner,
      });
      await VotingInstance.startVotingSession({
        from: owner,
      });
      const resultSetVote = await VotingInstance.setVote(BN(1), {
        from: voterOne,
      });
      expectEvent(resultSetVote, "Voted", {
        voter: voterOne,
        proposalId: BN(1),
      });
    });

    it("event startProposalsRegistering", async () => {
      const previousStatus = await VotingInstance.workflowStatus.call();
      const resultStartProposalsRegistering =
        await VotingInstance.startProposalsRegistering({
          from: owner,
        });
      const currentStatus = await VotingInstance.workflowStatus.call();
      expectEvent(resultStartProposalsRegistering, "WorkflowStatusChange", {
        previousStatus: previousStatus,
        newStatus: currentStatus,
      });
    });

    it("event endProposalsRegistering", async () => {
      await VotingInstance.startProposalsRegistering({
        from: owner,
      });
      const previousStatus = await VotingInstance.workflowStatus.call();
      const resultEndProposalsRegistering =
        await VotingInstance.endProposalsRegistering({
          from: owner,
        });
      const currentStatus = await VotingInstance.workflowStatus.call();
      expectEvent(resultEndProposalsRegistering, "WorkflowStatusChange", {
        previousStatus: previousStatus,
        newStatus: currentStatus,
      });
    });

    it("event startVotingSession", async () => {
      await VotingInstance.startProposalsRegistering({
        from: owner,
      });
      await VotingInstance.endProposalsRegistering({
        from: owner,
      });
      const previousStatus = await VotingInstance.workflowStatus.call();
      const resultStartVotingSession = await VotingInstance.startVotingSession({
        from: owner,
      });
      const currentStatus = await VotingInstance.workflowStatus.call();
      expectEvent(resultStartVotingSession, "WorkflowStatusChange", {
        previousStatus: previousStatus,
        newStatus: currentStatus,
      });
    });

    it("event endVotingSession", async () => {
      await VotingInstance.startProposalsRegistering({
        from: owner,
      });
      await VotingInstance.endProposalsRegistering({
        from: owner,
      });
      await VotingInstance.startVotingSession({
        from: owner,
      });
      const previousStatus = await VotingInstance.workflowStatus.call();
      const resultEndVotingSession = await VotingInstance.endVotingSession({
        from: owner,
      });
      const currentStatus = await VotingInstance.workflowStatus.call();
      expectEvent(resultEndVotingSession, "WorkflowStatusChange", {
        previousStatus: previousStatus,
        newStatus: currentStatus,
      });
    });

    it("event tallyVotes", async () => {
      await VotingInstance.startProposalsRegistering({
        from: owner,
      });
      await VotingInstance.endProposalsRegistering({
        from: owner,
      });
      await VotingInstance.startVotingSession({
        from: owner,
      });
      await VotingInstance.endVotingSession({
        from: owner,
      });
      const previousStatus = await VotingInstance.workflowStatus.call();
      const resultTallyVotes = await VotingInstance.tallyVotes({
        from: owner,
      });
      const currentStatus = await VotingInstance.workflowStatus.call();
      expectEvent(resultTallyVotes, "WorkflowStatusChange", {
        previousStatus: previousStatus,
        newStatus: currentStatus,
      });
    });
  });
});
