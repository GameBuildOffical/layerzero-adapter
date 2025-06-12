import { ethers } from "hardhat";
import { type DeployFunction } from 'hardhat-deploy/types'

const deploy: DeployFunction = async (hre) => {
    // Get signer
    const [signer] = await ethers.getSigners();

    const { getNamedAccounts, deployments } = hre

    const { deployer } = await getNamedAccounts()

    console.log(`Network: ${hre.network.name}`)
    console.log(`Deployer: ${deployer}`)

    const ttoftDeployment = await deployments.get('GameBuildOFT');

    // Create contract instance
    const ttOFT = new ethers.Contract(ttoftDeployment.address, ttoftDeployment.abi, signer);

    const tt = new ethers.Contract(ttoftDeployment.address, ttoftDeployment.abi, signer);

    const amount = ethers.utils.parseEther("1000")

    console.log(`Approving ${amount} tokens for transfer...`);
    // Approve the token transfer
    const approveTx = await tt.approve(ttOFT.address, amount);
    console.log("Approval tx hash:", approveTx.hash);
    await approveTx.wait();

    const toBytes32 = hre.ethers.utils.hexZeroPad(deployer, 32);

    const sendParam = {
        dstEid: hre.network.config.toEid,
        to: toBytes32,
        amountLD: amount,
        minAmountLD: amount,
        extraOptions: "0x", // Set any extra options if needed
        composeMsg: "0x",
        oftCmd: "0x",
    }
    console.log(sendParam)

    const val = await ttOFT.quoteSend(sendParam, 0) 

    const feeParam = {
        nativeFee: val.nativeFee,
        lzTokenFee: 0
    }


    // Call send
    const tx = await ttOFT.send(sendParam, feeParam, deployer, {value: val.nativeFee});
    console.log("Send tx hash:", tx.hash);
    await tx.wait();
    console.log("Send complete.");
}

deploy.tags = ['Sendback']; // or any tag you want
export default deploy;
