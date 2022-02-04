mintNFT = require('../scripts/mintNFT')

for (i = 8; i >= 100; i++){
      tURI = `https://ipfs.io/ipfs/QmepShEMeGpKXEERpPfDeoenRX8UjTdSspEmbco87njYBy/${i}.json`
      mintNFT(tURI)
      }
