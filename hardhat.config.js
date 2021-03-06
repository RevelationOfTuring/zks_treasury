require("@nomiclabs/hardhat-waffle");

const PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.7",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    }
                },
            },
            {
                version: "0.4.17",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    }
                },
            }
        ]

    },

    networks: {
        local_network: {
            url: 'http://127.0.0.1:8545',
            accounts: [PRIVATE_KEY],
        }
    }
};
