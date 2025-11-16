// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MediFlowAuditLog.sol";

contract MediFlowAuditLogTest is Test {
    MediFlowAuditLog public auditLog;
    address public user1;

    function setUp() public {
        auditLog = new MediFlowAuditLog();
        user1 = address(0x1);
    }

    function testLogAudit() public {
        string memory recordId = "record-1";
        string memory action = "create";
        string memory metadata = '{"type":"diagnostic"}';
        
        auditLog.logAudit(recordId, action, metadata);
        
        uint256 count = auditLog.getAuditCount();
        assertEq(count, 1);
    }

    function testGetRecordAudits() public {
        string memory recordId = "record-1";
        
        auditLog.logAudit(recordId, "create", "{}");
        auditLog.logAudit(recordId, "view", "{}");
        
        uint256[] memory audits = auditLog.getRecordAudits(recordId);
        assertEq(audits.length, 2);
    }

    function testGetUserAudits() public {
        auditLog.logAudit("record-1", "create", "{}");
        auditLog.logAudit("record-2", "view", "{}");
        
        uint256[] memory audits = auditLog.getUserAudits(address(this));
        assertEq(audits.length, 2);
    }

    function testGetAuditEntry() public {
        string memory recordId = "record-1";
        string memory action = "create";
        string memory metadata = '{"test":true}';
        
        auditLog.logAudit(recordId, action, metadata);
        
        (
            string memory returnedRecordId,
            address returnedUser,
            string memory returnedAction,
            uint256 timestamp,
            string memory returnedMetadata,
            bytes32 previousHash
        ) = auditLog.getAuditEntry(0);
        
        assertEq(returnedRecordId, recordId);
        assertEq(returnedUser, address(this));
        assertEq(returnedAction, action);
        assertEq(returnedMetadata, metadata);
        assertEq(previousHash, bytes32(0));
        assertTrue(timestamp > 0);
    }

    function testAuditChainIntegrity() public {
        auditLog.logAudit("record-1", "create", "{}");
        auditLog.logAudit("record-2", "view", "{}");
        auditLog.logAudit("record-3", "update", "{}");
        
        // Verify chain integrity
        assertTrue(auditLog.verifyAuditIntegrity(0));
        assertTrue(auditLog.verifyAuditIntegrity(1));
        assertTrue(auditLog.verifyAuditIntegrity(2));
    }

    function testMultipleUsersAudit() public {
        auditLog.logAudit("record-1", "create", "{}");
        
        vm.prank(user1);
        auditLog.logAudit("record-1", "view", "{}");
        
        uint256[] memory ownerAudits = auditLog.getUserAudits(address(this));
        uint256[] memory user1Audits = auditLog.getUserAudits(user1);
        
        assertEq(ownerAudits.length, 1);
        assertEq(user1Audits.length, 1);
    }
}
