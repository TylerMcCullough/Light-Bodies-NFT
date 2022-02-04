require("dotenv").config()
const ALCHEMY_KEY = process.env.ALCHEMY_KEY
const PUBLIC_KEY = process.env.PUBLIC_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY
const contractAddress = process.env.CONTRACT_ADDRESS

const { createAlchemyWeb3 } = require("@alch/alchemy-web3")
const web3 = createAlchemyWeb3(ALCHEMY_KEY)

const contract = require("../artifacts/contracts/lbNFT.sol/lightBodiesNFT.json")
const nftContract = new web3.eth.Contract(contract.abi, contractAddress)

const mintNFT = async (tokenURI) => {
  const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, "latest") //get latest nonce

  //the transaction
  const tx = {
    from: PUBLIC_KEY,
    to: contractAddress,
    nonce: nonce,
    gas: 500000,
    data: nftContract.methods.mintNFT(PUBLIC_KEY, tokenURI).encodeABI(),
  }
  const signPromise = web3.eth.accounts.signTransaction(tx, PRIVATE_KEY)
  signPromise
    .then((signedTx) => {
      web3.eth.sendSignedTransaction(
        signedTx.rawTransaction,
        function (err, hash) {
          if (!err) {
            console.log(
              "The hash of the transaction is: ",
              hash,
            )
            return hash
          } else {
            console.log(
              "Something went wrong when submitting your transaction:",
              err
            )
          }
        }
      )
    })
    .catch((err) => {
      console.log(" Promise failed:", err)
    })
    return nonce
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function main(){
  for (i = 101; i <= 100; i++){
    console.log(`\nToken Id: ${i}`)
    tURI = `https://ipfs.io/ipfs/QmepShEMeGpKXEERpPfDeoenRX8UjTdSspEmbco87njYBy/${i}.json`
    await mintNFT(tURI)
    await sleep(10000);
  }
}

main()
module.exports = mintNFT