# Meter Data Analytics

Smart meter data analytics app built with the MEVN stack (MongoDB, Express, Vue, Node.js).

The app visualizes smart meter measurements time-series data and provides simple analytics.

The [external-api][10] simulates an external REST API providing smart meter measurements data. It implements authentication using JWT (JSON Web Tokens).  
The [back-end][1] provides a REST API to retrieve the smart meter measurements data from the MongoDB database. It also provides an endpoint to import the data from the external-api into the database.  
The [front-end][2] provides a single-page application to visualize the smart meter measurements data retrieved from the back-end REST API. It also provides simple analytics with graphs showing the data grouped by different time intervals.

_All the smart meter data being used is just test data._

## Requirements

- [Node.js][3]
- [npm][4]
- MongoDB - [Download and install][5], or install with Docker
- [http-server][9] (only required to start the production version of the front-end)

## Setup

### 1. external-api setup

#### 1.1 Switch into the external-api directory

```sh
cd external-api
```

#### 1.2 Install NPM packages

```sh
npm install
```

#### 1.3 Create your `.env` file

See file [.env.example][11] for an example

#### 1.4 Compiles and hot-reloads for development

```sh
npm run start
```

#### 1.5 Runs tests

```sh
npm run test
```

#### 1.6 Compiles for production

```sh
npm run build
```

#### 1.7 Starts production

```sh
npm run start:production
```

### 2. back-end setup

#### 2.1 Switch into the back-end directory

```sh
cd back-end
```

#### 2.2 Install NPM packages

```sh
npm install
```

#### 2.3 Create your `.env` file

See file [.env.example][6] for an example

#### 2.4 Import some measurements data into MongoDB

File [measurements.json.example][7] contains some sample data and the following `mongoimport` command could be used to import it:

```sh
mongoimport --db=meter-data-analytics_db --collection=measurements --file=measurements.json.example
```

#### 2.5 Compiles and hot-reloads for development

```sh
npm run start
```

#### 2.6 Runs tests

```sh
npm run test
```

#### 2.7 Compiles for production

```sh
npm run build
```

#### 2.8 Starts production

```sh
npm run start:production
```

### 3. front-end setup

#### 3.1 Switch into the front-end directory

```sh
cd front-end
```

#### 3.2 Install NPM packages

```sh
npm install
```

#### 3.3 Create your `.env` file

See file [.env.example][8] for an example.

#### 3.4 Compiles and hot-reloads for development

```sh
npm run serve
```

#### 3.5 Runs tests

```sh
npm run test:unit
```

#### 3.6 Compiles and minifies for production

```sh
npm run build
```

#### 3.7 Starts production

```sh
npm run serve:production
```

<!-- MARKDOWN LINKS -->

[1]: ./back-end
[2]: ./front-end
[3]: https://nodejs.org/en/download/current/
[4]: https://nodejs.org/en/download/current/
[5]: https://www.mongodb.com/try/download/community
[6]: ./back-end/.env.example
[7]: ./back-end/measurements.json.example
[8]: ./front-end/.env.example
[9]: https://www.npmjs.com/package/http-server
[10]: ./external-api
[11]: ./external-api/.env.example
