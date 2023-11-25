const express = require("express");
const globalErrorHandler = require("./utils/globalErrorHandle");
const applyMiddleware = require("./middlewares/applyMiddleware");
const { MongoClient, ServerApiVersion } = require("mongodb");





require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;




/* apply middlewares */

applyMiddleware(app);




console.log(process.env.DATABASE_LOCAL_USERNAME, process.env.DATABASE_LOCAL_PASSWORD);

console.log("connectting to database");


const uri = `mongodb+srv://${process.env.DATABASE_LOCAL_USERNAME}:${process.env.DATABASE_LOCAL_PASSWORD}@cluster0.mifmtux.mongodb.net/?retryWrites=true&w=majority`



const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
console.log("connected to database")



async function run() {
    try {
        /* create database and collection  */
        const ArticlesCollection = client.db("allArticlesDB").collection("allArticles")

       
        /* read data for all Articles */
        app.get('/allArticles', async (req, res) => {
            const result = await ArticlesCollection.find().toArray()

            res.send(result);
        })
        

        /* top 6 trending articles */

        app.get('/topArticles', async (req, res) => {
            try {
                console.log('Request received for /topArticles');

                // Find the top 6 articles based on totalViews in descending order
                const topArticles = await ArticlesCollection.find({})
                    .sort({ totalViews: -1 })
                    .limit(6)
                    .toArray()  

                console.log('Data retrieved successfully');
                res.json(topArticles);
            } catch (error) {
                console.error('Error fetching data:', error);
                res.status(500).send('Internal Server Error');
            }
        });

        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);


/* get health  data  */
app.get('/health', (req, res) => {
    res.send('world tour server is running')

})


/*  handling all (get,post,update,delete.....) unhandled routes */
app.all("*", (req, res, next) => {
    const error = new Error(`Can't find ${req.url} on the server`);
    error.status = 404;
    next(error);
});

/*  error handling middleware*/
app.use(globalErrorHandler);


const main = async () => {

    app.listen(port, () => {
        console.log(`the-daily-news Server is running on port ${port}`);
    });

}


main()
