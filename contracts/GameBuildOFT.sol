// SPDX-License-Identifier: MIT

pragma solidity ^0.8.22;

import { OFTFee } from "./OFTFee.sol";

contract GameBuildOFT is OFTFee {
    constructor(
        string memory _name,
        string memory _symbol,
        address _lzEndpoint,
        address _owner
    ) OFTFee(_name, _symbol, _lzEndpoint, _owner) {}
}