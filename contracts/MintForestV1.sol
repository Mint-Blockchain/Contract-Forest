// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

struct SigninParams {
    uint64 time;
    uint256 point;
}

struct StealParams {
    address target;
    uint64 time;
    uint256 point;
}

struct RewardParams {
    uint256 rewardId;
    uint256 point;
}

struct TurntableParams {
    uint64 time;
    uint16 count;
    uint256 point;
}

contract MintForestV1 is
    OwnableUpgradeable,
    UUPSUpgradeable,
    EIP712Upgradeable
{
    string private constant SIGNING_DOMAIN = "www.mintchain.io";
    string private constant SIGNATURE_VERSION = "1";
    address public signer;

    mapping(address => mapping(uint64 => uint256)) public signinRecord;
    mapping(address => mapping(uint64 => uint256)) public stealRecord;
    mapping(address => mapping(uint256 => uint256)) public rewardRecord;
    mapping(address => mapping(uint64 => mapping(uint16 => uint256)))
        public turntableRecord;

    event Signin(address indexed user, uint64 indexed time, uint256 point);
    event Steal(
        address indexed user,
        address indexed target,
        uint64 indexed time,
        uint256 point
    );
    event OpenReward(
        address indexed user,
        uint256 indexed rewardId,
        uint256 point
    );
    event Turntable(
        address indexed user,
        uint64 indexed time,
        uint16 indexed count,
        uint256 point
    );

    error InvalidTime();
    error DuplicateData();
    error InvalidSignature();

    modifier onlyToday(uint64 _time) {
        uint64 currentTimestamp = uint64(block.timestamp);
        uint64 startOfDay = currentTimestamp - (currentTimestamp % 86400);
        if (_time != startOfDay) revert InvalidTime();
        _;
    }

    modifier validateSignature(
        bytes memory encodeData,
        bytes calldata signature
    ) {
        bytes32 _digest = _hashTypedDataV4(keccak256(encodeData));
        address _signer = ECDSA.recover(_digest, signature);
        if (_signer != signer) revert InvalidSignature();
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) external initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        __EIP712_init(SIGNING_DOMAIN, SIGNATURE_VERSION);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    function setSigner(address newSigner) external onlyOwner {
        require(newSigner != address(0), "Zero address not be allowed");
        signer = newSigner;
    }

    function signin(
        SigninParams calldata params,
        bytes calldata signature
    )
        external
        onlyToday(params.time)
        validateSignature(
            abi.encode(
                keccak256(
                    "SigninParams(address user,uint64 time,uint256 point)"
                ),
                _msgSender(),
                params.time,
                params.point
            ),
            signature
        )
    {
        if (signinRecord[_msgSender()][params.time] > 0) revert DuplicateData();
        signinRecord[_msgSender()][params.time] = params.point;
        emit Signin(_msgSender(), params.time, params.point);
    }

    function steal(
        StealParams calldata params,
        bytes calldata signature
    )
        external
        onlyToday(params.time)
        validateSignature(
            abi.encode(
                keccak256(
                    "StealParams(address user,address target,uint64 time,uint256 point)"
                ),
                _msgSender(),
                params.target,
                params.time,
                params.point
            ),
            signature
        )
    {
        if (stealRecord[params.target][params.time] > 0) revert DuplicateData();
        stealRecord[params.target][params.time] = params.point;
        emit Steal(_msgSender(), params.target, params.time, params.point);
    }

    function openReward(
        RewardParams calldata params,
        bytes calldata signature
    )
        external
        validateSignature(
            abi.encode(
                keccak256(
                    "RewardParams(address user,uint256 rewardId,uint256 point)"
                ),
                _msgSender(),
                params.rewardId,
                params.point
            ),
            signature
        )
    {
        if (rewardRecord[_msgSender()][params.rewardId] > 0)
            revert DuplicateData();
        rewardRecord[_msgSender()][params.rewardId] = params.point;
        emit OpenReward(_msgSender(), params.rewardId, params.point);
    }

    function turntable(
        TurntableParams calldata params,
        bytes calldata signature
    )
        external
        validateSignature(
            abi.encode(
                keccak256(
                    "TurntableParams(address user,uint64 time,uint16 count,uint256 point)"
                ),
                _msgSender(),
                params.time,
                params.count,
                params.point
            ),
            signature
        )
    {
        if (turntableRecord[_msgSender()][params.time][params.count] > 0)
            revert DuplicateData();
        turntableRecord[_msgSender()][params.time][params.count] = params.point;
        emit Turntable(_msgSender(), params.time, params.count, params.point);
    }
}
