require("dotenv").config()
const ALCHEMY_KEY = process.env.ALCHEMY_KEY
const PUBLIC_KEY = process.env.PUBLIC_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY
const contractAddress = process.env.CONTRACT_ADDRESS

const sP = 1
const eP = 3333

const { createAlchemyWeb3 } = require("@alch/alchemy-web3")
const web3 = createAlchemyWeb3(ALCHEMY_KEY)

const contract = require("../artifacts/contracts/lbNFT.sol/lightBodiesNFT.json")
const nftContract = new web3.eth.Contract(contract.abi, contractAddress)
let sentTx

const mintNFT = async (i, g) => {
  if (i > eP){
    return console.log(`${i-1} Minting Completed`)
  }
  tokenURI = `https://ipfs.io/ipfs/QmW9t74f2Z9ZHvjqxQMNmvJaL9CXxGR8QHAdarfQ6YWAsZ/${i}.json`
  console.log(`tokenURI Id: ${i}`)
  const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, "latest")
  const gasPrice = await web3.eth.getGasPrice() * g
 
  const tx = {
    from: PUBLIC_KEY,
    to: contractAddress,
    nonce: nonce,
    gas: 500000,
    data: nftContract.methods.mintNFT(PUBLIC_KEY, tokenURI, i).encodeABI(),
    gasPrice: Math.round(gasPrice)
  }

  try{
    const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
    sentTx = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction,
      function (err, hash) {
        if (!err) {
          console.log(`Nonce: ${nonce}  ----  TxHash: ${hash}`)
          return hash
        } else {
          console.log(
            "Something went wrong when submitting your transaction:",
            err
        )
      }
    }
    )
    i++
    mintNFT(i, 1)
  }catch(e)  {
    if (e.toString().includes("replacement transaction underpriced")){
      console.log("Error : Replacement Underpriced")
      console.log("Error Handled")
      pending = sentTx.transactionHash
      mintNFT(i, 1.101)
    }
    else if (e.toString().includes("Transaction has been reverted by the EVM"))
    {
      console.log("Error: Reverted")
      console.log("Error Handled")
      pending = 0
      i++
      mintNFT(i, 1)
    }
    else if (e.toString().includes("was not mined within 750 seconds"))
    {
      console.log("Error: TimedOut")
      console.log("Error Handled")
      pending = sentTx.transactionHash
      mintNFT(i, 1.101)
    }
    else {
      console.log(e)
      mintNFT(i, 1)
    }
  }
}

mintNFT(sP, 1)
module.exports = mintNFT