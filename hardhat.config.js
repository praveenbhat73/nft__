const fs = require('fs');
require('@nomiclabs/hardhat-waffle');



const privateKey = fs.readFileSync('.secret').toString().trim();

const GOERLI_PRIVATE_KEY = privateKey;//

module.exports = {

  solidity: '0.8.4',
  networks: {
    sepoliaeth: {
      url: 'https://eth-sepolia.g.alchemy.com/v2/{key}',
      accounts: [GOERLI_PRIVATE_KEY],
    },
  },
};
