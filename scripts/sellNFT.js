require("dotenv").config()
const OPENSEA_KEY = process.env.OPENSEA_KEY
const ALCHEMY_KEY = process.env.ALCHEMY_KEY
const contractAddress = process.env.CONTRACT_ADDRESS
const NETWORK = process.env.NETWORK;
const OWNER_ADDRESS = process.env.PUBLIC_KEY
const Web3 = require("web3");


const os = require("opensea-js")
const HDWalletProvider = require("@truffle/hdwallet-provider");
const provider = new HDWalletProvider({
  mnemonic: "wallet mnemonic",
  providerOrUrl: ALCHEMY_KEY,
  addressIndex: 1
});
const seaport = new os.OpenSeaPort(
    provider,
    {
      networkName:
        NETWORK === "mainnet" || NETWORK === "live"
          ? os.Network.Matic
          : os.Network.Mumbai,
      apiKey: OPENSEA_KEY,
    }
  );
  
const sellNFT = async (tokenID, price) => {
    console.log("Auctioning an item for a fixed price...");
    const fixedPriceSellOrder = await seaport.createSellOrder({
      asset: {
        tokenId: tokenID,
        tokenAddress: contractAddress,
      },
      startAmount: price,
      endAmount: price,
      expirationTime: 0,
      accountAddress: OWNER_ADDRESS,
    });
    console.log(
      `Successfully created a fixed-price sell order! ${fixedPriceSellOrder.asset.openseaLink}\n`
    );
    return fixedPriceSellOrder.asset.openseaLink
    }

module.exports = sellNFT