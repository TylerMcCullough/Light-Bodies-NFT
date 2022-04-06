const os = require("opensea-js")
const HDWalletProvider = require("@truffle/hdwallet-provider");

require("dotenv").config()
const OPENSEA_KEY = process.env.API_KEY
const ca = process.env.API_KEY
const PUBLIC_KEY = process.env.PUBLIC_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY
const INFURA_KEY = process.env.INFURA_KEY

async function createProvider() {
  const pvd = new HDWalletProvider(PRIVATE_KEY, INFURA_KEY)
  return pvd
}

const provider = createProvider()
console.log(provider.initialize)

const seaport = new os.OpenSeaPort(
    provider,
    {
      networkName: os.Network.Main,
      apiKey: OPENSEA_KEY,
    }
  );

const sellNFT = async (tokenId, tokenAddress) => {
    console.log("Auctioning an item for a fixed price...");
    const fixedPriceSellOrder = await seaport.createSellOrder({
      asset: {
        tokenId,
        tokenAddress,
      },
      accountAddress: PUBLIC_KEY,
      startAmount: 0.08
    })
    console.log(
      `Successfully created a fixed-price sell order! ${fixedPriceSellOrder.asset.openseaLink}\n`
    );
    return fixedPriceSellOrder.asset.openseaLink
  }

sellNFT(1, ca)
module.exports = sellNFT