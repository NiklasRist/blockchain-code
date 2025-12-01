require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {},

    localhost: {
      url: "http://127.0.0.1:8545"
    },

    ganache: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: [
        process.env.GANACHE_PK0,
        process.env.GANACHE_PK1,
        process.env.GANACHE_PK2,
      ]
    }
  }
};
