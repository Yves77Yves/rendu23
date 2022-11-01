
# Test du programme Voting.sol

Le programme de test VotingTest.js déroule les tests unitaires du programme Voting.sol.
Tous les tests 'IT' ont été écrits pour être indépendants les uns des autres au sein d'un 'DESCRIBE'.
Un test UNSPECIFIED a été ajouté.


## Les tests sont structurés ainsi :
- test contract creation
- test registration (Adder and Getter)
- test Vote (Adder and Getter)
- test all State functions
- test all requires
- test all events

## Installation de l'environnement dans VSCode
- prerequisite : node,truffle and ganache already installed.
- Once the repository has been downloaded
- install dotenv : $ npm install --prefix . dotenv 
- run ganache : $ ganache
- compile and deploy : $ truffle migrate 

## Lancement des tests
- run tests : $ truffle test

## Résultats des tests : 53 passing
### Liste des tests
    Contract deployment
      ✓ check the owner has created Voting contract (12ms)
      ✓ check the init workflow status is RegisteringVoters (14ms)
    Adding and Getting a voter
      ✓ check current workflow status is RegisteringVoters (17ms)
      ✓ add a voter and check data (65ms, 50220 gas)
    Adding and Getting a proposal
      ✓ check current workflow status is ProposalsRegistrationStarted (10ms)
      ✓ add a proposal and check data (73ms, 59136 gas)
      ✓ check UNSPECIFIED : request a non existing proposal (to be fixed by development (631ms)
      ✓ add several proposals and select the third one (241ms, 236568 gas)
    Setting a vote
      ✓ check current workflow status is VotingSessionStarted (7ms)
      ✓ check second proposal is 'Second Proposal' (17ms)
      ✓ set a vote and check data (91ms, 78013 gas)
      ✓ set three votes on two proposals and check data (166ms, 216939 gas)
    Start Proposal registering a vote
      ✓ check current workflow status is RegisteringVoters (10ms)
      ✓ check new current workflow status is ProposalsRegistrationStarted (53ms, 94840 gas)
      ✓ check initial proposal is 'GENESIS' (108ms, 2115075 gas)
    endProposalsRegistering
      ✓ check current workflow status is ProposalsRegistrationStarted (7ms)
      ✓ check new current workflow status is ProposalsRegistrationEnded (48ms, 30599 gas)
    startVotingSession
      ✓ check before workflow status is ProposalsRegistrationEnded (6ms)
      ✓ check new current workflow status is VotingSessionStarted (34ms, 30554 gas)
    endVotingSession
      ✓ check before workflow status is VotingSessionStarted (8ms)
      ✓ check new current workflow status is VotingSessionEnded (34ms, 30533 gas)
    tallyVotes
      ✓ check before workflow status is VotingSessionEnded (8ms)
      ✓ check new current workflow status is VotingSessionEnded (51ms, 63565 gas)
      ✓ check winningProposalID is equal to 1 (48ms, 63565 gas)
    Check requires
      ✓ require addVoter: only the owner can add a voter (12ms)
      ✓ require addVoter: a voter can't be addded twice (45ms, 50220 gas)
      ✓ require addVoter: voter registration must be opened (45ms, 94840 gas)
      ✓ require getVoter: only a voter can get a voter (36ms, 50220 gas)
      ✓ require addProposal: proposal registration must be opened (70ms, 50220 gas)
      ✓ require addProposal: only a voter can add a proposal (44ms, 94840 gas)
      ✓ require addProposal: a proposal can't be empty (74ms, 145060 gas)
      ✓ require getOneProposal: only a voter can get a proposal (109ms, 145060 gas)
      ✓ require setVote: only a voter can vote (191ms, 2235364 gas)
      ✓ require setVote: voting session must be opened (147ms, 234795 gas)
      ✓ require setVote: proposal can't be empty (72ms, 145060 gas)
      ✓ require setVote: proposal must exist (338ms, 2330204 gas)
      ✓ require startProposalsRegistering: onlyOwner (11ms)
      ✓ require startProposalsRegistering: workflow status is VotingSessionStarted (142ms, 94840 gas)
      ✓ require endProposalsRegistering: onlyOwner (10ms)
      ✓ require endProposalsRegistering: ProposalsRegistrationStarted (12ms)
      ✓ require startVotingSession: onlyOwner (8ms)
      ✓ require startVotingSession: ProposalsRegistrationEnded (99ms)
      ✓ require endVotingSession: onlyOwner (10ms)
      ✓ require endVotingSession: VotingSessionStarted (8ms)
      ✓ require tallyVotes: onlyOwner (11ms)
      ✓ require tallyVotes: VotingSessionEnded (33ms)
    Check events
      ✓ event addVoter : a voter has been registered (25ms, 50220 gas)
      ✓ event addProposal : a proposal has been registered (94ms, 204196 gas)
      ✓ event setVote: has voted (329ms, 2408217 gas)
      ✓ event startProposalsRegistering (48ms, 94840 gas)
      ✓ event endProposalsRegistering (102ms, 125439 gas)
      ✓ event startVotingSession (103ms, 155993 gas)
      ✓ event endVotingSession (178ms, 186526 gas)
      ✓ event tallyVotes (160ms, 224375 gas)

### Performances : 53 passing (26s)

<picture>
<img alt="Shows performances." src="./performance%20VotingTest.jpg">
<picture>
<picture>
<img alt="Shows an illustrated sun in light mode and a moon with stars in dark mode." src="https://user-images.githubusercontent.com/25423296/163456779-a8556205-d0a5-45e2-ac17-42d089e3c3f8.png" height="62" width="62">
</picture>

