// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is ERC20, Ownable{
    uint256 public proposalCount;
    event ProposalApproved(
        uint256 proposalId,
        string description,
        uint256 yesVotes,
        uint256 noVotes
    );

    constructor()ERC20("VoteToken","VTK") Ownable(msg.sender){}
    

    struct Proposal{
        uint256 id;
        address proposer;
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        bool isApproved;
        mapping(address => bool) hasVoted;
    }
    mapping(uint256 => Proposal) public proposals;

    function CreateProp(string memory _desc) public {
        Proposal storage prop=proposals[proposalCount];
        prop.id=proposalCount;
        prop.proposer=msg.sender;
        prop.description = _desc;
        prop.noVotes = 0;
        prop.yesVotes = 0;
        proposalCount++;

    }

    function Vote(uint256 id, bool Appro) public {
        require(balanceOf(msg.sender) >0 ,"has to have a token");
        require(!proposals[id].isApproved  ,"Approved already");
        require(!proposals[id].hasVoted[msg.sender] ,"Voted already");
        proposals[id].hasVoted[msg.sender]=true;
        if (Appro){
            proposals[id].yesVotes++;
        }else {
            proposals[id].noVotes++;
        }

        if (proposals[id].yesVotes>=5){
            proposals[id].isApproved=true;
            emit ProposalApproved(id,proposals[id].description,proposals[id].yesVotes,proposals[id].noVotes);
        }
         

    }


    function mint(address to, uint amount)public onlyOwner{
        _mint(to, amount *10**16);
    }

    function getProp(uint256 id) public view returns (uint256 idNum,address proposer, string memory retTxt,uint256 noVo,uint256 yesVo,bool approve){
         idNum=proposals[id].id;        
         proposer=proposals[id].proposer;
         retTxt=proposals[id].description;
         noVo=proposals[id].noVotes;
         yesVo=proposals[id].yesVotes;
         approve=proposals[id].isApproved;
        return (idNum,proposer,retTxt,noVo,yesVo,approve);


    }

}
