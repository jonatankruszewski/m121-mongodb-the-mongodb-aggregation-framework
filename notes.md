# M121

## CHAPTER 1

### Lecture $match: Filtering Documents

- $match: might be use multiple times, should come as early as possible. 
- Aggregation operator
- Think of it as a filter.
- Uses standard query operators
- Doesn't have a project
- Cannot use $where with $match

### Quizz

Which of the following is/are true of the $match stage?

- [ ] $match can use both query operators and aggregation expressions.
- [X] It should come very early in an aggregation pipeline.
- [ ]$match can only filter documents on one field.
- [X] It uses the familiar MongoDB query language.

### LAB

- Download the chapter1.zip
- Connect with this string

    ```sh
    mongo "mongodb://cluster0-shard-00-00-jxeqq.mongodb.net:27017,cluster0-shard-00-01-jxeqq.mongodb.net:27017,cluster0-shard-00-02-jxeqq.mongodb.net:27017/aggregations?replicaSet=Cluster0-shard-0" --authenticationDatabase admin --ssl -u m121 -p aggregations --norc
    ```

    ```js
    db // shows actual db
    show collections
    db.movies.findOne()
    ```

### Homework

```js

db.movies.aggregate({$match:{"imdb.rating":{$gte:7}, genres:{$nin:["Crime", "Horror"]}, rated:{$in:["PG", "G"]}, languages: {$all:["English", "Japanese"]}}}, {$count: "documents"})

```
