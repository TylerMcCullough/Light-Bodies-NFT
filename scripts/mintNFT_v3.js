require("dotenv").config()
const ALCHEMY_KEY = process.env.ALCHEMY_KEY
const PUBLIC_KEY = process.env.PUBLIC_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY
const contractAddress = process.env.CONTRACT_ADDRESS
const axios = require('axios')

const sP = 806
const eP = 3333

const { createAlchemyWeb3 } = require("@alch/alchemy-web3")
const web3 = createAlchemyWeb3(ALCHEMY_KEY)

const contract = require("../artifacts/contracts/lbNFT.sol/lightBodiesNFT.json")
const nftContract = new web3.eth.Contract(contract.abi, contractAddress)

const mintNFT = async (i) => {
  if (i > eP){
    return console.log(`${i-1} Token Id(s) Completed`)
  }
  tokenURI = `https://ipfs.io/ipfs/QmZp9aPd1i8heNKwRLL38fJ4RgV6yf5GWtNbJhwiQHLyW3/${i}.json`
  console.log(`tokenURI Id: ${i}`)
  const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, "latest")

  const tx = {
    from: PUBLIC_KEY,
    to: contractAddress,
    nonce: nonce,
    gas: 500000,
    data: nftContract.methods.mintNFT(PUBLIC_KEY, tokenURI).encodeABI(),
  }
  try{
    const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
    await web3.eth.sendSignedTransaction(
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
    mintNFT(i)
  }catch(e)
  {
    if (e.includes("nonce too low"))
    {
      i++
    }
    console.log(e)
    mintNFT(i)
  }
}

mintNFT(sP)
module.exports = mintNFT