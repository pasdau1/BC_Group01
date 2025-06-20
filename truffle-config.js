module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },

    poa: {
      provider: () => {
        // << erst hier wird require aufgerufen >>
        const HDWalletProvider = require("@truffle/hdwallet-provider");
        return new HDWalletProvider(process.env.PRIVATE_KEY, process.env.RPC_URL);
      },
      network_id: 1317,
      gasPrice: 20e9
    }
  },
  contracts_directory: "./hardhat/contracts",
  contracts_build_directory: "./hardhat/build/truffle",
  compilers: { solc: { version: "0.8.22" } }
};