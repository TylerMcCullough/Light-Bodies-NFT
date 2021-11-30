import { AlchemyProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { ImLogger, WinstonLogger } from ImmutableXClient, MintableERC721TokenType } from '@imtbl/imx-sdk';

import env from './config/client';
import { loggerConfig } from './config/logging';

const provider = new AlchemyProvider('ropsten', env.alchemyApiKey);
const log: ImLogger = new WinstonLogger(loggerConfig);
const component = 'imx-bulk-mint-script';

const waitForTransaction = async (promise: Promise<string>) => {
    const txId = await promise;
    log.info(component, 'Waiting for transaction', {
      txId,
      etherscanLink: `https://ropsten.etherscan.io/tx/${txId}`,
      alchemyLink: `https://dashboard.alchemyapi.io/mempool/eth-ropsten/tx/${txId}`,
    });
    const receipt = await provider.waitForTransaction(txId);
    if (receipt.status === 0) {
      throw new Error('Transaction rejected');
    }
    log.info(component, 'Transaction Mined: ' + receipt.blockNumber);
    return receipt;
};

(async (): Promise<void> => {
    const mintToWallet = '0x....'; // eth wallet public address which will receive the token
    const signer = new Wallet(process.env.PRIVATE_KEY!).connect(provider);

    const minter = await ImmutableXClient.build({
      publicApiUrl: process.env.PUBLIC_API_URL, // https://api.ropsten.x.immutable.com/v1 for ropsten, https://api.x.immutable.com/v1 for mainnet
      signer: signer,
      starkContractAddress: process.env.STARK_CONTRACT_ADDRESS, // 0x4527BE8f31E2ebFbEF4fCADDb5a17447B27d2aef for ropsten, 0x5FDCCA53617f4d2b9134B29090C87D01058e27e9 for mainnet
      registrationContractAddress: process.env.REGISTRATION_CONTRACT_ADDRESS, // 0x6C21EC8DE44AE44D0992ec3e2d9f1aBb6207D864 for ropsten, 0x72a06bf2a1CE5e39cBA06c0CAb824960B587d64c for mainnet
      gasLimit: process.env.GAS_LIMIT,
      gasPrice: process.env.GAS_PRICE,
    });

    log.info(component, 'MINTER REGISTRATION');
    const registerImxResult = await minter.registerImx({
      etherKey: minter.address.toLowerCase(),
      starkPublicKey: minter.starkPublicKey,
    });

    if (registerImxResult.tx_hash === '') {
      log.info(component, 'Minter registered, continuing...');
    } else {
      log.info(component, 'Waiting for minter registration...');
      await waitForTransaction(Promise.resolve(registerImxResult.tx_hash));
    }

    const result = await minter.mint({
      mints: [
        {
          etherKey: mintToWallet.toLowerCase(),
          tokens: [{
            type: MintableERC721TokenType.MINTABLE_ERC721,
            data: {
                tokenAddress: env.tokenAddress, // address of token
                id: '123', // must be a unique uint256 as a string
                blueprint: 'metadata', // metadata can be anything but your L1 contract must parse it on withdrawal from the blueprint format '{tokenId}:{metadata}'
            },
          }],
          nonce: '1',
          authSignature: '', // Leave empty
        },
      ],
    });
    console.log(result);
})().catch((e) => {
    log.error(component, e);
    process.exit(1);
});