# moquer
moquer is for mocking http services/apis, configure and manage fake templated responses by defining models as JSON schemas

## requirements

Latest LTS version of Node:

https://nodejs.org/en/about/releases/

## install

```sh
npm i
```

Libraries used:

* [cors](https://www.npmjs.com/package/cors)
* [dotenv](https://www.npmjs.com/package/dotenv)
* [express](https://www.npmjs.com/package/express)
* [glob](https://www.npmjs.com/package/glob)
* [glob-promise](https://www.npmjs.com/package/glob-promise)
* [handlebars](https://www.npmjs.com/package/handlebars)
* [helmet](https://www.npmjs.com/package/helmet)
* [jsonfile](https://www.npmjs.com/package/jsonfile)
* [jsonschema](https://www.npmjs.com/package/jsonschema)
* [node-cache](https://www.npmjs.com/package/node-cache)
* [pg](https://www.npmjs.com/package/pg)
* [redis](https://www.npmjs.com/package/redis)
* [ts-node](https://www.npmjs.com/package/ts-node)
* [typescript](https://www.npmjs.com/package/typescript)

## configure

Copy `env.sample` as `.env` as review settings

```
MOQUER_HTTP_PORT="9090"

MOQUER_ADMIN_API_BASE_PATH="/moquer"
MOQUER_MOCK_API_BASE_PATH="/"

MOQUER_STATIC_BASE_PATH="/"
MOQUER_STATIC_DIR="./static"

MOQUER_DB_KIND="cache"

# 0 or 1
MOQUER_DB_SEED="1"
MOQUER_DB_SEED_DIR="./seeds"
```

## build

```sh
npm run build
```

## test

Libraries used:

* [chai](https://www.npmjs.com/package/chai)
* [mocha](https://www.npmjs.com/package/mocha)
* [nyc](https://www.npmjs.com/package/nyc)
* [sinon](https://www.npmjs.com/package/sinon)
* [supertest](https://www.npmjs.com/package/supertest)

```sh
npm run test
npm run test:coverage
```

## run 

```sh
npm run start
# dev mode using ts-node
#npm run start:dev
```

## API

Check `moquer.postman_collection.json`

Here are some examples:

```sh
# administration URLs with /moquer/*

# LIST models
curl --location --request GET 'http://localhost:9090/moquer/models'
# response is [
#    {
#        "kind": "_model_",
#        "id": "moquer"
#    },
#    {
#        "kind": "_model_",
#        "id": "user"
#    }
#]

# RETRIEVE json schema of model moquer
curl --location --request GET 'http://localhost:9090/moquer/models/moquer'
# response is {
#    "type": "object",
#    "required": [
#        "priority",
#        "response_status"
#    ],
#    "properties": {
#        "priority": {
#            "type": "number",
#            "nullable": false,
#            "example": "1"
#        },
#        "request_method_regex": {
#            "type": "string",
#            "nullable": true,
#            "example": "get"
#        },
#        "request_path_regex": {
#            "type": "string",
#            "nullable": true,
#            "example": "^/users/haci$"
#        },
#        "request_headers_regex": {
#            "type": "string",
#            "nullable": true
#        },
#        "request_body_regex": {
#            "type": "string",
#            "nullable": true
#        },
#        "request_query_regex": {
#            "type": "string",
#            "nullable": true
#        },
#        "response_status": {
#            "type": "number",
#            "nullable": false,
#            "example": "200"
#        },
#        "response_headers": {
#            "type": "string",
#            "nullable": true,
#            "description": "Templated JSON using Handlebars",
#            "example": "{ \"x-correlation\": \"{{{$req.headers.xcorrelationid}}}\" }"
#        },
#        "response_body": {
#            "type": "string",
#            "nullable": true,
#            "description": "Templated JSON using Handlebars",
#            "example": "{{{json $data.user.haci}}}"
#        }
#    }
#}

# RETRIEVE json schema of model user
curl --location --request GET 'http://localhost:9090/moquer/models/user'

# CREATE json schema for new model customer
curl --location --request POST 'http://localhost:9090/moquer/models/customer' \
--header 'Content-Type: application/json' \
--data-raw '{
    "type": "object",
    "required": [
        "email",
        "full_name"
    ],
    "properties": {
        "email": {
            "type": "string",
            "nullable": false
        },
        "full_name": {
            "type": "string",
            "nullable": false
        }
    }
}'

# delete model
curl --location --request DELETE 'http://localhost:9090/moquer/models/customer'

# get entities for all models
curl --location --request GET 'http://localhost:9090/moquer/entities'
# response is [
#    {
#        "kind": "moquer",
#        "id": "get_user_haci"
#    },
#    {
#        "kind": "user",
#        "id": "haci"
#    }
#]

# get details of one entity 'haci' for model 'user'
curl --location --request GET 'http://localhost:9090/moquer/entities/user/haci'

# CREATE new entity
curl --location --request POST 'http://localhost:9090/moquer/entities/user/haci2' \
--header 'Content-Type: application/json' \
--data-raw '{
  "username": "haci2",
  "first_name": "Haci",
  "last_name": "Yaman"
}'

# UPDATE an entity
curl --location --request PATCH 'http://localhost:9090/moquer/entities/user/haci2' \
--header 'Content-Type: application/json' \
--data-raw '{
  "username": "haci22",
  "first_name": "Haci Murat",
  "last_name": "Yaman"
}'

# DELETE an entity
curl --location --request DELETE 'http://localhost:9090/moquer/entities/user/haci2'

# RETRIEVE mocking details
curl --location --request GET 'http://localhost:9090/moquer/entities/moquer/get_user_haci'
# response is {
#    "priority": "0",
#    "request_method_regex": "GET",
#    "request_path_regex": "^/user/haci$",
#    "request_headers_regex": "",
#    "request_body_regex": "",
#    "request_query_regex": "",
#    "response_status": 200,
#    "response_headers": "",
#    "response_body": "{{{json $data.user.haci}}}"
#}
# HANDLEBARS is used for response body. $data lets you use all entities defined by you.

# use mocking service with any other URLs except /moquer/*
# mocking is dynamic, based on the definitions as shown above
curl --location --request GET 'http://localhost:9090/sample.json'
curl --location --request GET 'http://localhost:9090/user/haci'
```

## Updates on 1.1.0

Fixed a few issues, also added a few new features.

Updated `seeds/` and Postman collection, please check for sample data and usage.

### Added support for PostgreSQL as data storage. A table is required:

Check `.env` file to configure and use a server.

```
moquer(id: varchar(255) PK, value: json)
```

### Added support for Redis as data storage.

Check `.env` file to configure and use a server.

### Added helper functions for Handlebars:

* json: converts objects in template to JSON string
* upper: converts text fields in template to lowercase
* lower: converts text fields in template to uppercase
* int: converts text fields in template to integer
