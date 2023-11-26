const express = require("express");
const globalErrorHandler = require("./utils/globalErrorHandle");
const applyMiddleware = require("./middlewares/applyMiddleware");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");





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

        const allPublishersCollection = client.db("allPublishersDB").collection("allPublishers")
        
        const userCollection = client.db("allUsersDb").collection("allUsers");



        // ----------------- users related api -----------------


        /* read user data */
        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        // ------------------ articles releted apis -----------------
        

        /* read data for all Articles */
        app.get('/allArticles', async (req, res) => {
            const result = await ArticlesCollection.find().skip(+req.query.offset).limit(10).toArray()

            res.send(result);
        })

        /* get single data using id */
        app.get("/allArticles/:id", async (req, res) => {
            const id = req.params.id

            const query = {
                _id: new ObjectId(id)
            }
            const result = await ArticlesCollection.findOne(query)
            console.log(result);
            res.send(result)

        })

        app.put('/allArticles/:id', async (req, res) => {
            const { id } = req.params;

            try {
                const query = { _id: new ObjectId(id) };
                const update = { $inc: { totalViews: 1 } }; 

                const result = await ArticlesCollection.updateOne(query, update);

                if (result.modifiedCount === 0) {
                    return res.status(404).json({ error: 'Article not found' });
                }

                res.status(200).json({ message: 'View count updated successfully' });
            } catch (error) {
                console.error('Error updating view count', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        



        // ------------------ publishers releted apis -----------------
        
        /* read data for all Publishers */
        app.get('/allPublishers', async (req, res) => {
            const result = await allPublishersCollection.find().toArray()

            res.send(result);
        })



       

        

        

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
