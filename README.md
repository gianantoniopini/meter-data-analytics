# MEVN Stack App

Repository for learning the MEVN stack (MongoDB, Express, Vue, Node.js).

The app visualizes smart meter measurements time-series data and provides simple analytics.

The [back-end][1] provides a REST API to retrieve the smart meter measurements data. It also provides an endpoint to import the data from an external API.  
The [front-end][2] provides a single-page application to visualize the smart meter measurements data. It also provides simple analytics with graphs showing the data grouped by different time intervals.

## Requirements

- [Node.js v16.3.0][3]
- [npm v7.15.1][4]
- MongoDB v5.0 - [Download and install][5], or install with Docker

## Setup

### 1. back-end setup

#### 1.1 Switch into the back-end directory

```sh
cd back-end
```

#### 1.2 Install NPM packages

```sh
npm install
```

#### 1.3 Create your `.env` file

See file [.env.example][6] for an example

#### 1.4 Import some measurements data into MongoDB

File [measurements.json.example][7] contains some sample data and the following `mongoimport` command could be used to import it:

```sh
mongoimport --db=mevn-stack-app_db --collection=measurements --file=measurements.json.example
```

#### 1.5 Compiles and hot-reloads for development

```sh
npm run start
```

#### 1.6 Compiles for production

```sh
npm run build
```

#### 1.7 Lints

```sh
npm run lint
```

### 2. front-end setup

#### 2.1 Switch into the front-end directory

```sh
cd front-end
```

#### 2.2 Install NPM packages

```sh
npm install
```

#### 2.3 Create your `.env` file

See file [.env.example][8] for an example.

#### 2.4 Compiles and hot-reloads for development

```sh
npm run serve
```

#### 2.5 Compiles and minifies for production

```sh
npm run build
```

#### 2.6 Lints and fixes files

```sh
npm run lint
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
