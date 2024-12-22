var ethr = artifacts.require("EthereumDIDRegistry");

module.exports = function(deployer) {
   deployer.deploy(ethr);
};
