const mongoose = require("mongoose");
require('dotenv').config()


const getConnectionString = () => {
   

    // let connectionURI = process.env.DATABASE_LOCAL
    
    // console.log(connectionURI);

    //     connectionURI = connectionURI.replace(
    //         '<username>',
    //         process.env.DATABASE_LOCAL_USERNAME
    //     );
    //     connectionURI = connectionURI.replace(
    //         '<password>',
    //         process.env.DATABASE_LOCAL_PASSWORD
    //     );
  
        
    

    // return connectionURI;
};

const connectDB = async () => {
    console.log("connectting to database");
    // const mongoURI = ''

    await mongoose.connect("mongodb+srv://alviasad10:RhkaCzqZ3wQkwCkO@cluster0.mifmtux.mongodb.net/?retryWrites=true&w=majority", { dbName: "news-db" });
    console.log("connected to database");
};


module.exports = connectDB