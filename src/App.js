const express = require("express");
const globalErrorHandler = require("./utils/globalErrorHandle");
const applyMiddleware = require("./middlewares/applyMiddleware");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;


 

/* apply middlewares */

applyMiddleware(app);



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



app.listen(port, () => {
    console.log(`app listening on ${port}`);
})
