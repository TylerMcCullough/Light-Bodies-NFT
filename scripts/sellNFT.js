require("dotenv").config()
const OPENSEA_KEY = process.env.OPENSEA_KEY
const ALCHEMY_KEY = process.env.ALCHEMY_KEY
const contractAddress = process.env.CONTRACT_ADDRESS
const NETWORK = process.env.NETWORK
const OWNER_ADDRESS = process.env.PUBLIC_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY
const INFURA_KEY = process.env.INFURA_KEY


const os = require("opensea-js")
const HDWalletProvider = require("@truffle/hdwallet-provider");
const provider = new HDWalletProvider(PRIVATE_KEY, INFURA_KEY)

const seaport = new os.OpenSeaPort(
    provider,
    {
      networkName:
        NETWORK === "mainnet" || NETWORK === "live"
          ? os.Network.Main
          : os.Network.Mumbai,
      apiKey: OPENSEA_KEY,
    }
  );
  
const sellNFT = async (tokenID) => {
    console.log("Auctioning an item for a fixed price...");
    const fixedPriceSellOrder = await seaport.createSellOrder({
      asset: {
        tokenId: tokenID,
        tokenAddress: contractAddress,
      },
      startAmount: 0.08,
      expirationTime: 0,
      accountAddress: OWNER_ADDRESS,
    });
    console.log(
      `Successfully created a fixed-price sell order! ${fixedPriceSellOrder.asset.openseaLink}\n`
    );
    return fixedPriceSellOrder.asset.openseaLink
    }

sellNFT(1)
module.exports = sellNFT