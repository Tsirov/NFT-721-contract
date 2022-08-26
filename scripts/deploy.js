
const { ethers } = require("hardhat")

async function main() {
  const nftContract = await ethers.getContractFactory("NftToken")
  console.log("Deploying contract...")
  const contract = await nftContract.deploy()
  await contract.deployed()
  console.log(`Deployed contract to: ${contract.address}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })