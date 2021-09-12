const BreitlexNFT = artifacts.require("BreitlexNFT");

module.exports = async function(deployer, network, accounts) {

    let breitlexWallet;
    //get address for programmer and client wallet
    await web3.eth.getAccounts().then(function(result){
        breitlexWallet = result[0];
    });
    
    //deploy freelancer contract
    await deployer.deploy(BreitlexNFT, {from: breitlexWallet}).then(()=> {
        console.log("BreitlexNFT Contract:" + BreitlexNFT.address);
      }
    );
    
};