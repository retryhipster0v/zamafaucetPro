// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {ConfidentialFungibleToken} from "new-confidential-contracts/token/ConfidentialFungibleToken.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {FHE, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";

contract ConfidentialDAI is ConfidentialFungibleToken, SepoliaConfig {
    constructor() ConfidentialFungibleToken("Confidential DAI", "cDAI", "") {}

    function mint(uint64 amount) external {
        euint64 eamount = FHE.asEuint64(amount);
        _mint(msg.sender, eamount);
    }

    function mintEncrypted(externalEuint64 encryptedAmount, bytes calldata inputProof) external {
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        _mint(msg.sender, amount);
    }
}
