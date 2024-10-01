/* 
    Modules in Typescript can have both name and default exports
    It's up to the module author to decide which type of export to use
    You can also have a mix of both in the same modules, but only on default export per module is allowed
    
    Default imports allow you to import the default export from a module
    In the case of import express from `express`;. you are importing the default export from the `express`
    Since there is only one
    
    Name exports are imported inside ()
    
    TypeScript modules are close in behavior to modern JavaScript */

// Importing the Express library along with Request and Response types for TypeScript.
import express, { Request, Response } from 'express';
import albumsRouter from './albums/albums.routes';
import artistRouter from './artists/artists.routes';
import cors from 'cors';
import logger from './middleware/logger.middleware';
import helmet from 'helmet';
import dotenv from "dotenv";

// Loads environment variables from the .env file. This is useful for defining variables such as PORT or database connection strings.
dotenv.config();

// Initializes the Express application
const app = express();

// Reads the PORT variable from the environment configuration to determine which port the app should run on.
const port = process.env.PORT;

//******MIDDLEWARE SET UP *******/
// Enable all CORS request
app.use(cors());
// Parse JSON bodies
app.use(express.json());
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true}));
// adding set of security middleware
app.use(helmet());

console.log(process.env.MY_SQL_DB_HOST);

if (process.env.NODE_ENV == 'development') {
    //add logger middleware
    //logs details about each incoming request (like method, URL, etc.) to the console or a log file. 
    app.use(logger);
    console.log(process.env.GREETING + ' in dev mode')
}

// Application routes
// root route
app.get('/', (req: Request, res: Response) => {
    res.send('<h1>Welcome to the Music API<h1/>');
  });
// adding router middleware
app.use('/', [albumsRouter , artistRouter] );

// Starting the server and making it listen on the specified port.
app.listen(port, () => {
    // Logging a message to the console when the server starts successfully.
    console.log(`Example app listening at http://localhost:${port}`)
});
