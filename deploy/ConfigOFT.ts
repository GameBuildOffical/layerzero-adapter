import assert from 'assert'

import { type DeployFunction } from 'hardhat-deploy/types'
import { Options } from '@layerzerolabs/lz-v2-utilities';

const contractName = 'GameBuildOFT'

const deploy: DeployFunction = async (hre) => {
    const { getNamedAccounts, deployments } = hre

    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    assert(deployer, 'Missing named deployer account')

    console.log(`Network 1: ${hre.network.name}`)
    console.log(`Deployer: ${deployer}`)

    const endpointV2Deployment = await hre.deployments.get('EndpointV2')

    console.log("EndpointV2 address:", endpointV2Deployment.address)

    const { address } = await hre.deployments.get('GameBuildOFT')

    /*
    const { address } = await deploy(contractName, {
        from: deployer,
        args: [
            'GameBuild', // name
            'GAME', // symbol
            endpointV2Deployment.address, // LayerZero's EndpointV2 address
            deployer, // owner
        ],
        log: true,
        skipIfAlreadyDeployed: true,
    })
    */

    console.log(`Deployed contract: ${contractName}, network: ${hre.network.name}, address: ${address}`)

    if (hre.network.config.oftAdapter == null) {
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
        optionalDVNs: [
            //"0xd0a6fd2e542945d81d4ed82d8f4d25cc09c65f7f",
            "0x0ee552262f7b562efced6dd4a7e2878ab897d405",
            //"0x6f99ea3fc9206e2779249e15512d7248dab0b52e"
        ],
    };

    const sendExecutorConfig = {
        maxMessageSize: 10000,
        executorAddress: '0x31894b190a8bAbd9A067Ce59fde0BfCFD2B18470',
    };

    const receiveUlnConfig = {
        confirmations: 15,
        requiredDVNCount: 0,
        optionalDVNCount: 1,
        optionalDVNThreshold: 1,
        requiredDVNs: [],
        optionalDVNs: [
            //"0xd0a6fd2e542945d81d4ed82d8f4d25cc09c65f7f"
            "0x0ee552262f7b562efced6dd4a7e2878ab897d405",
            //"0x6f99ea3fc9206e2779249e15512d7248dab0b52e"
        ],
    };

    // Encode configs
    const configTypeUlnStruct = 'tuple(uint64 confirmations, uint8 requiredDVNCount, uint8 optionalDVNCount, uint8 optionalDVNThreshold, address[] requiredDVNs, address[] optionalDVNs)';
    const configTypeExecutorStruct = 'tuple(uint32 maxMessageSize, address executorAddress)';

    const sendEncodedUlnConfig = hre.ethers.utils.defaultAbiCoder.encode([configTypeUlnStruct], [sendUlnConfig]);
    const sendEncodedExecutorConfig = hre.ethers.utils.defaultAbiCoder.encode([configTypeExecutorStruct], [sendExecutorConfig]);
    const receiveEncodedUlnConfig = hre.ethers.utils.defaultAbiCoder.encode([configTypeUlnStruct], [receiveUlnConfig]);

    const bEid = hre.network.config.toEid;

    let tx;
    const gracePeriod = 0;

    const executorConfigType = 1;
    const ulnConfigType = 2;

    // Get the deployed TTOFT contract instance
    const oft = await hre.ethers.getContractAt('uildOFT', address, (await hre.ethers.getSigners())[0])

    // Set the peer for cross-chain communication
    const peerAddress = hre.network.config.oftAdapter.tokenAddress;
    const peerBytes32 = hre.ethers.utils.hexZeroPad(peerAddress, 32);

    console.log(`Setting peer for TTOFT: ${peerAddress} as ${peerBytes32}`);

    tx = await oft.setPeer(hre.network.config.toEid, peerBytes32);
    await tx.wait()

    // Example library addresses, replace with actual ones if needed
    const sendLibrary = "0x55f16c442907e86D764AFdc2a07C2de3BdAc8BB7"
    const receiveLibrary = "0x188d4bbCeD671A7aA2b5055937F79510A32e9683"

    const signer = (await hre.ethers.getSigners())[0];
    const endpointV2 = new hre.ethers.Contract(endpointV2Deployment.address, endpointV2Deployment.abi, signer);

    // Prepare SetConfigParam structs for ULN and Executor
    const setSendConfigParamUln = {
        eid: bEid,
        configType: ulnConfigType,
        config: sendEncodedUlnConfig,
    };

    const receiveConfigParamUln = {
        eid: bEid,
        configType: ulnConfigType,
        config: receiveEncodedUlnConfig,
    };

    const setSendConfigParamExecutor = {
        eid: bEid,
        configType: executorConfigType,
        config: sendEncodedExecutorConfig,
    };

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

    // Set config with struct array (not encoded bytes)
    console.log("Setting send config...");
    tx = await endpointV2.setConfig(address, sendLibrary, [setSendConfigParamUln, setSendConfigParamExecutor]);
    console.log("Waiting set send config...", tx.hash);
    await tx.wait()

    console.log("Setting receive config...");
    tx = await endpointV2.setConfig(address, receiveLibrary, [receiveConfigParamUln]);
    console.log("Waiting set receive config...", tx.hash);
    await tx.wait()

    // Set enforced options
    const MSG_TYPE = 1;
    const GAS_LIMIT = 100000;
    const MSG_VALUE = 0;

    const _options = Options.newOptions().addExecutorLzReceiveOption(GAS_LIMIT, MSG_VALUE)

    const enforcedOptions = {
        eid: bEid,
        msgType: MSG_TYPE,
        options: _options.toBytes(),
    }

    console.log("Setting enforced options...");
    tx = await oft.setEnforcedOptions([enforcedOptions])
    await tx.wait()

    // Set delegate if needed
    console.log("set delegate...");
    // tx = await endpointV2.setDelegate(address, delegate);
    // await tx.wait()

    console.log("EndpointV2 configuration completed");
}

deploy.tags = ['ConfigOFT']

export default deploy