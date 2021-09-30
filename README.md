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

### 1. back-end

#### Switch into the back-end directory

```sh
cd back-end
```

#### Install NPM packages {#back-end-install-npm-packages}

```sh
npm install
```

#### Create your `.env` file {#back-end-create-env-file}

See file [.env.example][6] for an example

#### Import some measurements data into MongoDB

File [measurements.json.example][7] contains some sample data and the following `mongoimport` command could be used to import it:

```sh
mongoimport --db=mevn-stack-app_db --collection=measurements --file=measurements.json.example
```

#### Compiles and hot-reloads for development {#back-end-compile-for-development}

```sh
npm run start
```

#### Compiles for production

```sh
npm run build
```

#### Lints

```sh
npm run lint
```

### 2. front-end

#### Switch into the front-end directory

```sh
cd front-end
```

#### Install NPM packages {#front-end-install-npm-packages}

```sh
npm install
```

#### Create your `.env` file {#front-end-create-env-file}

See file [.env.example][8] for an example.

#### Compiles and hot-reloads for development {#front-end-compile-for-development}

```sh
npm run serve
```

#### Compiles and minifies for production

```sh
npm run build
```

#### Lints and fixes files

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
