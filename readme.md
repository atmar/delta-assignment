# Delta Assignment
For this assignment I've picked Redis as the storage. Redis can handle a lot of data and will remain fast if a lot of requests come in.

## Trending Searches
The first objective is to have a list of all trending assets in the last 24 hours in real-time. In order to achieve this the app uses a sorted set in Redis. This allows us to give a score to an asset and return them from most popular to least popular.

In this app we have 2 sorted sets to achieve this. 
1. A sorted set with a unique identifier (uuiv4) and assetID as key with timestamp as score
2. A sorted set with assetID as key and the amount of searches as score. This set is used to find the trending searches.

The first set is used to store every search (hit) on the assets with the according timestamp as score. With the timestamp we can check if a search is older than 24 hours or not. If a search is older than 24h we delete it from the sorted set and decrease the score by 1 in our second sorted set.

We combine our key in the first set with a unique identifier (uuiv4) because the keys in a sorted set need to be unique. If we only use the asset ID we would not be able to individually store the searches. 

The app runs a cron job every minute to check for all the key in the first sorted set with a score between 0 and the timestamp 24 hours ago. This gives us all keys older than 24 hours. For every key in the list we decrease the score of our asset in the second set by 1. If the score is lower or equal to 0 we delete the key to ensure our set does not become too big with barely searched assets.

In the end our endpoint will retrieve the second sorted set by score. The highest score will be first in the array, the lowest last. This gives us a trending list of the last 24 hours in the correct order. This is not 100% real-time since we run a cron job every minute. But the list will be as accurate as possible with a maximum of 1 minute in difference on a 24 hours window.

Next to this we need to ensure that multiple searches by the same user do not result in an asset being scored higher. We use a standard key-value record for this in Redis. For every search we add a key that combines the userID and assetID and set an expiry date of 24 hours. After 24 hours the key will be deleted. If a key exists, the search does not count for the trending search.

## Recent Searches
The second objective is to have a list of all recent searches by the user in FIFO order with a maximum of 100 assets. To achieve this we use a list in Redis. For every search of a user we add it to the list in FIFO order. If a list is over 100 assets long we remove the last asset in the list.

## Alternatives
It is possible to use Mysql aswell instead of Redis. But in this use case it would be faster to use Redis. If we need to save the searches for data analysis in the future we would also need MySql. But I would still use Redis for the main application and only use MySql for data collection.

## Application

Our `App.js` contains a standard Express server. `cron` activates the cron scheduler. `express.json()` lets us have a body in the POST request to read in the Request.

The application contains a router that goes to a controller that goes to a service. This method was choosen to not have any business logic in the controller. The methods are static because we don't need an instance here of the class, we can call the methods from the class itself. This gives us a cleaner codebase.

### Controller

The controller is called upon an endpoint. It calls a service and returns the result in a response.\
`logSearch()` logs the search and return an empty status 201.\
`trendingSearches()` searches all trending assets and returns them in a 200 result\
`recentSearches()` searches all recent assets for a user and returns them in a 200 result

### Service

The service contains all the business logic after it is called from the controller. 

`logSearch()` will add the assetID to the list of recent searches for the user. If a list is longer than 100 assets it will remove the last one. If a user has already searched the assetID before it will not count towards trending assets. In the last line we will add the trending assets to the sorted sets. We use an `await Promise.all()` because we can run them in parallel to ensure a faster execution speed.

`trendingSearches()` will retrieve the trending assets in order by score from the Redis instance. We will then convert them to a number and return it.

`recentSearches()` will retrieve the recent assets for a user from the Redis instance. We will then convert them to a number and return it.

### Cron
We have 1 cron job that removes all trending assets older than 24 hours and decrease their score by 1 for each removed asset. We split the results of the first sorted set because the first value is our unique identifier while our second value is the asset ID that we need.

### Lib
Our lib is only used for Redis at the moment.

We have a singleton instance for Redis to have the same instance in our whole application. This will ensure we don't need to create a new Redis connection each time we call it.

The `RedisCache` class is a wrapper around Redis. It groups all our Redis functions and any business logic that comes with it. The methods are static because that is what I preferred to use here in the application. But it's also possible to not make them static and have a constructor in the class that initializes the client using `this` so we don't need to retrieve the singleton instance in every method.

### Interfaces
We have a few interfaces that we use here.

There is an interface for a cron job in case there are multiple cron jobs in the application.
We have an interface for the requests that tells us what will be in the request body. And we also have an interface for the responses that ensures we return the correct response.

### Config
There are config files available that uses the environment variables to set config parameters in the application. Mainly used to set the port and redis configuration here. There are default variables in case there is nothing available.


### Testing
We use Jest to do our testing. Testing is split up in integration and unit tests. 

Our integration tests are simple currently. It calls the routes in this application and checks if they return the correct status code.

The unit tests are split in 3 tests. We have a test for the cron job, our Redis wrapper class and our Search Service class.

In the cron job we use Jest's fake timers to emulate a logged search at different times. We can then check if only the searches older than 24 hours are deleted.

The redis wrapper test class mocks Redis with an in-memory implementation. This allows us to test all our Redis methods completely without any connection to a real Redis instance.

The search service test class ensures that our service does the correct steps in every scenario.

## Comments
We do not remove the .env file in our Git repository because it is needed to ensure everything works here. In a real Git repo I would not include this.

## HTTP Requests example

Base url is `http://localhost:3000`
1. To log a search with assetID and userID we use a post request to `/search/log`
2. To get trending assets we use a get request to `/search/trending`
3. To get recently searched assets of a user we use a get request to `/recent/:userId"`

Examples:
1. ```await request(app).post('/search/log').send({asset_id: 5, user_id: 5});```
2. ```await request(app).get('/search/trending');```
3. ```await request(app).get('/search/recent/1');```