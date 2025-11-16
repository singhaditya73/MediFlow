// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MediFlowAuditLog
 * @dev Immutable audit trail for healthcare data access
 */
contract MediFlowAuditLog {
    // Events
    event AuditEntry(
        string indexed recordId,
        address indexed user,
        string action,
        uint256 timestamp,
        string metadata
    );

    // Audit entry structure
    struct AuditRecord {
        string recordId;
        address user;
        string action;
        uint256 timestamp;
        string metadata;
        bytes32 previousHash;
    }

    // Storage
    AuditRecord[] public auditTrail;
    mapping(string => uint256[]) public recordAudits;
    mapping(address => uint256[]) public userAudits;

    /**
     * @dev Log an audit entry
     * @param recordId Record identifier
     * @param action Action performed (view, create, update, delete, etc.)
     * @param metadata Additional metadata in JSON format
     */
    function logAudit(
        string memory recordId,
        string memory action,
        string memory metadata
    ) public {
        bytes32 previousHash = auditTrail.length > 0
            ? keccak256(
                abi.encodePacked(
                    auditTrail[auditTrail.length - 1].recordId,
                    auditTrail[auditTrail.length - 1].user,
                    auditTrail[auditTrail.length - 1].action,
                    auditTrail[auditTrail.length - 1].timestamp
                )
            )
            : bytes32(0);

        AuditRecord memory entry = AuditRecord({
            recordId: recordId,
            user: msg.sender,
            action: action,
            timestamp: block.timestamp,
            metadata: metadata,
            previousHash: previousHash
        });

        uint256 index = auditTrail.length;
        auditTrail.push(entry);
        recordAudits[recordId].push(index);
        userAudits[msg.sender].push(index);

        emit AuditEntry(
            recordId,
            msg.sender,
            action,
            block.timestamp,
            metadata
        );
    }

    /**
     * @dev Get audit entries for a specific record
     * @param recordId Record identifier
     * @return Array of audit entry indices
     */
    function getRecordAudits(string memory recordId)
        public
        view
        returns (uint256[] memory)
    {
        return recordAudits[recordId];
    }

    /**
     * @dev Get audit entries for a specific user
     * @param user User address
     * @return Array of audit entry indices
     */
    function getUserAudits(address user)
        public
        view
        returns (uint256[] memory)
    {
        return userAudits[user];
    }

    /**
     * @dev Get a specific audit entry
     * @param index Index in the audit trail
     * @return recordId The health record ID
     * @return user The user who performed the action
     * @return action The action performed
     * @return timestamp When the action occurred
     * @return metadata Additional audit metadata
     * @return previousHash Hash of previous audit entry
     */
    function getAuditEntry(uint256 index)
        public
        view
        returns (
            string memory recordId,
            address user,
            string memory action,
            uint256 timestamp,
            string memory metadata,
            bytes32 previousHash
        )
    {
        require(index < auditTrail.length, "Invalid index");
        AuditRecord memory entry = auditTrail[index];
        return (
            entry.recordId,
            entry.user,
            entry.action,
            entry.timestamp,
            entry.metadata,
            entry.previousHash
        );
    }

    /**
     * @dev Get total number of audit entries
     * @return Total count
     */
    function getAuditCount() public view returns (uint256) {
        return auditTrail.length;
    }

    /**
     * @dev Verify audit trail integrity
     * @param index Index to verify
     * @return bool True if the chain is intact
     */
    function verifyAuditIntegrity(uint256 index) public view returns (bool) {
        require(index < auditTrail.length, "Invalid index");
        
        if (index == 0) {
            return auditTrail[0].previousHash == bytes32(0);
        }

        AuditRecord memory current = auditTrail[index];
        AuditRecord memory previous = auditTrail[index - 1];

        bytes32 expectedHash = keccak256(
            abi.encodePacked(
                previous.recordId,
                previous.user,
                previous.action,
                previous.timestamp
            )
        );

        return current.previousHash == expectedHash;
    }
}
