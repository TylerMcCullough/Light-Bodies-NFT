const { ImmutableXClient } = require("@imtbl/imx-sdk")
const { AlchemyProvider } = require("@ethersproject/providers")
const { Wallet } = require("@ethersproject/wallet")

const dotenv =  require("dotenv")
dotenv.config();

const startCount = 0;
const finishCount = 100;

const ENV_CHECK = [
  "PRIVATE_KEY",
  "ALCHEMY_KEY",
  "CONTRACT_ADDRESS",
  "PUBLIC_KEY"
];

for (let [k, v] of Object.entries(process.env)) {
  if (!ENV_CHECK.includes(k)) continue;
  if (v.startsWith("<") && v.endsWith(">")) {
    console.error(`[ERROR] Replace ${k} value in .env with a valid one!`);
    process.exit(0);
  }
}

// setting up the provider
const provider = new AlchemyProvider("ropsten", process.env.ALCHEMY_KEY);

// this function blocks until the transaction is either mined or rejected
const waitForTransaction = async (promise) => {
  const txnId = await promise;
  console.info("Waiting for transaction", "TX id", txnId);
  const receipt = await provider.waitForTransaction(txnId);
  if (receipt.status === 0) {
    throw new Error("Transaction containing user registration rejected");
  }
  console.info(
    "Transaction containing user registration TX mined: " + receipt.blockNumber
  );
  return receipt;
};

const mint = async () => {
  for (let i = startCount; i < finishCount; i++) {
    // creating a signer from the provided private key
    const signer = new Wallet(process.env.PRIVATE_KEY).connect(provider);

    // initializing IMX-SDK client
    const client = await ImmutableXClient.build({
      // IMX's API URL
      publicApiUrl: "https://api.x.immutable.com/v1",
      // signer (in this case, whoever owns the contract)
      signer,
      // IMX's  STARK contract address
      starkContractAddress: "0x5FDCCA53617f4d2b9134B29090C87D01058e27e9",
      // IMX's  Registration contract address
      registrationContractAddress: "0x72a06bf2a1CE5e39cBA06c0CAb824960B587d64c",
    });

    // Registering the user (owner of the contract) with IMX
    const registerImxResult = await client.registerImx({
      // address derived from PK
      etherKey: client.address.toLowerCase(),
      starkPublicKey: client.starkPublicKey,
    });

    // If the user is already registered, there's is no transaction to await, hence no tx_hash
    if (registerImxResult.tx_hash === "") {
      console.info("Minter registered, continuing...");
    } else {
      // If the user isn't registered, we have to wait for the block containing the registration TX to be mined
      // This is a one-time process (per address)
      console.info("Waiting for minter registration...");
      await waitForTransaction(Promise.resolve(registerImxResult.tx_hash));
    }

    try {
      // this is the mintv2 (which will replace the client.mint in the near future!)
      // it allows you to add protocol-level royalties to the token
      // also, compared to mint(v1) where you batch minted tokens of different types to the same user
      // mintv2 batch mints token of the same type to multiple users (which makes sense,
      // considering you have to sign/be the owner of the token)
      const result = await client.mintV2([
        {
          contractAddress: process.env.CONTRACT_ADDRESS.toLowerCase(),
          // top-level "global" royalties that apply to this entire call
          // unless overriden on a token-by-token basis in the below array
          royalties: [
            // you can have multiple recipients!
            {
              // address of the recepient of royalties
              recipient: process.env.PUBLIC_KEY.toLowerCase(),
              percentage: 2.5,
            },
          ],
          // list of users that will receive token defined by the contract at the given address
          users: [
            {
              // address of the (IMX registered!) user we want to mint this token to
              // received as the first argument in mintFor() inside your L1 contract
              etherKey: process.env.PUBLIC_KEY.toLowerCase(),
              // list of tokens to be minted to the above address
              tokens: [
                // you can add multiple tokens (of the same type and from the same contract!)
                {
                  // ID of the token (received as the 2nd argument in mintFor), positive integer string
                  id: i.toString(),
                  // blueprint - can't be left empty, but if you're not going to take advantage
                  // of on-chain metadata, just keep it to a minimum - in this case a single character
                  // gets passed as the 3rd argument formed as {tokenId}:{blueprint (whatever you decide to put in it when calling this function)}
                  blueprint: "0",
                  // overriding "global" royalties we have added at the top level on a token basis
                  // this is completely! optional!
                  royalties: [
                    {
                      // user doesn't have to be the same, done for simplicity reasons
                      recipient:
                        process.env.PUBLIC_KEY.toLowerCase(),
                      percentage: 5.5,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]);

      /*
            Minting results formatted like

            {
                "first_tx_id": string,
                "mint_count": int
            }
        */
      console.log("Minting success!", `token id ${i}`, result);

      // operation can fail if the request is malformed or the tokenId provided already exists
    } catch (err) {
      console.error("Minting failed with the following", err);
    }
  }
};

mint()
module.exports = mint;
