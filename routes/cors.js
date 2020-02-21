const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['https://localhost:3000','https://localhost:3443'];

const corsOptionsDeligate =(req,callback) => {
    let corsOptions;
    console.log('header :',req.header('Origin'));
    console.log('header 2',req.header('origin'));
    console.log('headers :',req.headers);
    if(whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = {origin:true};
    } else {
        corsOptions = { origin: false };
    } 
    callback(null, corsOptions);
}
exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDeligate);