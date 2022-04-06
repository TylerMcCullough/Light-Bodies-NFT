const os = require("opensea-js")
const HDWalletProvider = require("@truffle/hdwallet-provider");
const Network = os.Network
const OpenSeaPort = os.OpenSeaPort
const MnemonicWalletSubprovider = require('@0x/subproviders')
  .MnemonicWalletSubprovider
const RPCSubprovider = require('web3-provider-engine/subproviders/rpc')
const Web3ProviderEngine = require('web3-provider-engine')

require("dotenv").config()
const OPENSEA_KEY = process.env.API_KEY
const cAdd = process.env.API_KEY
const PUBLIC_KEY = process.env.PUBLIC_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY
const INFURA_KEY = process.env.INFURA_KEY
const MNEMONIC = process.env.MNEMONIC
const NETWORK = process.env.NETWORK

const BASE_DERIVATION_PATH = `44'/60'/0'/0`

const mnemonicWalletSubprovider = new MnemonicWalletSubprovider({
  mnemonic: MNEMONIC,
  baseDerivationPath: BASE_DERIVATION_PATH,
})
console.log(mnemonicWalletSubprovider)
const infuraRpcSubprovider = new RPCSubprovider({
  rpcUrl: INFURA_KEY,
})

const providerEngine = new Web3ProviderEngine()
providerEngine.addProvider(mnemonicWalletSubprovider)
providerEngine.addProvider(infuraRpcSubprovider)
providerEngine.start()


const seaport = new OpenSeaPort(
    providerEngine,
    {
      networkName:
      NETWORK === 'mainnet' || NETWORK === 'live'
        ? Network.Main
        : Network.Rinkeby,
      apiKey: OPENSEA_KEY,
    },
    (arg) => console.log(arg)
  );

const sellNFT = async (token, tokenAdd) => {
    console.log("Auctioning an item for a fixed price...");
    const fixedPriceSellOrder = await seaport.createSellOrder({
      asset: {
        tokenId: token,
        tokenAddress: tokenAdd,
      },
      startAmount: 0.08,
      expirationTime: 0,
      accountAddress: PUBLIC_KEY,
    })
    console.log(
      `Successfully created a fixed-price sell order! ${fixedPriceSellOrder.asset.openseaLink}\n`
    );
    return fixedPriceSellOrder.asset.openseaLink
  }

sellNFT(1, cAdd)
module.exports = sellNFT