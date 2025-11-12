// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DiceMania {
    address public owner;
    uint256 public poolId;

    // Points constants
    uint256 public constant POINTS_PER_BET = 10;
    uint256 public constant POINTS_PER_WIN = 50;

    event PoolCreated(uint256 indexed poolId, uint256 endTime, uint256 totalPlayers, uint256 baseAmount, uint256 startTime);
    event BetPlaced(address indexed user, uint256 indexed poolId, uint256 amount, uint256 targetValue, uint256 totalAmount, uint256 playersLeft);
    event FundsDistributed(uint256 indexed poolId, uint256 resultValue, uint256 totalWinners, uint256 rewardPerWinner);
    event BetClaimed(address indexed user, uint256 indexed poolId, uint256 reward);
    event ResultSet(uint256 indexed poolId, uint256 resultValue);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event EtherReceived(address indexed sender, uint256 amount);
    event PointsAwarded(address indexed user, uint256 points, uint256 totalPoints, string reason);
    event PointsAdded(address indexed user, uint256 pointsAdded, uint256 newTotalPoints, string reason);

    struct DicePool {
        uint256 id;
        uint256 endtime;
        uint256 starttime;
        uint256 totalamount;
        uint256 totalplayers;
        uint256 playersLeft;
        uint256 result;
        bool ended;
        uint256 baseamount;
        mapping(address => DicePlayer) userBet;
    }

    struct DicePlayer {
        address user;
        uint256 amount;
        uint256 targetScore;
        uint256 claimedAmount;
        bool claimed;
    }

    mapping(uint256 => DicePool) private pools;
    mapping(uint256 => DicePlayer[]) private bets;
    mapping(address => uint256) public userPoints;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "YOU_ARE_NOT_ONWER");
        _;
    }

    function createPool(uint256 _endTime, uint256 _totalPlayers,uint256 _baseamount)
        external
        onlyOwner
    {
        uint256 currentPoolId = poolId;
        pools[currentPoolId].id = currentPoolId;
        pools[currentPoolId].totalplayers = _totalPlayers;
        pools[currentPoolId].playersLeft = _totalPlayers;
        pools[currentPoolId].ended = false;
        pools[currentPoolId].starttime = block.timestamp;
        pools[currentPoolId].baseamount= _baseamount;
        pools[currentPoolId].endtime = block.timestamp + _endTime;
        unchecked {
            poolId += 1;
        }
        emit PoolCreated(currentPoolId, pools[currentPoolId].endtime, _totalPlayers, _baseamount, pools[currentPoolId].starttime);
    }

    function placeBet(
        uint256 _amount,
        uint256 _targetValue,
        uint256 _poolId
    ) external payable {
        require(_amount > 0, "Bet amount must be greater than 0");
        require(
            _targetValue > 0 && _targetValue < 7,
            "target must be GT than 0 and LT than 7"
        );
        require(!pools[_poolId].ended, "POOL IS CLOSED");
        require(pools[_poolId].playersLeft > 0, "POOL IS FULL");
        require(
            pools[_poolId].userBet[msg.sender].amount == 0,
            "BET IS ALREADY PLACED"
        );
        require(
            block.timestamp < pools[_poolId].endtime,
            "Betting period over"
        );
        require(pools[_poolId].baseamount == _amount, "NOT ENOUGH TO BET");
        require(msg.value == _amount, "Incorrect ETH sent");

        DicePlayer memory newBet = DicePlayer({
            user: msg.sender,
            amount: _amount,
            targetScore: _targetValue,
            claimedAmount: 0,
            claimed: false
        });

        pools[_poolId].userBet[msg.sender] = newBet;
        bets[_poolId].push(newBet);
        pools[_poolId].totalamount += _amount;

        unchecked {
            pools[_poolId].playersLeft -= 1;
        }
        
        emit BetPlaced(msg.sender, _poolId, _amount, _targetValue, pools[_poolId].totalamount, pools[_poolId].playersLeft);
        
        // Award points for placing a bet
        unchecked {
            userPoints[msg.sender] += POINTS_PER_BET;
        }
        emit PointsAwarded(msg.sender, POINTS_PER_BET, userPoints[msg.sender], "Bet Placed");
    }

    function _distributeFunds(uint256 _poolId, uint256 _resultvalue) internal {
        DicePool storage _pool = pools[_poolId];
        require(_pool.ended, "Pool is not ended");
        uint256 _totalAmount = _pool.totalamount;
        DicePlayer[] storage userBets = bets[_poolId];
        uint256 _totalPlayerWon = 0;

        // Count winners
        for (uint256 i = 0; i < userBets.length; ++i) {
            if (userBets[i].targetScore == _resultvalue) {
                _totalPlayerWon++;
            }
        }
        uint256 _reward;
        if (_totalPlayerWon == 0) {
            _reward = 0;
        } else {
            // Calculate reward per winner
            _reward = _totalAmount / _totalPlayerWon;
            // Distribute rewards
            for (uint256 i = 0; i < userBets.length; ++i) {
                if (userBets[i].targetScore == _resultvalue) {
                    userBets[i].claimedAmount = _reward;
                    _pool.userBet[userBets[i].user].claimedAmount = _reward;
                }
            }
        }
        emit FundsDistributed(_poolId, _resultvalue, _totalPlayerWon, _reward);
    }

    function claimBet(uint256 _poolId) external {
        require(pools[_poolId].ended, "POOL IS NOT RESOLVED YET");

        DicePlayer storage _bet = pools[_poolId].userBet[msg.sender];
        require(!_bet.claimed, "Already Claimed Your Bet");

        uint256 reward = _bet.claimedAmount;
        require(reward > 0, "No reward to claim");

        _bet.claimed = true;
        (bool success, ) = payable(msg.sender).call{value: reward}("");
        require(success, "Failed to send Ether");
        
        // Award 50 points for winning (if reward > 0, they won)
        if (reward > 0) {
            unchecked {
                userPoints[msg.sender] += POINTS_PER_WIN;
            }
            emit PointsAwarded(msg.sender, POINTS_PER_WIN, userPoints[msg.sender], "Bet Won");
        }
        
        emit BetClaimed(msg.sender, _poolId, reward);
    }

    function setResult(uint256 _resultvalue, uint256 _poolId)
        external
        onlyOwner
    {
        require(
            block.timestamp >= pools[_poolId].endtime,
            "POOL IS NOT RESOLVED YET"
        );
        require(
            _resultvalue > 0 && _resultvalue < 7,
            "Result must be between 1-6"
        );
        pools[_poolId].ended = true;
        unchecked {
            pools[_poolId].result = _resultvalue;
        }
        _distributeFunds(_poolId, _resultvalue);
        emit ResultSet(_poolId, _resultvalue);
    }

    function getBets(uint256 _poolId)
        external
        view
        returns (DicePlayer[] memory)
    {
        return bets[_poolId];
    }

    function getPoolDetail(uint256 _poolId)
        external
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            bool
        )
    {
        return (
            pools[_poolId].totalplayers,
            pools[_poolId].baseamount,
            pools[_poolId].endtime,
            pools[_poolId].result,
            pools[_poolId].totalamount,
            pools[_poolId].playersLeft,
            pools[_poolId].ended
        );
    }

    function withdrawfunds() external payable onlyOwner {
        uint256 balance = address(this).balance;
        (bool success1, bytes memory data1) = (msg.sender).call{
            value: balance
        }("");
        require(success1, "Failed to send Ether");
        emit FundsWithdrawn(msg.sender, balance);
    }

    receive() external payable {
        emit EtherReceived(msg.sender, msg.value);
    }

    // Function to get user points
    function getUserPoints(address _user) external view returns (uint256) {
        return userPoints[_user];
    }
}
