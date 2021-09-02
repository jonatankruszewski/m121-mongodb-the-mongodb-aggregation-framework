
# EXAM

## FINAL QUESTION 1

Consider the following aggregation pipelines:

Pipeline 1:

```js
db.coll.aggregate([
  {"$match": {"field_a": {"$gt": 1983}}},
  {"$project": { "field_a": "$field_a.1", "field_b": 1, "field_c": 1  }},
  {"$replaceRoot":{"newRoot": {"_id": "$field_c", "field_b": "$field_b"}}},
  {"$out": "coll2"},
  {"$match": {"_id.field_f": {"$gt": 1}}},
  {"$replaceRoot":{"newRoot": {"_id": "$field_b", "field_c": "$_id"}}}
])
```

Pipeline 2:

```js
db.coll.aggregate([
  {"$match": {"field_a": {"$gt": 111}}},
  {"$geoNear": {
    "near": { "type": "Point", "coordinates": [ -73.99279 , 40.719296 ] },
    "distanceField": "distance"}},
  {"$project": { "distance": "$distance", "name": 1, "_id": 0  }}
])
```

Pipeline 3:

```js
db.coll.aggregate([
  {
    "$facet": {
      "averageCount": [
        {"$unwind": "$array_field"},
        {"$group": {"_id": "$array_field", "count": {"$sum": 1}}}
      ],
      "categorized": [{"$sortByCount": "$arrayField"}]
    },
  },
  {
    "$facet": {
      "new_shape": [{"$project": {"range": "$categorized._id"}}],
      "stats": [{"$match": {"range": 1}}, {"$indexStats": {}}]
    }
  }
])
```

- [X] Pipeline 3 fails because $indexStats must be the first stage in a pipeline and may not be used within a $facet

- [ ] Pipeline 1 is incorrect because you can only have one $replaceRoot stage in your pipeline

- [X] Pipeline 1 fails since $out is required to be the last stage of the pipeline

- [X] Pipeline 2 is incorrect because $geoNear needs to be the first stage of our pipeline

- [ ] Pipeline 3 executes correctly

- [ ] Pipeline 3 fails since you can only have one $facet stage per pipeline

- [ ] Pipeline 2 fails because we cannot project distance field

## FINAL QUESTION 2

Consider the following collection:

```js
db.collection.find()
{
  "a": [1, 34, 13]
}
```

The following pipelines are executed on top of this collection, using a mixed set of different expression accross the different stages:

Pipeline 1

```js
db.collection.aggregate([
  {"$match": { "a" : {"$sum": 1}  }},
  {"$project": { "_id" : {"$addToSet": "$a"}  }},
  {"$group": { "_id" : "", "max_a": {"$max": "$_id"}  }}
])
```

Pipeline 2

```js
db.collection.aggregate([
    {"$project": { "a_divided" : {"$divide": ["$a", 1]}  }}
])
```

Pipeline 3

```js
db.collection.aggregate([
    {"$project": {"a": {"$max": "$a"}}},
    {"$group": {"_id": "$$ROOT._id", "all_as": {"$sum": "$a"}}}
])
```

- [X] Pipeline 2 fails because the $diide operator only supports numeric types
- [X] Pipeline 1 is incorrect because you cannot use an accumulator expression in a $match stage
- [X] Pipeline 3 is correct and will execute with no error
- [ ] Pipeline 1 will fail bceause $max can not operator on _id field
- [ ] Pipeline 2 is incorrect since $divide cannot operate over field expressions

## FINAL QUESTION 3

Consider the following collection documents:

```js
db.people.find()
{ "_id" : 0, "name" : "Bernice Pope", "age" : 69, "date" : ISODate("2017-10-04T18:35:44.011Z") }
{ "_id" : 1, "name" : "Eric Malone", "age" : 57, "date" : ISODate("2017-10-04T18:35:44.014Z") }
{ "_id" : 2, "name" : "Blanche Miller", "age" : 35, "date" : ISODate("2017-10-04T18:35:44.015Z") }
{ "_id" : 3, "name" : "Sue Perez", "age" : 64, "date" : ISODate("2017-10-04T18:35:44.016Z") }
{ "_id" : 4, "name" : "Ryan White", "age" : 39, "date" : ISODate("2017-10-04T18:35:44.019Z") }
{ "_id" : 5, "name" : "Grace Payne", "age" : 56, "date" : ISODate("2017-10-04T18:35:44.020Z") }
{ "_id" : 6, "name" : "Jessie Yates", "age" : 53, "date" : ISODate("2017-10-04T18:35:44.020Z") }
{ "_id" : 7, "name" : "Herbert Mason", "age" : 37, "date" : ISODate("2017-10-04T18:35:44.020Z") }
{ "_id" : 8, "name" : "Jesse Jordan", "age" : 47, "date" : ISODate("2017-10-04T18:35:44.020Z") }
{ "_id" : 9, "name" : "Hulda Fuller", "age" : 25, "date" : ISODate("2017-10-04T18:35:44.020Z") }
```

