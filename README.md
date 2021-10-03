# moquer
moquer is for mocking http services/apis, configure and manage fake templated responses by defining models as JSON schemas

## install

```sh
npm i
```

## configure

Copy `env.sample` as `.env` as review settings

## build

```sh
npm run build
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
#            "example": "{ \"x-correlation\": \"{{request.headers['x-correlation']}}\" }"
#        },
#        "response_body": {
#            "type": "string",
#            "nullable": true,
#            "description": "Templated JSON using Handlebars",
#            "example": "{{db.user.haci}}"
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
#    "response_body": "{{$data.user.haci}}"
#}
# HANDLEBARS is used for response body. $data lets you use all entities defined by you.

# use mocking service with any other URLs except /moquer/*
# mocking is dynamic, based on the definitions as shown above
curl --location --request GET 'http://localhost:9090/sample.json'
curl --location --request GET 'http://localhost:9090/user/haci'
```
