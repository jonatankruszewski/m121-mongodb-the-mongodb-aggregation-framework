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

Afterwards extracting the file, to run a validator from the validateLab folder, you need to run it on the mongoshell.

```sh
load('full_path_to_file')
var pipeline = [{$match:{"imdb.rating":{$gte:7}, genres:{$nin:["Crime", "Horror"]}, rated:{$in:["PG", "G"]}, languages: {$all:["English", "Japanese"]}}}]
validateLab1(pipeline)
```

Answer: **15**

### Shaping documents with $project

- $project
- Select and retain fields.
- Write new fields
- Works like map
- We can use aggregation expressions.
- 1, retains, 0 removes.
- values inside a document should be sorruounded with quotes
- {gravity: "$gravity.value"} => mapping the gravity document to the value of one of its keys.
- {surface.gravity: "$gravity.value"} => Creates a new field.
- should be used aggresively to reshape documents

### Quiz

Which of the following statements are true of the $project stage?

- [X] Once we specify a field to retain or perform some computation in a $project stage, we must specify all fields we wish to retain. The only exception to this is the _id field.
- [X] Beyond simply removing and retaining fields, $project lets us add new fields.
- [ ] $project can only be used once within an Aggregation pipeline.
- [ ] $project cannot be used to assign new values to existing fields.

### Lab - Changing Document Shape with $project