And the aggregation pipeline execution result:

```js
db.people.aggregate(pipeline)
{ "_id" : 8, "names" : [ "Sue Perez" ], "word" : "P" }
{ "_id" : 9, "names" : [ "Ryan White" ], "word" : "W" }
{ "_id" : 10, "names" : [ "Eric Malone", "Grace Payne" ], "word" : "MP" }
{ "_id" : 11, "names" : [ "Bernice Pope", "Jessie Yates", "Jesse Jordan", "Hulda Fuller" ], "word" : "PYJF" }
{ "_id" : 12, "names" : [ "Herbert Mason" ], "word" : "M" }
{ "_id" : 13, "names" : [ "Blanche Miller" ], "word" : "M" }
```

Which of the following pipelines generates the output result?

```js
var pipeline = [{
    "$project": {
      "surname": { "$arrayElemAt": [ {"$split": [ "$name", " " ] }, 1]},
      "name_size": {  "$add" : [{"$strLenCP": "$name"}, -1]},
      "name":1
    }
  },
  {
    "$group": {
      "_id": "$name_size",
      "word": { "$addToSet": {"$substr": [{"$toUpper":"$name"}, 3, 2]} },
      "names": {"$push": "$surname"}
    }
  },
  {
    "$sort": {"_id": -1}
  }
]
```

```js
var pipeline = [{
    "$project": {
      "surname_capital": { "$substr": [{"$arrayElemAt": [ {"$split": [ "$name", " " ] }, 1]}, 0, 1 ] },
      "name_size": {  "$add" : [{"$strLenCP": "$name"}, -1]},
      "name": 1
    }
  },
  {
    "$group": {
      "_id": "$name_size",
      "word": { "$push": "$surname_capital" },
      "names": {"$push": "$name"}
    }
  },
  {
    "$project": {
      "word": {
        "$reduce": {
          "input": "$word",
          "initialValue": "",
          "in": { "$concat": ["$$value", "$$this"] }
        }
      },
      "names": 1
    }
  },
  {
    "$sort": { "_id": 1}
  }
]
```

```js
var pipeline = [{
    "$sort": { "date": 1 }
  },
  {
    "$group": {
      "_id": { "$size": { "$split": ["$name", " "]} },
      "names": {"$push": "$name"}
    }
  },
  {
    "$project": {
      "word": {
        "$zip": {
          "inputs": ["$names"],
          "useLongestLength": false,
        }
      },
      "names": 1
    }
  }]
```

- [ ] Option A
- [X] Option B
- [ ] Option C

## FINAL QUESTION 4

$facet is an aggregation stage that allows for sub-pipelines to be executed.

```js
var pipeline = [
  {
    $match: { a: { $type: "int" } }
  },
  {
    $project: {
      _id: 0,
      a_times_b: { $multiply: ["$a", "$b"] }
    }
  },
  {
    $facet: {
      facet_1: [{ $sortByCount: "a_times_b" }],
      facet_2: [{ $project: { abs_facet1: { $abs: "$facet_1._id" } } }],
      facet_3: [
        {
          $facet: {
            facet_3_1: [{ $bucketAuto: { groupBy: "$_id", buckets: 2 } }]
          }
        }
      ]
    }
  }
]
```

In the above pipeline, which uses $facet, there are some incorrect stages or/and expressions being used.

Which of the following statements point out errors in the pipeline?

- [X] can not nest a $facet stage as a sub-pipeline
- [X] facet_2 uses the outpout of a parallel sub-pipeline, facet_1, to compute an expression
- [ ] a $multiply expression takes a document as input, not an array
- [ ] $sortByCount cannot be used within $facet stage.
- [ ] a $type expression dos not take a string as its value; onle the BSON numeric values can be specified to identify types.


