const opensea = require("opensea-js");
const OpenSeaPort = opensea.OpenSeaPort;
require('dotenv').config()

const Network = opensea.Network;
const MnemonicWalletSubprovider = require("@0x/subproviders")
  .MnemonicWalletSubprovider;
const RPCSubprovider = require("web3-provider-engine/subproviders/rpc");
const Web3ProviderEngine = require("web3-provider-engine");

const MNEMONIC = process.env.MNEMONIC;
const PUBLIC_KEY = process.env.PUBLIC_KEY
const ALCHEMY_KEY = process.env.ALCHEMY_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const NETWORK = process.env.NETWORK;
const API_KEY = process.env.API_KEY || "";

const BASE_DERIVATION_PATH = `44'/966'/0'/0`;

const mnemonicWalletSubprovider = new MnemonicWalletSubprovider({
  mnemonic: MNEMONIC,
  baseDerivationPath: BASE_DERIVATION_PATH,
});
const network =
  NETWORK === "mainnet" || NETWORK === "live" ? "mainnet" : "mumbai";
const alchemyRpcSubprovider = new RPCSubprovider(ALCHEMY_KEY);

const providerEngine = new Web3ProviderEngine();
providerEngine.addProvider(mnemonicWalletSubprovider);
providerEngine.addProvider(alchemyRpcSubprovider);
providerEngine.start();

const seaport = new OpenSeaPort(
  providerEngine,
  {
    networkName:
      NETWORK === "mainnet" || NETWORK === "live"
        ? Network.Main
        : Network.Mumbai,
    apiKey: API_KEY,
  }
);

const sell = async (token_id) => {
  console.log("Auctioning an item for a fixed price...");
  let token_address = CONTRACT_ADDRESS
  const fixedPriceSellOrder = await seaport.createSellOrder({
      asset: {
        tokenId: token_id,
        tokenAddress: token_address
      },
      startAmount: 0.08,
      expirationTime: 0,
      accountAddress: PUBLIC_KEY,
    });
  console.log(
    `Successfully created a fixed-price sell order! ${fixedPriceSellOrder.asset.openseaLink}\n`
  );

}

sell(1)
module.exports = sell