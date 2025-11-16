// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MediFlowAccessControl.sol";

contract MediFlowAccessControlTest is Test {
    MediFlowAccessControl public accessControl;
    address public owner;
    address public user1;
    address public user2;

    function setUp() public {
        accessControl = new MediFlowAccessControl();
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
    }

    function testRegisterRecord() public {
        string memory recordId = "record-1";
        string memory ipfsHash = "QmHash123";
        
        accessControl.registerRecord(recordId, ipfsHash);
        
        address recordOwner = accessControl.getRecordOwner(recordId);
        assertEq(recordOwner, owner);
    }

    function testGrantAccess() public {
        string memory recordId = "record-1";
        accessControl.registerRecord(recordId, "QmHash");
        
        accessControl.grantAccess(recordId, user1, 1, 0);
        
        bool hasAccess = accessControl.hasAccess(recordId, user1);
        assertTrue(hasAccess);
    }

    function testRevokeAccess() public {
        string memory recordId = "record-1";
        accessControl.registerRecord(recordId, "QmHash");
        accessControl.grantAccess(recordId, user1, 1, 0);
        
        accessControl.revokeAccess(recordId, user1);
        
        bool hasAccess = accessControl.hasAccess(recordId, user1);
        assertFalse(hasAccess);
    }

    function test_RevertWhen_GrantAccessNotOwner() public {
        string memory recordId = "record-1";
        accessControl.registerRecord(recordId, "QmHash");
        
        vm.prank(user1);
        vm.expectRevert("Not the record owner");
        accessControl.grantAccess(recordId, user2, 1, 0);
    }

    function testExpiredAccess() public {
        string memory recordId = "record-1";
        accessControl.registerRecord(recordId, "QmHash");
        
        uint256 expiresAt = block.timestamp + 1 hours;
        accessControl.grantAccess(recordId, user1, 1, expiresAt);
        
        // Before expiration
        assertTrue(accessControl.hasAccess(recordId, user1));
        
        // After expiration
        vm.warp(block.timestamp + 2 hours);
        assertFalse(accessControl.hasAccess(recordId, user1));
    }

    function testGetUserRecords() public {
        accessControl.registerRecord("record-1", "QmHash1");
        accessControl.registerRecord("record-2", "QmHash2");
        
        string[] memory records = accessControl.getUserRecords(owner);
        assertEq(records.length, 2);
    }

    function testUpdateAccess() public {
        string memory recordId = "record-1";
        accessControl.registerRecord(recordId, "QmHash");
        accessControl.grantAccess(recordId, user1, 1, 0);
        
        accessControl.updateAccess(recordId, user1, 3, 0);
        
        (, MediFlowAccessControl.AccessLevel level,,,) = accessControl.getAccess(recordId, user1);
        assertEq(uint8(level), 3);
    }
}
