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
        gasLimit: 5_000_000,
    })

    console.log(`Deployed contract: ${contractName}, network: ${hre.network.name}, address: ${address}`)
}

deploy.tags = ['DeployOFT']

export default deploy