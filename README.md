**Museum Curator Backend**

This is the backend for the Museum Curator project, providing API endpoints to fetch and process exhibits from external sources like Harvard Art Museums and Smithsonian. It also includes authentication and user collection management.

Frontend Repository: Museum Curator Frontend
Live API Base URL: https://museum-curator-backend.onrender.com

**Features**

Fetches exhibit data from Harvard Art Museums & Smithsonian APIs
Provides endpoints for exhibit search & pagination
User authentication (Register/Login)
Allows users to save exhibits to collections
PostgreSQL database for storing user collections

**Getting Started**

**Prerequisites**

Ensure you have the following installed:

    Node.js (latest LTS version recommended)
    PostgreSQL (for local database setup)
    Git (optional, for cloning the repository)

**Installation & Setup**

Clone the repository

    git clone https://github.com/ChannersSoh/museum-curator-backend.git
    cd museum-curator-backend

Install dependencies

    npm install

Create a .env file in the project root and add the following (modify with your actual credentials):

    PORT=5000
    DATABASE_URL=your_postgresql_connection_string
    JWT_SECRET=your_secret_key
    HARVARD_API_KEY=your_harvard_api_key
    SMITHSONIAN_API_KEY=your_smithsonian_api_key

Set up the database Make sure PostgreSQL is running. If needed, create a database manually.

Then, run seed initial data:

    npm run seed

Running the Server

To start the backend server locally, use:

    npm run dev

It will start the server in development mode with live reloading.

For a production build, use:

    npm run build
    npm start

**API Endpoints**
Method	Endpoint	Description
GET	/api/exhibits	Fetch paginated exhibit list
GET	/api/exhibits/:id	Fetch exhibit details by ID
POST	/register	Register a new user
POST	/login	Authenticate user, return JWT
POST	/collections	Create a new collection (Auth)
POST	/collections/save	Save an exhibit to a collection

Full API documentation will be added soon

**Running Tests**

Jest is used for testing.

To run the tests:

    npm run test
