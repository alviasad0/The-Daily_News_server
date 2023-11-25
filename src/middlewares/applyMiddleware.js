
const cors = require('cors');
const express = require("express");



const applyMiddleware = (app) => {

    /* middleware */

    app.use(cors({
        origin: [
            'http://localhost:5173'
            
        ],
        credentials: true,
        
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],

    }));
    
    app.use(express.json());
   
}

module.exports = applyMiddleware