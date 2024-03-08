// const fs = require('fs');
require('@nomiclabs/hardhat-waffle');


// Go to https://www.alchemyapi.io, sign up, create
// a new App in its dashboard, and replace "KEY" with its key
// const ALCHEMY_API_KEY = 'Wh7txfAjK8Dr7o1dUQX-2Wd3herOaXKL';

// Replace this private key with your Goerli account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Beware: NEVER put real Ether into testing accounts

//df2fpeuqfyf7wkpp
module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
    },
  },
  solidity: '0.8.4',
  // networks: {
  //   goerli: {
  //     url: 'https://eth-goerli.g.alchemy.com/v2/Wh7txfAjK8Dr7o1dUQX-2Wd3herOaXKL',
  //     accounts: [GOERLI_PRIVATE_KEY],
  //   },
  // },
};
//Wh7txfAjK8Dr7o1dUQX-2Wd3herOaXKL
