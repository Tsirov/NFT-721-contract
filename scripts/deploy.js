const { ethers, run ,network } = require('hardhat');

async function main() {
  const nftContract = await ethers.getContractFactory('NftToken');
  console.log('Deploying contract...');
  const contract = await nftContract.deploy();
  await contract.deployed();
  console.log(`Deployed contract to: ${contract.address}`);
  
  //This is to verify contract on some ot network on etherscan (mainnet, rinkeby and so on )
  // if(network.config.chainId !== 31337 && process.env.ETHERSCAN_API_KEY){
  //   await simpleStorage.deployTransaction.wait(6);
  //   await verify(simpleStorage.address, [])
  // }
}

async function verify(contractAddress, args) {
  console.log('Verifying contract...');
  try {
    await run('verify:verify', {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error) {
    if(error.message.toLowerCase().includes('already verified')){
      console.log('Already Verified!');
    }
    console.log(error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
