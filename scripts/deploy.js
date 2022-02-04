async function main() {
    const lbNFT = await ethers.getContractFactory("lightBodiesNFT")
  
    // Start deployment, returning a promise that resolves to a contract object
    const contract = await lbNFT.deploy()
    console.log("Contract deployed to address:", contract.address)
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
