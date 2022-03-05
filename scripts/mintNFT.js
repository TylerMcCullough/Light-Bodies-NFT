require("dotenv").config()
const ALCHEMY_KEY = process.env.ALCHEMY_KEY
const PUBLIC_KEY = process.env.PUBLIC_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY
const contractAddress = process.env.CONTRACT_ADDRESS
const axios = require('axios')

const { createAlchemyWeb3 } = require("@alch/alchemy-web3")
const web3 = createAlchemyWeb3(ALCHEMY_KEY)

const contract = require("../artifacts/contracts/lbNFT.sol/lightBodiesNFT.json")
const nftContract = new web3.eth.Contract(contract.abi, contractAddress)
let gHash

const checkTx = async(pera) =>{
  const data = await axios({
      url: ALCHEMY_KEY,
      method: 'POST',
      data: {
              jsonrpc:"2.0",
              method:"eth_getTransactionByHash",
              params:[pera],
              id:0
      }
    })
    return data.data.result.blockNumber
}

const mintNFT = async (tokenURI) => {
  const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, "latest") //get latest nonce

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
          gHash = hash
          return hash
        } else {
          console.log(
            "Something went wrong when submitting your transaction:",
            err
          )
        }
      }
    )

  }catch(e)
  {
    console.log(e)
    return nonce;
  }
}

const callMint = async (i) => {
  console.log(`\nToken Id: ${i}`)
  tURI = `https://ipfs.io/ipfs/QmZp9aPd1i8heNKwRLL38fJ4RgV6yf5GWtNbJhwiQHLyW3/${i}.json`
  nonce = await mintNFT(tURI);
  let cR = await checkTx(gHash)
  while (cR == null)
  {
    cR = await checkTx(gHash)
  }
}

async function main(){
  for (i = 639; i <= ; i++){
    await callMint(i)
  }
}

main()
module.exports = mintNFT