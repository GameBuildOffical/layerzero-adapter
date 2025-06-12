import assert from 'assert'

import { type DeployFunction } from 'hardhat-deploy/types'
import { Options } from '@layerzerolabs/lz-v2-utilities';
import { getEndpointVersionForUlnVersion } from '@layerzerolabs/lz-definitions';



const contractName = 'GameBuildOFTAdapter'

const deploy: DeployFunction = async (hre) => {
    const { getNamedAccounts, deployments } = hre

    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    assert(deployer, 'Missing named deployer account')

    console.log(`Network: ${hre.network.name}`)
    console.log(`Deployer: ${deployer}`)

    // This is an external deployment pulled in from @layerzerolabs/lz-evm-sdk-v2
    // @layerzerolabs/toolbox-hardhat takes care of plugging in the external deployments
    // from @layerzerolabs packages based on the configuration in your hardhat config
    // For this to work correctly, your network config must define an eid property
    // set to `EndpointId` as defined in @layerzerolabs/lz-definitions
    // Example:
    // networks: {
    //   fuji: {
    //     ...
    //     eid: EndpointId.AVALANCHE_V2_TESTNET
    //   }
    // }
    const endpointV2Deployment = await hre.deployments.get('EndpointV2')

    // The token address must be defined in hardhat.config.ts
    // If the token address is not defined, the deployment will log a warning and skip the deployment
    if (hre.network.config.token == null) {
        console.warn(`oftAdapter not configured on network config, skipping OFTWrapper deployment`)
        return
    }

    const bEid = hre.network.config.toEid

    const { address } = await hre.deployments.get('GameBuildOFTAdapter')

    /*
    const { address }= await deploy(contractName, {
        from: deployer,
        args: [
            hre.network.config.token.tokenAddress, // token address
            endpointV2Deployment.address, // LayerZero's EndpointV2 address
            deployer, // owner
        ],
        log: true,
        skipIfAlreadyDeployed: true,
    })
    */

    console.log(`Deployed contract: ${contractName}, network: ${hre.network.name}, address: ${address}`)

    if (hre.network.config.oftAdapter== null) {
        console.warn(`oftAdapter not configured on network config, skipping OFTWrapper deployment`)
        return
    }

    // Example ULN config, replace with actual values
    const sendUlnConfig = {
        confirmations: 15,
        requiredDVNCount: 0,
        optionalDVNCount: 1,
        optionalDVNThreshold: 1,
        requiredDVNs: [], 
        //optionalDVNs: ["0x8eebf8b423b73bfca51a1db4b7354aa0bfca9193", "0xdd7b5e1db4aafd5c8ec3b764efb8ed265aa5445b", "0x9efba56c8598853e5b40fd9a66b54a6c163742d7"], 
        optionalDVNs: ["0x8eebf8b423b73bfca51a1db4b7354aa0bfca9193"],
    };

    // Example Executor config, replace with actual values
    const sendExecutorConfig = {
        maxMessageSize: 10000,
        executorAddress: '0x718B92b5CB0a5552039B593faF724D182A881eDA', // Replace with the actual executor address
    };

    const receiveUlnConfig = {
        confirmations: 15,
        requiredDVNCount: 0,
        optionalDVNCount: 1,
        optionalDVNThreshold: 1,
        requiredDVNs: [], 
        //optionalDVNs: ["0x8eebf8b423b73bfca51a1db4b7354aa0bfca9193", "0xdd7b5e1db4aafd5c8ec3b764efb8ed265aa5445b", "0x9efba56c8598853e5b40fd9a66b54a6c163742d7"], 
        optionalDVNs: ["0x8eebf8b423b73bfca51a1db4b7354aa0bfca9193"],
    };

    // Encode ULN config using defaultAbiCoder
    const configTypeUlnStruct = 'tuple(uint64 confirmations, uint8 requiredDVNCount, uint8 optionalDVNCount, uint8 optionalDVNThreshold, address[] requiredDVNs, address[] optionalDVNs)';
    // Encode Executor config using defaultAbiCoder
    const configTypeExecutorStruct = 'tuple(uint32 maxMessageSize, address executorAddress)';

    /*
    const sendExecutorConfigBytes = "0x0000000000000000000000000000000000000000000000000000000000002710000000000000000000000000173272739bd7aa6e4e214714048a9fe699453059";
    const sendUlnConfigBytes = "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000006559ee34d85a88317bf0bfe307444116c631b67000000000000000000000000380275805876ff19055ea900cdb2b46a94ecf20d000000000000000000000000589dedbd617e0cbcb916a9223f4d1300c294236b";
    const receiveUlnConfigBytes = "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000006559ee34d85a88317bf0bfe307444116c631b67000000000000000000000000380275805876ff19055ea900cdb2b46a94ecf20d000000000000000000000000589dedbd617e0cbcb916a9223f4d1300c294236b";

    const sendDecodedExecutor = hre.ethers.utils.defaultAbiCoder.decode([configTypeExecutorStruct], sendExecutorConfigBytes);
    const sendDecodedULN = hre.ethers.utils.defaultAbiCoder.decode([configTypeUlnStruct ], sendUlnConfigBytes);
    const receiveDecodedULN = hre.ethers.utils.defaultAbiCoder.decode([configTypeUlnStruct ], receiveUlnConfigBytes);

    console.log("Decoded Executor Config:", sendDecodedExecutor);
    console.log("Decoded ULN Config:", sendDecodedULN);
    console.log("Decoded Receive ULN Config:", receiveDecodedULN);
    return
    */

    const sendEncodedUlnConfig = hre.ethers.utils.defaultAbiCoder.encode([configTypeUlnStruct], [sendUlnConfig]);
    const sendEncodedExecutorConfig = hre.ethers.utils.defaultAbiCoder.encode(
        [configTypeExecutorStruct],
        [sendExecutorConfig],
    );

    const receiveEncodedUlnConfig = hre.ethers.utils.defaultAbiCoder.encode([configTypeUlnStruct], [receiveUlnConfig]);

    let tx;
    const gracePeriod = 0;

    const executorConfigType = 1;
    const ulnConfigType = 2;

    // Get the deployed OFTAdapter contract instance
    const oft = await hre.ethers.getContractAt('OFTAdapter', address, (await hre.ethers.getSigners())[0])

    // Set the peer for cross-chain communication
    // setPeer(uint32 eid, bytes32 peer)
    // Convert the peer address (oftAdapter.tokenAddress) to bytes32
    const peerAddress = hre.network.config.oftAdapter.tokenAddress;
    const peerBytes32 = hre.ethers.utils.hexZeroPad(peerAddress, 32);

    console.log(`Setting peer for OFTAdapter: ${peerAddress} as ${peerBytes32}`);
    tx = await oft.setPeer(hre.network.config.toEid, peerBytes32);
    await tx.wait()

    // These are example library addresses, replace with actual ones if needed
    const sendLibrary = "0xcc1ae8Cf5D3904Cef3360A9532B477529b177cCE"
    const receiveLibrary = "0xdAf00F5eE2158dD58E0d3857851c432E34A3A851"

    // ABI for EndpointV2 contract, add more functions if needed
    /*
    const endpointV2Abi = [
        "function setSendLibrary(address _oapp, uint32 _eid, address _lib) external",
        "function setReceiveLibrary(address _oapp, uint32 _eid, address _lib, uint256 _gracePeriod) external",
        "function setConfig(address _oapp, address _lib, SetConfigParam[] calldata _params) external",
        "function setDelegate(address _oapp, address _delegate) external",
        "function getConfig(address _oapp, address _lib, uint32 _eid, uint32 _configType) external view returns (bytes memory config)"
        // Add more methods if needed
    ];
    */


    const signer = (await hre.ethers.getSigners())[0];
    const endpointV2 = new hre.ethers.Contract(endpointV2Deployment.address, endpointV2Deployment.abi, signer);

    // Prepare SetConfigParam structs for ULN and Executor
    const setSendConfigParamUln = {
        eid: bEid,
        configType: ulnConfigType, // ULN_CONFIG_TYPE
        config: sendEncodedUlnConfig,
    };

    const receiveConfigParamUln = {
        eid: bEid,
        configType: ulnConfigType, // ULN_CONFIG_TYPE
        config: receiveEncodedUlnConfig,
    };

    const setSendConfigParamExecutor = {
        eid: bEid,
        configType: executorConfigType, // EXECUTOR_CONFIG_TYPE
        config: sendEncodedExecutorConfig,
    };

    // Use deployer as delegate, change if needed
    const delegate = deployer;

    // Call EndpointV2 configuration methods
    console.log("Setting send library...");

    tx = await endpointV2.setSendLibrary(address, bEid, sendLibrary);
    await tx.wait()

    console.log("Setting receive library...");
    tx = await endpointV2.setReceiveLibrary(address, bEid, receiveLibrary, gracePeriod);
    await tx.wait()

    console.log("Setting receive library timeout...");
    tx = await endpointV2.setReceiveLibraryTimeout(address, bEid, receiveLibrary, 3 * 60);
    await tx.wait()

    // setConfig expects bytes, so encode the array of structs as bytes
    // If setConfig expects a struct array, you may need to encode it differently
    // Here we encode each struct and concatenate
    /*
    const abi = new hre.ethers.utils.AbiCoder();
    const sendEncodedSetConfigParams = abi.encode(
        [
            "tuple(uint32 eid, uint32 configType, bytes config)[]"
        ],
        [[setSendConfigParamExecutor, setSendConfigParamUln]]
    );

    const receiveEncodedSetConfigParams = abi.encode(
        [
            "tuple(uint32 eid, uint32 configType, bytes config)[]"
        ],
        [[receiveConfigParamUln]]
    );
    */

    console.log("Setting send config...");
    tx = await endpointV2.setConfig(address, sendLibrary, [setSendConfigParamUln, setSendConfigParamExecutor]);
    console.log("Waiting set send config...", tx.hash);
    await tx.wait()

    console.log("Setting receive config...");
    tx = await endpointV2.setConfig(address, receiveLibrary, [receiveConfigParamUln]);
    console.log("Waiting set receive config...", tx.hash);
    await tx.wait()


    const MSG_TYPE = 1;
    const GAS_LIMIT = 100000; 
    const MSG_VALUE = 0;

    //const _options = Options.fromOptions("0x000301001101000000000000000000000000000186a0")
    const _options = Options.newOptions().addExecutorLzReceiveOption(GAS_LIMIT, MSG_VALUE)

    const enforcedOptions = {
        eid: bEid,
        msgType: MSG_TYPE,
        options: _options.toBytes(),
    }

    console.log("Setting enforced options...");
    tx = await oft.setEnforcedOptions([enforcedOptions])
    await tx.wait()

    console.log("set delegate...");
    /*
    tx = await endpointV2.setDelegate(delegate);
    await tx.wait()
    */

    console.log("EndpointV2 configuration completed");
}

deploy.tags = ['ConfigAdapter']

export default deploy