## FINAL QUESTION 5

Consider a company producing solar panels and looking for the next markets they want to target in the USA. We have a collection with all the major cities (more than 100,000 inhabitants) from all over the World with recorded number of sunny days for some of the last years.

A sample document looks like the following:

```js
db.cities.findOne()
{
"_id": 10,
"city": "San Diego",
"region": "CA",
"country": "USA",
"sunnydays": [220, 232, 205, 211, 242, 270]
}
```

The collection also has these indexes:

```JS
db.cities.getIndexes()
[
{
  "v": 2,
  "key": {
    "_id": 1
  },
  "name": "_id_",
  "ns": "test.cities"
},
{
  "v": 2,
  "key": {
    "city": 1
  },
  "name": "city_1",
  "ns": "test.cities"
},
{
  "v": 2,
  "key": {
    "country": 1
  },
  "name": "country_1",
  "ns": "test.cities"
}
]
```

If we would like to calculate the average age of all people in the collection by state, sorted by state, we could run the following aggregation pipeline:

```js
var pipeline = [
    {"$project": { "state": 1, "name": 1, "age": 1}},
    {"$group" : { "_id": "$state", "avg_age": {"$avg": "$age"}}},
    {"$sort": {"_id": 1}}
  ]

db.people.aggregate(pipeline)
```

However, this pipeline execution can be optimized!

Which of the following options will improve the execution of this aggregation pipeline?

Choose the best answer:

1. 

```js
var pipeline = [
    {"$match": { "country": "USA"}},
    {"$addFields": { "mean": {"$avg": "$sunnydays"}}},
    {"$match": { "mean": {"$gte": 220}, "sunnydays": {"$not": {"$lt": 200 }}}},
    {"$sort": {"city": 1}}
]
```

2. 

```js
var pipeline = [
    {"$sort": {"city": 1}},
    {"$addFields": { "min": {"$min": "$sunnydays"}}},
    {"$addFields": { "mean": {"$avg": "$sunnydays" }}},
    {"$match": { "country": "USA", "min": {"$gte": 200}, "mean": {"$gte": 220}}}
]
```

3. 

```js
var pipeline = [
    {"$match": { "country": "USA"}},
    {"$sort": {"city": 1}},
    {"$addFields": { "min": {"$min": "$sunnydays"}}},
    {"$match": { "min": {"$gte": 200}, "mean": {"$gte": 220}}},
    {"$addFields": { "mean": {"$avg": "$sunnydays" }}}
]
```

4. 

```js
var pipeline = [
    {"$sort": {"city": 1}},
    {"$addFields": { "min": {"$min": "$sunnydays"}}},
    {"$match": { "country": "USA", "min": {"$gte": 200}}}
]
```

5. 

```js
var pipeline = [
    {"$sort": {"city": 1}},
    {"$match": { "country": "USA"}},
    {"$addFields": { "min": {"$min": "$sunnydays"}}},
    {"$match": { "min": {"$gte": 200}, "mean": {"$gte": 220}}},
    {"$addFields": { "mean": {"$avg": "$sunnydays" }}}
]
```

Answer is: 1.


## FINAL QUESTION 6

Consider the following people collection:

```js
db.people.find().limit(5)
{ "_id" : 0, "name" : "Iva Estrada", "age" : 95, "state" : "WA", "phone" : "(739) 557-2576", "ssn" : "901-34-4492" }
{ "_id" : 1, "name" : "Roger Walton", "age" : 92, "state" : "ID", "phone" : "(948) 527-2370", "ssn" : "498-61-9106" }
{ "_id" : 2, "name" : "Isaiah Norton", "age" : 26, "state" : "FL", "phone" : "(344) 479-5646", "ssn" : "052-49-6049" }
{ "_id" : 3, "name" : "Tillie Salazar", "age" : 88, "state" : "ND", "phone" : "(216) 414-5981", "ssn" : "708-26-3486" }
{ "_id" : 4, "name" : "Cecelia Wells", "age" : 16, "state" : "SD", "phone" : "(669) 809-9128", "ssn" : "977-00-7372" }
```

And the corresponding people_contacts view:

