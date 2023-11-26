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
        

        /* sava new user data  */
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



        /* update a single user  data */

        app.put('/users/:id', async (req, res) => {
            const id = req.params.id
            const filter = {
                _id: new ObjectId(id)
            }
            const newProduct = req.body
            const options = {
                upsert: true,
            }
            const updatedProfile = {
                $set: {
                    image_url: newProduct.image_url,
                    name: newProduct.name,
                    

                }
            }
            const result = await userCollection.updateOne(filter, updatedProfile, options)
            console.log(result);
            res.send(result);
        })


        /* Subscribe user to premium content */
        app.post('/subscribe', async (req, res) => {
            const { userId, period } = req.body;

            try {
                const user = await userCollection.findOne({ _id: new ObjectId(userId) });

                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }

                
                const currentDate = new Date();
                let subscriptionEndDate;

                switch (period) {
                    case '1min':
                        subscriptionEndDate = new Date(currentDate.getTime() + 1 * 60 * 1000);
                        break;
                    case '5days':
                        subscriptionEndDate = new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000);
                        break;
                    case '1week':
                        subscriptionEndDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
                        break;
                    case '1month':
                        subscriptionEndDate = new Date(currentDate);
                        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
                        break;
                    default:
                        return res.status(400).json({ error: 'Invalid subscription period' });
                }

                await userCollection.updateOne(
                    { _id: new ObjectId(userId) },
                    { $set: { premiumTaken: subscriptionEndDate } }
                );

                res.json({ message: 'Subscription successful' });
            } catch (error) {
                console.error('Error subscribing user', error);
                res.status(500).json({ error: 'Internal server error' });
            }
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
       /* update the total view in the articles */
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


         
        /* premium articles apis  */
        app.get('/premiumArticles', async (req, res) => {
            try {
                console.log('Fetching premium articles...');
                const result = await ArticlesCollection.find({ premium: true }).toArray();

                console.log('Fetched premium articles:', result);
                res.send(result);
            } catch (error) {
                console.error('Error fetching premium articles', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        
    /*serch and filter articles */
       
        app.get('/searchArticles', async (req, res) => {
            try {
                const { offset = 0, limit = 10, searchTitle, publisher, tags } = req.query;
                const filter = {};

                if (searchTitle) {
                    filter.title = { $regex: new RegExp(searchTitle, 'i') };
                }

                if (publisher) {
                    filter.publisher = publisher;
                }

                if (tags) {
                    filter.tags = { $in: tags.split(',') };
                }

                const result = await ArticlesCollection.find(filter).skip(+offset).limit(+limit).toArray();
                res.send(result);
            } catch (error) {
                console.error('Error searching and filtering articles', error);
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
