# MEVN Stack App back-end

The back-end provides a REST API to retrieve the smart meter measurements time-series data.

It also provides an endpoint to import the data from an external API.

## Setup
1. Switch into the back-end directory
```sh
cd back-end
```
2. Install NPM packages
```sh
npm install
```
3. Create your `.env` file. See file [.env.example][dot-env-example-url] for an example.

4. Import some measurements data into MongoDB. File [measurements.json.example][measurements-json-example-url] contains some sample data and the following `mongoimport` command could be used to import it:
```sh
mongoimport --db=mevn-stack-app_db --collection=measurements --file=measurements.json.example
```

### Compiles and hot-reloads for development
```sh
npm run start
```

### Compiles for production
```sh
npm run build
```

### Lints
```sh
npm run lint
```

<!-- MARKDOWN LINKS -->
[dot-env-example-url]: .env.example
[measurements-json-example-url]: measurements.json.example
