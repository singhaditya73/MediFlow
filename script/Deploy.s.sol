// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MediFlowAccessControl.sol";
import "../src/MediFlowAuditLog.sol";

contract Deploy is Script {
    function run() external {
        // Use the private key from command line or fallback to env variable
        uint256 deployerPrivateKey;
        try vm.envUint("PRIVATE_KEY") returns (uint256 key) {
            deployerPrivateKey = key;
        } catch {
            // Default Anvil account #0 private key for local development
            deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        }
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy MediFlowAccessControl
        MediFlowAccessControl accessControl = new MediFlowAccessControl();
        console.log("MediFlowAccessControl deployed to:", address(accessControl));

        // Deploy MediFlowAuditLog
        MediFlowAuditLog auditLog = new MediFlowAuditLog();
        console.log("MediFlowAuditLog deployed to:", address(auditLog));

        vm.stopBroadcast();
    }
}
