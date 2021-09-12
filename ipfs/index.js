const pinataSDK = require('@pinata/sdk');
const multer = require('multer');
const express = require('express');
const streamifier = require('streamifier');
const app = express();
const pinata = pinataSDK('your key', 'your secret');
const port = 3000;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const ipfsuri = "https://ipfs.io/ipfs/";
const cors=require("cors"); 

app.use(cors({
  credentials: true,
  origin: "http://localhost:8080"
}));

app.post('/nftwrite', upload.single('image'), function (req, res, next) {
    const mystream = streamifier.createReadStream(req.file.buffer);

    //file more than 1MB? Drop and exit!
    if (Buffer.byteLength(req.file.buffer)>= 1000000){
        res.status(500).send('Too big. Please keep to files below 1MB.');
        return;
    }
    
    mystream.path = req.file.originalname;
    const options = {
        pinataMetadata: {
            name: req.file.originalname,
        },
        pinataOptions: {
            cidVersion: 0
        }
    };

    //pin the picture
    pinata.pinFileToIPFS(mystream, options).then((result) => {
        //construct the metadata
        const body = {
            "model": req.body.model,
            "manufactured-date": req.body.manufactureddate,
            "serial-number": req.body.serialnumber,
            "photo": ipfsuri + result.IpfsHash
        };
        const options = {
            pinataMetadata: {
                name: req.body.serialnumber,
            },
            pinataOptions: {
                cidVersion: 0
            }
        };
        
        console.log(result);

        //pin the metadata
        pinata.pinJSONToIPFS(body, options).then((result) => {
            //ok done, return the hash to caller
            console.log(result);
            res.json({ IpfsHash: result.IpfsHash });
        }).catch((err) => {
            //handle error here
            res.status(500).send('Something broke!')
            console.log(err);
            return;
        });
    }).catch((err) => {
        res.status(500).send('Something broke!')
        console.log(err);
        return;
    });
  })

app.get('/', (req, res) => {
    res.send('BreitLex NFT Metadata API');
});

app.listen(port, () => {
  console.log(`BreitLex NFT Metadata API listening`);
});