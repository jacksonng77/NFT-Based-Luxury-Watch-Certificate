import Web3 from "web3";
import breitlexNFTArtifact from "../../build/contracts/BreitlexNFT.json";
import 'bootstrap';
import { Modal, Popover } from 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ipfsURI = "https://gateway.pinata.cloud/ipfs/";

const App = {

  //web3 declarations
  web3: null,
  account: null,
  meta: null,
  breitlexNFTContract:null,              //actual breitlexNFT contract object
  breitlexNFTContractAddress:null,        //address of the breitlexNFT contract
  popoverTriggerList:null,
  popoverList: null,
  freelancerContractStatus: null,
  currentToken: null,
  contractOwnerAddress: null,

  //ui declarations
  uiSpnLoad:null,
  uiSpnMint: null,
  uiSpnTransfer: null,
  uiSpnAuthorize: null,
  uiConContract:null,
  uiSpnContractAction: null,
  uiLblContractAddress:null,
  uiLblOwnerAddress:null,
  uiTxtContractAddress:null,
  uiLblName: null,
  uiLblSymbol:null,
  uiBtnDeploy: null,
  uiBtnDeployPopover: null,
  uiConToken: null,
  uiLblTokenModel: null,
  uiLblTokenManufacturedDate: null,
  uiLblTokenSerialNumber: null,
  uiImgTokenPicture: null,
  uiLblTokenOwner: null,
  uiTxtTokenId: null,
  uiBtnTransferToken: null,
  uiTxtTransferToken: null,
  uiBtnAuthorizeEscrow: null,
  uiTxtAuthorizeEscrow: null,
  
  


  start: async function() {
    const { web3 } = this;
    //get accounts
    const accounts = await web3.eth.getAccounts();
    this.account = accounts[0];
    this.uiBtnDeploy = document.getElementById("btn-Deploy");
    //this.uiBtnDeploy.classList.add("disabled");
    
    this.uiBtnDeployPopover = new Popover(this.uiBtnDeploy);
  },

  btnGo: function(){
    this.uiBtnDeployPopover.hide();

    this.uiTxtContractAddress = document.getElementById("txt-contract-address").value;
    if (this.uiTxtContractAddress === ""){
      this.deployBreitlexNFT();
    }
    else {
        this.retrieveBreitLexNFT(this.uiTxtContractAddress);  
    }
  },

  btnGoClient: function(){
    const { web3 } = this;
    this.uiBtnDeployPopover.hide();
    this.uiTxtContractAddress = document.getElementById("txt-contract-address").value;
    if (this.uiTxtContractAddress === ""){
      this.uiBtnDeployPopover.show();
    }
    else{
      this.freelanceContractAddress = this.uiTxtContractAddress;
      this.freelancerContract = new web3.eth.Contract(freelancerArtifact.abi, this.freelanceContractAddress);
      this.retrieveBreitLexNFT(this.uiTxtContractAddress);
    }
  },

  btnViewToken: async function(){
      this.uiTxtTokenId = document.getElementById("txt-token-id");
      this.currentToken = this.uiTxtTokenId.value;
      this.utilGetTokenDetails(this.uiTxtTokenId.value);
  },

  btnTransferToken: async function(){
    this.uiTxtTransferToken = document.getElementById("txt-transfer-address");
    console.log(this.uiTxtTransferToken.value);
    console.log(this.currentToken);

    this.uiSpnTransfer = document.getElementById("spn-transfer");
    this.uiSpnTransfer.classList.remove('d-none');

    this.breitlexNFTContract.methods.safeTransferFrom(this.account,this.uiTxtTransferToken.value, this.currentToken).send({from: this.account})
    .then((result) =>{
      App.transferModal = Modal.getInstance(document.getElementById('transferModal'));
      App.transferModal.hide();
      this.utilGetTokenDetails(this.currentToken);
      this.uiSpnTransfer.classList.add('d-none');
    });
  },

  btnAuthorizeEscrow: async function(){
    this.uiTxtAuthorizeEscrow = document.getElementById("txt-authorize-address");
    console.log(this.uiTxtAuthorizeEscrow.value);
    console.log(this.currentToken);

    this.uiSpnAuthorize = document.getElementById("spn-authorize");
    this.uiSpnAuthorize.classList.remove('d-none');

    this.breitlexNFTContract.methods.approve(this.uiTxtAuthorizeEscrow.value, this.currentToken).send({from: this.account})
    .then((result) =>{
      App.AuthorizeModal = Modal.getInstance(document.getElementById('AuthorizeModal'));
      App.AuthorizeModal.hide();
      this.utilGetTokenDetails(this.currentToken);
      this.uiSpnAuthorize.classList.add('d-none');
    });
  },

  btnMint: async function(){
    //temp 28th Aug 2021 - upload file
    if (parseFloat(document.getElementById("file-watchpic").files[0].size / 1024).toFixed(2) > 200){
      document.getElementById("file-watchpic").style.visibility
      document.getElementById("file-size-alert").classList.remove('d-none');
    }
    else if (document.getElementById("Mint-Form").checkValidity()){
        document.getElementById("file-size-alert").classList.add('d-none');
        this.uiSpnMint = document.getElementById("spn-mint");
        this.uiSpnMint.classList.remove('d-none');

        var data = new FormData();
        var fileInput = document.getElementById("file-watchpic").files[0];
        console.log(fileInput.name.toString());
        data.append("image", fileInput, fileInput.name.toString());
        data.append("model", document.getElementById("txt-model").value);
        data.append("manufactureddate", document.getElementById("txt-manufactured-date").value);
        data.append("serialnumber", document.getElementById("txt-serial-number").value);

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", (event)=> {
          console.log(event.target.readyState);
          if (event.target.readyState === 4)  {
            var myipfsURI = ipfsURI + JSON.parse(event.target.responseText).IpfsHash;
            console.log(myipfsURI);
            this.breitlexNFTContract.methods.mint(this.account, myipfsURI).send({from: this.account})
            .on('error', function(error, receipt) { 
              console.log("a");
              App.uiSpnMint.classList.add('d-none');
              App.mintModal = Modal.getInstance(document.getElementById('mintModal'));
              App.mintModal.hide();
            }) 
            .then((result) =>{
              this.currentToken = result.events.Transfer.returnValues.tokenId;
              console.log(this.currentToken);
              console.log(this.breitlexNFTContract);
              console.log(this.breitlexNFTContractAddress);

              this.uiSpnMint.classList.add('d-none');
              App.uiSpnMint.classList.add('d-none');
              App.mintModal = Modal.getInstance(document.getElementById('mintModal'));
              App.mintModal.hide();

              this.utilGetTokenDetails(this.currentToken);
              this.utilGetTotalSupply();
            });
          }
        });

        xhr.open("POST", "https://breitlexipfsapi.glitch.me/nftwrite");
        xhr.send(data); 
      }
    else{
          console.log("nope");
    }
  },

  utilGetTotalSupply: async function(){
    this.uiLblTotalSupply = document.getElementById("lbl-total-supply");

    let totalRow;
    let totalDisbursed=0;
    let totalValue = 0;
    //may need to put await
    await this.breitlexNFTContract.methods.totalSupply().call().then((result) => {
      this.uiLblTotalSupply.innerHTML = result;
      console.log(result);
    });

  },

  utilRefreshHeader: async function(ContractAddress){
    const { web3 } = this;
    this.breitlexNFTContract = new web3.eth.Contract(breitlexNFTArtifact.abi, ContractAddress);
    this.uiConContract = document.getElementById("con-contract");
    this.uiLblContractAddress = document.getElementById("lbl-contract-address");
    this.uiLblOwnerAddress = document.getElementById("lbl-owner-address");
    this.uiLblName = document.getElementById("lbl-name");
    this.uiLblSymbol = document.getElementById("lbl-symbol");

    this.uiConContract.classList.remove('d-none');

    this.uiLblContractAddress.textContent = ContractAddress;

    this.breitlexNFTContract.methods.owner().call().then((result) =>{
      this.uiLblOwnerAddress.textContent = result;
      this.contractOwnerAddress = result;
    });

    this.breitlexNFTContract.methods.name().call().then((result) =>{
      this.uiLblName.textContent = result;
    });

    this.breitlexNFTContract.methods.symbol().call().then((result) =>{
      this.uiLblSymbol.textContent = result;
    });

    //update the ETH Value boxes
    this.utilGetTotalSupply();
  },

  utilGetTokenDetails: async function(tokenID){
    this.breitlexNFTContract.methods.tokenURI(tokenID).call().then((result) =>{     
      this.httpGet(result).then((myURL) =>{
        //show the container
        this.uiConToken = document.getElementById("con-token");
        this.uiConToken.classList.remove('d-none');
        console.log(JSON.parse(myURL));

        //Show the owner
        this.uiLblTokenOwner = document.getElementById("lbl-token-owner");
        this.breitlexNFTContract.methods.ownerOf(tokenID).call()
        .then((result) => {
          console.log(result);
          this.uiLblTokenOwner.textContent =  result;

          //should I show the transfer token button?
          if (result === this.account){
            this.uiBtnTransferToken = document.getElementById("btn-Transfer-Token");
            this.uiBtnTransferToken.classList.remove('d-none');

            this.uiBtnAuthorizeEscrow = document.getElementById("btn-Authorize-Escrow");
            this.uiBtnAuthorizeEscrow.classList.remove('d-none');
          }
          else{
            this.uiBtnTransferToken = document.getElementById("btn-Transfer-Token");
            this.uiBtnTransferToken.classList.add('d-none');      
          
            this.uiBtnAuthorizeEscrow = document.getElementById("btn-Authorize-Escrow");
            this.uiBtnAuthorizeEscrow.classList.add('d-none');   
          }

          //Show the model, manufactured date, serila number
          this.uiLblTokenModel = document.getElementById("lbl-token-model");
          this.uiLblTokenModel.textContent = JSON.parse(myURL)["model"];
          this.uiLblTokenManufacturedDate = document.getElementById("lbl-token-manufactured-date");
          this.uiLblTokenManufacturedDate.textContent = JSON.parse(myURL)["manufactured-date"];
          this.uiLblTokenSerialNumber = document.getElementById("lbl-token-serial-number");
          this.uiLblTokenSerialNumber.textContent = JSON.parse(myURL)["serial-number"];

          //Show the Picture
          this.uiImgTokenPicture = document.getElementById("img-token-picture");
          this.uiImgTokenPicture.src = JSON.parse(myURL).photo;
        }).catch((err) => {
          console.log(err);
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
  },

  //thank you: https://stackoverflow.com/questions/10642289/return-html-content-as-a-string-given-url-javascript-function
  httpGet: async function(theUrl)
  {
      let xmlhttp;
      if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
          xmlhttp=new XMLHttpRequest();
      } else { // code for IE6, IE5
          xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
      }
      xmlhttp.onreadystatechange=function() {
          if (xmlhttp.readyState==4 && xmlhttp.status==200) {
              return xmlhttp.responseText;
          }
      }
      xmlhttp.open("GET", theUrl, false);
      xmlhttp.send();
      return xmlhttp.response;
  },

  retrieveBreitLexNFT: function(ContractAddress){
    this.utilRefreshHeader(ContractAddress);
  },

  deployBreitlexNFT: function() {
    const { web3 } = this;
    this.breitlexNFTContract = new web3.eth.Contract(breitlexNFTArtifact.abi);
    this.uiSpnLoad = document.getElementById("spn-load");
    this.uiConContract = document.getElementById("con-contract");
    this.uiLblContractAddress = document.getElementById("lbl-contract-address");
    this.uiLblOwnerAddress = document.getElementById("lbl-owner-address");
    this.uiLblName = document.getElementById("lbl-name");
    this.uiLblSymbol = document.getElementById("lbl-symbol");

    this.uiSpnLoad.classList.remove('d-none');
    this.breitlexNFTContract.deploy({
      data: breitlexNFTArtifact.bytecode,
      arguments: []
    }).send({
      from: this.account, 
    }, (error, transactionHash) => {})
    .on('error', (error) => { 
      console.log("error");            
    })
    .on('receipt', (receipt) => {
      console.log("DONE" + receipt.contractAddress); // contains the new contract address
      this.uiSpnLoad.classList.add('d-none');
      this.uiConContract.classList.remove('d-none');

      this.breitlexNFTContractAddress = receipt.contractAddress;
      this.uiLblContractAddress.textContent = receipt.contractAddress;

      this.breitlexNFTContract = new web3.eth.Contract(breitlexNFTArtifact.abi, this.breitlexNFTContractAddress);
      this.breitlexNFTContractAddress = receipt.contractAddress;

      console.log(this.breitlexNFTContractAddress);
      console.log(this.breitlexNFTContract);

      this.breitlexNFTContract.methods.owner().call().then((result) =>{
        this.uiLblOwnerAddress.textContent = result;
        this.contractOwnerAddress = result;
      });

      this.breitlexNFTContract.methods.name().call().then((result) =>{
        this.uiLblName.textContent = result;
      });

      this.breitlexNFTContract.methods.symbol().call().then((result) =>{
        this.uiLblSymbol.textContent = result;
      });

      //update the ETH Value boxes
      this.utilGetTotalSupply();

    })
  },
};

window.App = App;

window.addEventListener("load", function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
    );
  }

  App.start();
});