```js
db.people_contacts.find().limit(5)
{ "_id" : 6585, "name" : "Aaron Alvarado", "phone" : "(631)*********", "ssn" : "********8014" }
{ "_id" : 8510, "name" : "Aaron Barnes", "phone" : "(944)*********", "ssn" : "********6820" }
{ "_id" : 6441, "name" : "Aaron Barton", "phone" : "(234)*********", "ssn" : "********1937" }
{ "_id" : 8180, "name" : "Aaron Coleman", "phone" : "(431)*********", "ssn" : "********7559" }
{ "_id" : 9738, "name" : "Aaron Fernandez", "phone" : "(578)*********", "ssn" : "********0211" }
```

Which of the of the following commands generates this people_contacts view?

1. 

```js
var pipeline = [
  {
    "$project": {"name":1,
    "phone": {
      "$concat": [
        {"$arrayElemAt": [{"$split": ["$phone", " "]}, 0]} ,
        "*********"  ]
      },
    "ssn": {
      "$concat": [
        "********",
        {"$arrayElemAt": [{"$split": ["$ssn", "-"]}, 2]}
      ]
    }
  }
}
];
db.runCommand({
  "create": "people_contacts",
  "viewOn":"people",
  "pipeline": pipeline})
```

2. 

```js
var pipeline = [
  {
    "$sort": {"name": 1}
  },
  {
    "$project": {"name":1,
    "phone": {
      "$concat": [
        {"$arrayElemAt": [{"$split": ["$phone", " "]}, 0]} ,
        "*********"  ]
      },
    "ssn": {
      "$concat": [
        "********",
        {"$arrayElemAt": [{"$split": ["$ssn", "-"]}, 2]}
      ]
    }
  }
}
];
db.createView("people", "people_contacts" pipeline);
```

3. 

```js
var pipeline = [
  {
    "$sort": {"state": 1}
  },
  {
    "$project": {"name":1,
    "phone": {
      "$concat": [
        {"$arrayElemAt": [{"$split": ["$phone", " "]}, 0]} ,
        "*********"  ]
      },
    "ssn": {
      "$concat": [
        "********",
        {"$arrayElemAt": [{"$split": ["$ssn", "-"]}, 2]}
      ]
    }
  }
}
];
db.runCommand({
  "create": "people",
  "viewOn":"people",
  "pipeline": pipeline})
```

4. 

```js
var pipeline = [
  {
    "$sort": {"name": 1}
  },
  {
    "$project": {"name":1,
    "phone": {
      "$concat": [
        {"$arrayElemAt": [{"$split": ["$phone", " "]}, 0]} ,
        "*********"  ]
      },
    "ssn": {
      "$concat": [
        "********",
        {"$arrayElemAt": [{"$split": ["$ssn", "-"]}, 2]}
      ]
    }
  }
}
];
db.createView("people_contacts", "people", pipeline);
```

Answer: 4.


## FINAL QUESTION 7

Using the air_alliances and air_routes collections, find which alliance has the most unique carriers(airlines) operating between the airports JFK and LHR, in either directions.

Names are distinct, i.e. Delta != Delta Air Lines

src_airport and dst_airport contain the originating and terminating airport information.

- [ ] SkyTeam, with 4 carriers
- [ ] OneWorld, with 8 carriers
- [X] OneWorld, with 5 carriers
- [ ] Star Alliance, with 6 carriers


To solve:

Connect:

```sh
mongosh "mongodb://cluster0-shard-00-00-jxeqq.mongodb.net:27017,cluster0-shard-00-01-jxeqq.mongodb.net:27017,cluster0-shard-00-02-jxeqq.mongodb.net:27017/aggregations?replicaSet=Cluster0-shard-0" --authenticationDatabase admin --ssl -u m121 -p aggregations --norc
```

Create the pipeline

```js
db.air_routes.aggregate([
  {
    $match: {
      src_airport: { $in: ["LHR", "JFK"] },
      dst_airport: { $in: ["LHR", "JFK"] }
    }
  },
  {
    $lookup: {
      from: "air_alliances",
      foreignField: "airlines",
      localField: "airline.name",
      as: "alliance"
    }
  },
  {
    $match: { alliance: { $ne: [] } }
  },
  {
    $group: {
      _id: "$airline.id",
      alliance: { $first: { $arrayElemAt: ["$alliance.name", 0] }}
    }
  },
  {
    $sortByCount: "$alliance"
  }
])
```
