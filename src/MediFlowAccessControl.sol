// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MediFlowAccessControl
 * @dev Smart contract for managing healthcare data access control on blockchain
 */
contract MediFlowAccessControl {
    // Events
    event AccessGranted(
        string indexed recordId,
        address indexed granter,
        address indexed receiver,
        uint8 accessLevel,
        uint256 expiresAt
    );
    
    event AccessRevoked(
        string indexed recordId,
        address indexed granter,
        address indexed receiver
    );
    
    event AccessUpdated(
        string indexed recordId,
        address indexed granter,
        address indexed receiver,
        uint8 accessLevel,
        uint256 expiresAt
    );

    event RecordRegistered(
        string indexed recordId,
        address indexed owner,
        string ipfsHash
    );

    // Access levels
    enum AccessLevel { None, Read, Write, Full }

    // Access control structure
    struct Access {
        address granter;
        address receiver;
        AccessLevel level;
        uint256 expiresAt;
        bool isActive;
        uint256 grantedAt;
    }

    // Mappings
    mapping(string => mapping(address => Access)) public recordAccess;
    mapping(string => address) public recordOwner;
    mapping(address => string[]) public userRecords;
    
    // Modifiers
    modifier onlyRecordOwner(string memory recordId) {
        require(
            recordOwner[recordId] == msg.sender,
            "Not the record owner"
        );
        _;
    }

    /**
     * @dev Register a new health record on blockchain
     * @param recordId Unique identifier for the record
     * @param ipfsHash IPFS hash of the encrypted record
     */
    function registerRecord(
        string memory recordId,
        string memory ipfsHash
    ) public {
        require(recordOwner[recordId] == address(0), "Record already exists");
        
        recordOwner[recordId] = msg.sender;
        userRecords[msg.sender].push(recordId);
        
        emit RecordRegistered(recordId, msg.sender, ipfsHash);
        emit AccessGranted(
            recordId,
            msg.sender,
            msg.sender,
            uint8(AccessLevel.Full),
            0
        );
    }

    /**
     * @dev Grant access to a record
     * @param recordId Record identifier
     * @param receiver Address of the receiver
     * @param level Access level (1=Read, 2=Write, 3=Full)
     * @param expiresAt Expiration timestamp (0 for no expiration)
     */
    function grantAccess(
        string memory recordId,
        address receiver,
        uint8 level,
        uint256 expiresAt
    ) public onlyRecordOwner(recordId) {
        require(receiver != address(0), "Invalid receiver address");
        require(level > 0 && level <= 3, "Invalid access level");
        
        recordAccess[recordId][receiver] = Access({
            granter: msg.sender,
            receiver: receiver,
            level: AccessLevel(level),
            expiresAt: expiresAt,
            isActive: true,
            grantedAt: block.timestamp
        });
        
        emit AccessGranted(
            recordId,
            msg.sender,
            receiver,
            level,
            expiresAt
        );
    }

    /**
     * @dev Revoke access to a record
     * @param recordId Record identifier
     * @param receiver Address of the receiver
     */
    function revokeAccess(
        string memory recordId,
        address receiver
    ) public onlyRecordOwner(recordId) {
        require(
            recordAccess[recordId][receiver].isActive,
            "Access not active"
        );
        
        recordAccess[recordId][receiver].isActive = false;
        
        emit AccessRevoked(recordId, msg.sender, receiver);
    }

    /**
     * @dev Update access permissions
     * @param recordId Record identifier
     * @param receiver Address of the receiver
     * @param level New access level
     * @param expiresAt New expiration timestamp
     */
    function updateAccess(
        string memory recordId,
        address receiver,
        uint8 level,
        uint256 expiresAt
    ) public onlyRecordOwner(recordId) {
        require(
            recordAccess[recordId][receiver].isActive,
            "Access not active"
        );
        require(level > 0 && level <= 3, "Invalid access level");
        
        recordAccess[recordId][receiver].level = AccessLevel(level);
        recordAccess[recordId][receiver].expiresAt = expiresAt;
        
        emit AccessUpdated(
            recordId,
            msg.sender,
            receiver,
            level,
            expiresAt
        );
    }

    /**
     * @dev Check if an address has access to a record
     * @param recordId Record identifier
     * @param user Address to check
     * @return bool True if user has active access
     */
    function hasAccess(
        string memory recordId,
        address user
    ) public view returns (bool) {
        Access memory access = recordAccess[recordId][user];
        
        if (!access.isActive) {
            return false;
        }
        
        if (access.expiresAt > 0 && block.timestamp > access.expiresAt) {
            return false;
        }
        
        return true;
    }

    /**
     * @dev Get access details for a record
     * @param recordId Record identifier
     * @param user Address to check
     * @return granter Address who granted access
     * @return level Access level granted
     * @return expiresAt Expiration timestamp
     * @return isActive Whether access is active
     * @return grantedAt Timestamp when access was granted
     */
    function getAccess(
        string memory recordId,
        address user
    ) public view returns (
        address granter,
        AccessLevel level,
        uint256 expiresAt,
        bool isActive,
        uint256 grantedAt
    ) {
        Access memory access = recordAccess[recordId][user];
        return (
            access.granter,
            access.level,
            access.expiresAt,
            access.isActive,
            access.grantedAt
        );
    }

    /**
     * @dev Get all records owned by a user
     * @param user Address to check
     * @return Array of record IDs
     */
    function getUserRecords(address user) public view returns (string[] memory) {
        return userRecords[user];
    }

    /**
     * @dev Get the owner of a record
     * @param recordId Record identifier
     * @return Address of the owner
     */
    function getRecordOwner(string memory recordId) public view returns (address) {
        return recordOwner[recordId];
    }
}
