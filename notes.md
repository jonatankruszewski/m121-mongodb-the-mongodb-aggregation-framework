# M121

## CHAPTER 0

- Beginners course.
- Quizes, labs, final exam
- Requirements: tcp connection on port 27017
- Install mongodb enterprise

### The concept of pipelines

- Like a belt in an assembly factory, they flow like in an assembly line
- Documents are passed down through this stages.
- This stages can filter, transform data.
- Composition stages.
- Among them: $match, $project, $group

### QUIZ

Which of the following is true about pipelines and the Aggregation Framework?

- [X] Documents flow through the pipeline, passing from one stage to the next
- [ ] Pipelines must consist of at least two stages.
- [X] The Aggregation Framework provides us many stages to filter and transform our data.
- [ ] Stages cannot be configured to produce our desired output.

### Lecture: Aggregation Structure and Sytnax

- Pipelines can contain one or mare stages.
- Pipelines are always an array
- ```sh db.coll.aggregate([{$stage1: {}}, {$stage2: {}}], {...options})```
- ```$fieldName = the value of a fieldname```
- ```$$UPPERCASE = system variable```
- ```$$lowercase = user variable```

### QUIZ Aggregation Structure and Sytnax

Which of the following statements is true?

- [X] An aggregation pipeline is an array of stages.
- [ ] Only one expression per stage can be used
- [X] Some expressions can only be used in certain stages.

## CHAPTER 1

### Lecture $match: Filtering Documents

- Aggregation operators have a $ before.
- $match: might be use multiple times, should come as early as possible.
- Aggregation operator
- Can take advantages of indexes
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
- cd to the m121 folder

```sh
mongosh "mongodb://cluster0-shard-00-00-jxeqq.mongodb.net:27017,cluster0-shard-00-01-jxeqq.mongodb.net:27017,cluster0-shard-00-02-jxeqq.mongodb.net:27017/aggregations?replicaSet=Cluster0-shard-0" --authenticationDatabase admin --ssl -u m121 -p aggregations --norc
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

Another working pipeline:

```sh
var pipeline = [{$match: {"imdb.rating": {$gte: 7}, genres: {$nin: ["Crime", "Horror"]}, $or: [{rated:"PG"}, {rated: "G"}], languages: {$all: ["English", "Japanese"]}}}]
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

```sh
var pipeline = [{$match:{"imdb.rating":{$gte:7}, genres:{$nin:["Crime", "Horror"]}, rated:{$in:["PG", "G"]}, languages: {$all:["English", "Japanese"]}}}, {$project: {_id:0, rated:"imdb.rating", title:1}}]
load('path_to_file_2')
validateLab2(pipeline)
```

Answer: **15**

### Lab - Computing Fields

```js
//This solution projects into one single stage the length of the title.

b.movies.aggregate({$project: {_id: 0, titleLength: {$size: {$split:["$title", " "]}}}},{$match: {titleLength: 1}}, {$count: "amountOfDocs"})

//Does the same but in 2 stages: 

db.movies.aggregate({$project:{_id:0, title:{$split:["$title", " "]}}}, {$project:{titleLength: {$size: "$title"}}}, {$match: {titleLength:1}}, {$count: "amountOfDocs"})

// Does the same, using itcount
db.movies.aggregate({$project:{_id:0, title:{$split:["$title", " "]}}}, {$project:{titleLength: {$size: "$title"}}}, {$match: {titleLength:1}}).itcount()

//Does the same, without using aggregation:
db.movies.find({$expr: {$eq:[{$size:{$split:["$title", " "]}}, 1]}}).count()
```

Answer: **8066**

### Optional Lab - Expressions with $project

- Checking an array is not empty:

```js
{ $match: { writers: { $elemMatch: { $exists: true } } }
```

- $map. Lets us iterate over an array, element by element, performing some transformation on each element. The result of that transformation will be returned in the same place as the original element.

```js
writers: {
 $map: {
 input: "$writers", // needs to be an array
 as: "writer", // name to refer each element || $$this
 in: "$$writer" // where the work is performed
 }
}
```

given the following array at a key:

```sh
"writers" : [ "Vincenzo Cerami (story)", "Roberto Benigni (story)" ]
```

If we want to map it, and strip the " (story)" we will need to:

``` js
writers: {
 $map: { // to modify the same element
 input: "$writers", // array to modify
 as: "writer", // each element of the array. in this case "Roberto Benigni (story)" for example.
 in: { // expression applied to each element of the input array. could be another one.
 $arrayElemAt: [ { $split: [ "$$writer", " (" ] }, 0 ] } }
}
```

### QUIZ Map

```js
db.movies.aggregate(
 {$project: {_id:0, commonToAll: {$setIntersection: ["$directors", "$cast", {$map:{input:"$writers", as: "writer", in: {$arrayElemAt:[{$split: ["$$writer", " ("]}, 0]}}}]}}},
 {$match: {"commonToAll.0": {$exists:true} }},
 {$count:"docs"})
```

The official solution includes a matching stage with a `{directors: {$elemMatch: {$exists: true}}}` to filter in the beginning null values for the 3 fields.

Then, afterwards mapping `writers`, adds a projection stage:

```js
{$project: {
 labor_of_love: {
 $gt: [ // retrieves a boolean. true/false.
 { $size: { $setIntersection: ["$cast", "$directors", "$writers"] } },   0 ] } } },
 { $match: { labor_of_love: true } }
 ```

## CHAPTER 2

### Lecture: addFields

- $addFields, similar to $project. Only allows to add new fields, or modify existing ones.
- Usually used in composition with $project. In the $project stage, you can filter the subdocuments, and in the $addFields map them to new values {gravity: gravity.value}. Cleaner and more organized in larger pipelines.

### Lecture: geoNear Stage

- $geoNear for geoJSON data.
- Can be used on sharded collections. Requires one and only one geoIndex.
- geoQuery. First stage in the pipeline.
- $near can't use $text
- Takes a lot of arguments. Required: near, distanceField, spherical: true/false
- For geoqueries.
- Must be the first stage.
- Can't use $near in the predicate.
- Can be used on sharded collections ($near can't)
- $near can't use other indexes (like $text)

### Lecture: cursor like stage

- Sort, skip, limit, count. (same as cursor methods)
- Without sort, the default order is the inserted one.
- -1 === descending, 1=== ascending

### $sample

- Selects a set of random documents. 2 algoritmics
- {$sample: {size: N}}

First method

- If N is less than 5%, and collection has more than 100 docs, and sample is the first stage. Then a pseudo random cursor will select the documents.
- else:
in memory random sort. (memory restrictions of $sort)

### Lab: Using Cursor-like Stages

```js
var favorites = [
  "Sandra Bullock",
  "Tom Hanks",
  "Julia Roberts",
  "Kevin Spacey",
  "George Clooney"
  ]

db.movies.aggregate({$match: {cast:{$in:favorites}, "tomatoes.viewer.rating":{$gte: 3}, countries: {$in:["USA"]}}}, {$project: {title: 1, _id: 0, tomatoes:1, num_favs:{$size:{$filter:{input:"$cast", as:"actor", cond: {$in:["$$actor", favorites]}}}}}}, {$sort: {num_favs: -1, "tomatoes.viewer.rating": -1, title: -1}}, {$skip: 24}, {$limit: 1}, {$project: {title: 1, _id:0}})
```

That is using filter. Another way, would had been to set the intersection between the casts array and favorites, and calculate its size:

```js
var favorites = [
  "Sandra Bullock",
  "Tom Hanks",
  "Julia Roberts",
  "Kevin Spacey",
  "George Clooney"
]
num_favs: {$size: {$setIntersection: ["$cast", favorites]}}
```

At the end of the day, setIntersection acts like an inner join, as well as a filter that has as cond and an $in operator.

### Lab: Bringing all together

This exercises is a little bit tricky.
First we need to extract the max and min votes:

```js
db.movies.aggregate({
  $group: {
    _id: null,
    minVotes: { $min: "$imdb.votes" },
    maxVotes: { $max: "$imdb.votes" },
  },
})
```

Which are 5 and 1521105.

A normalize function looks like this:

```js
const normalizeFunction = (x, a = 1, b = 10,  minX,  maxX) => {
  a + ((x - minX) * (b - a)) / (maxX - minX);
};
```

```js
db.movies.aggregate([
    {
      $match: {
        languages: { $in: ["English"] },
        "imdb.rating": { $gte: 1 },
        "imdb.votes": { $gte: 1 },
        year: { $gte: 1990 },
      },
    },
    {
      $project: {
        _id: 0,
        title: 1,
        rating: "$imdb.rating",
        votes: "$imdb.votes",
      },
    },
    {
      $addFields: {
        normalized_rating: {
          $avg: [
            "$rating",
            {
              $add: [
                1,
                {
                  $divide: [
                    {
                      $multiply: [
                        { $subtract: ["$votes", 5] },
                        { $subtract: [10, 1] },
                      ],
                    },
                    {
                      $subtract: [1521105, 5],
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    },
    { $sort: { normalized_rating: 1 } },
    { $limit: 1 },
  ])
```

## CHAPTER 3

### Lecture: Accumulator expression with $group

- $group. _id becomes the criteria to bulndle documents together.
- $group: {_id: "$value_of_something"}
- You can use aggregation accumulator expression.
- $group: {_id: "$value_of_something", newField: {$sum: 1}} => for each document the sum expression is going to be called.
- It might be necesary to sanitize data.
- We can also apply conditions in the _id field

```js
{
  $group: {
    _id: {
      numDirectors :{
        $cond: [{$isArray: "$directors"}, {$size: "$directors"}, 0]
        // the last 2 values: value if true, value if false.
      }
    }
  }
}
```

### Lecture: Accumulator expression with $project

- To find the maximum, $reduce.

```js
 const pipeline = {
   $reduce:{
     input:"$value_of_input_array",
     initialValue: -Infinity, // of the acumulator. accumulator = value
     in: {
       $cond:[
         {$gt: ["$$this.avg_high_tmp", "$$value"]}, // cond, boolean
         "$$this.avg_high_tmp", // if true
         "$$value" // if false
       ]
     }
   }
 }
```

or we can use $max or $min:

```js
const pipeline = [
  {$project: {_id:0, max: {$max:"$avg_high_tmp"}}}
]
```

We can also calculate average as well as standard deviation (cpi)

- $avg, $sum, $max, $min, $stdDevSam, $stdDevPop
- Expression have no memory between documents
- If so, we might beed to use $unwind, @$map or $reduce.

### LAB: Group and accumulators

```js
db.movies.aggregate(
  {$match:  { awards: { $exists: true, $ne: "", $regex: /Won\s[0-9]+\sOscar/i }}},
  {$group:
    {_id:null,
    highest_rating: {$max: "$imdb.rating"},
    lowest_rating: {$min: "$imdb.rating"},
    average_rating: {$avg: "$imdb.rating"},
    deviation: {$stdDevSamp: "$imdb.rating"}
    }
  },
  {
    $addFields: {
      average_rating: { $trunc: ["$average_rating", 4] },
      deviation: { $trunc: ["$deviation", 4] },
    },
  })
```

Answer:

```js
[
  {
    _id: null,
    highest_rating: 9.2,
    lowest_rating: 4.5,
    average_rating: 7.527,
    deviation: 0.5988
  }
]
```

### The $unwind stage

- unwinds an array
- Creates a document per each array entry
- May lead to performance issues on large collections / documents

### Lab - Unwind

```js
db.movies.aggregate(
  {
    $match: {
      "imdb.rating": {
        $exists: true,
        $ne: null,
      },
      cast: { $exists: true, $not: { $size: 0 } },
      languages: { $exists: true, $in: ["English"] },
    },
  },
  { $unwind: "$cast" },
  {
    $group: {
      _id: "$cast",
      numFilms: { $sum: 1 },
      average: { $avg: "$imdb.rating" },
    },
  },
  { $set: { average: { $trunc: ["$average", 1] } } },
  { $sort: { numFilms: -1, average: -1 } },
  { $limit: 1 }
);
```

Answer:

```js
{ _id: 'John Wayne', numFilms: 107, average: 6.4 }
```

### The lookup stage

- Left outer join
- Combines documents from two collections
- Matching documents From A with documents From B
- The collection that uses the from can not be sharded, and must be in the same DB
- Usually after a $lookup, a $match will come to filter empty arrays in the as field (documents with no matches in B)

```js
{
  from: myCollection, // The other collection. Needs to be same db, not sharded
  localField: inMyCollection, //array or single value
  foreignField: onTheOtherCollection, //  B field
  as: newFieldName // watch out not to overwrite existing field
}
```

### QUIZ Lookup

Which of the following statements is true about the $lookup stage?

- [X] $lookup matches between localField and foreignField with an equality match
- [X] Specifying an existing field name to as will overwrite the the existing field
- [ ] You can specify a collection in another database to from
- [X] The collection specified in from cannot be sharded

### Lab - Using Lookup

```js
db.air_routes.aggregate([
    { $match: { airplane: /747|380/ } },
    {
      $lookup: {
        from: "air_alliances",
        localField: "airline.name",
        foreignField: "airlines",
        as: "alliance",
      },
    },
    { $unwind: "$alliance" },
    {
      $group: {
        _id: "$alliance.name",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]).pretty();
```

Answer:

```js
[
  { _id: 'SkyTeam', count: 16 },
  { _id: 'OneWorld', count: 15 },
  { _id: 'Star Alliance', count: 11 }
]
```

### Lecture GraphLookUp

- General purpose DB
- $graphLookup
- Similar to $lookUp

### QUIZ Graphlookup

Which of the following statements apply to $graphLookup operator? check all that apply

- [ ] $graphLookup is a new stage of the aggregation pipeline introduced in MongoDB 3.2
- [ ] $graphLookup depends on $lookup operator. Cannot be used without $lookup
- [ ] $lookup and $graphLookup stages require the exact same fields in their specification.
- [X] Provides MongoDB with graph or graph-like capabilities
- [X] $graphLookup provides MongoDB a transitive closure implementation

### Lecture Simple Lookup

- Usefull for hierarchical data structures
- Parent reference: to who he reports.
- Child reference: from who receives reports.
- If we want to lookup for all the indirects report, it is a pain in the terminal.
- So, for that, $graphLookup
- To do the childs, we can invert the connectFrom and connectTo field!
- We can set the maxDepth field
- depthField: someFieldName can write on which iteration of the maxDepth the document was found

```js

db.collection.aggregate(
  [
    {$match: {name:'Eliot'}},
    {$graphLookup:
      {
        from: 'parent_reference' // name of the collection     
        startsWith: '$_id' // first value to match
        connectFromField: '_id' //who reports to eliot, if switched, it is to whom eliot reports to.
        connectToField: 'reports_to' 
        as:'all_reports'
      }
    }
  ])

```

### QUIZ Graph Lookup

Which of the following statements is/are correct? Check all that apply.

- [ ] as determines a collection where $graphLookup will store the stage results
- [X] connectToField will be used on recursive find operations
- [X] connectFromField value will be use to match connectToField in a recursive match
- [ ] startWith indicates the index that should be use to execute the recursive match

### QUIZ Graph Lookup 2

Which of the following statements are incorrect? Check all that apply

-[X] maxDepth only takes $long values
-[X] depthField determines a field, which contains value of the number of documents matched by the recursive lookup
-[ ] depthField determines a field in the result document, which specifies the number of recursive lookups needed to reach that document
-[ ] maxDepth allows you to specify the number of recursive lookups

### Cross collections graphLookup

- We can do a graphLookUp on other collections using the from field.
- We can also use the restrictSearchWithmatch to perform an inner match on the documents

### Considerations

- High memory allocations. $allowDiskUse will be a friend
- Indexes can accelarete in the connectToField.
- Our front collection can not be sharded
- Even tough using allowDiskUsage might exceed the 100 mb ram per pipeline

### QUIZ GraphLookUp

Consider:

```$graphLookup is required to be the last element on the pipeline.```

- [X] This is incorrect. $graphLookup can be used in any position of the pipeline and acts in the same way as a regular $lookup.
- [ ] This is correct because $graphLookup pipes out the results of recursive search into a collection, similar to $out stage.
- [ ] This is correct because of the recursive nature of $graphLookup we want to save resources for last.
- [ ] This is incorrect. graphLookup needs to be the first element of the pipeline, regardless of other stages needed to perform the desired query.

### Lab

- The right answer is the last option.

## CHAPTER 4

### Facets

- Faceted navigations. For catalogs, grouping data in analytic use cases
- Multiple dimensions, multiple filtered
- Like products in ebay
- Search bar => Gets you some prompts results.
- You can create a facet by using $sortByCount: '$fieldName'

### QUIZ $facets

Which of the following aggregation pipelines are single facet queries?

- [X] ```[  {"$match": { "$text": {"$search": "network"}}},  {"$sortByCount": "$offices.city"}]```
- [X]```[  {"$unwind": "$offices"},  {"$project": { "_id": "$name", "hq": "$offices.city"}},  {"$sortByCount": "$hq"}  {"$sort": {"_id":-1}},  {"$limit": 100}]```
- [ ]```[  {"$match": { "$text": {"$search": "network"}}},  {"$unwind": "$offices"},  {"$sort": {"_id":-1}}]```

### Bucketing strategy

- Faceting by values, brackets or boundaries.
- For example, bucketing on a range of size
- Lower bound inclusive, upper bound exclusive.

```sh
$bucket:{
  groupBy: '$numberOfEmployees',
  boundaries: '[0, 20, 50, 100, 500, Infinity]', #needs to be all values same data type
  default: "other"  # bucket for those who doesnt fall in any category
}

```

### QUIZ MANUAL BUCKETS

Assuming that field1 is composed of double values, ranging between 0 and Infinity, and field2 is of type string, which of the following stages are correct?

-[ ] {'$bucket': { 'groupBy': '$field1', 'boundaries': [ "a", 3, 5.5 ]}}
-[ ] {'$bucket': { 'groupBy': '$field1', 'boundaries': [ 0.4, Infinity ]}}
-[X] {'$bucket': { 'groupBy': '$field2', 'boundaries': [ "a", "asdas", "z" ], 'default': 'Others'}}

Note: the middle one fails because it can not allocate values under 0.4 (errors)

### Auto Bucketing

- We can create them automatically using $bucketAuto. Instead of boundaries, we have the 'buckets' field.
- Returns documents with a min and max in the range in the _id
- we can set another field called 'granularity' that can chose between different distributions

```sh
{
  "min": 3,
  "max": 123,
}
```

### QUIZ AUTO BUCKETS

Auto Bucketing will ...

-[X] given a number of buckets, try to distribute documents evenly across buckets.
-[X] adhere bucket boundaries to a numerical series set by the granularity option.
-[ ] randomly distributed documents accross arbitrarily defined bucket boundaries.
-[ ] count only documents that contain the groupBy field defined in the documents.

### Multiple facets

- $facet can group several facets together (sortByCount, as well as $bucket)
- each key in the $facet takes a subpipeline
- Each subpipeline can not be reused

```sh
$facet:
{
  'categories':  [{'$sortByCount': '$categoryCode'}],
  'Founded':  [
    {'$match': 'founded_year': {'$gte': 1998}},
    {'$autoBucket': {'groupBy': '$number_of_employees', 'buckets': 5}],
}
```

### QUIZ $facet

Which of the following statement(s) apply to the $facet stage?

-[X] The $facet stage allows several sub-pipelines to be executed to produce multiple facets.
-[X] The $facet stage allows the application to generate several different facets with one single database request.
-[ ] The output of the individual $facet sub-pipelines can be shared using the expression $$FACET.$.
-[ ] We can only use facets stages ($sortByCount, $bucket and $bucketAuto) as sub-pipelines of $facet stage.

### LAB $facets

How many movies are in both the top ten highest rated movies according to the imdb.rating and the metacritic fields? We should get these results with exactly one access to the database.

```js
db.movies.aggregate([
  {
    $match: {
      metacritic: { $gte: 0 },
      "imdb.rating": { $gte: 0 }
    }
  },
  {
    $project: {
      _id: 0,
      metacritic: 1,
      imdb: 1,
      title: 1
    }
  },
  {
    $facet: {
      top_metacritic: [
        {
          $sort: {
            metacritic: -1,
            title: 1
          }
        },
        {
          $limit: 10
        },
        {
          $project: {
            title: 1
          }
        }
      ],
      top_imdb: [
        {
          $sort: {
            "imdb.rating": -1,
            title: 1
          }
        },
        {
          $limit: 10
        },
        {
          $project: {
            title: 1
          }
        }
      ]
    }
  },
  {
    $project: {
      movies_in_both: {
        $setIntersection: ["$top_metacritic", "$top_imdb"]
      }
    }
  }
])
```

Answer: 1

-$sortByCount can be used as groupBy to count occurence + sort in descending order

## Chapter 5

- $redact stage.
- Any expression or combination of expressions.
- You need to include a level field in that document level.
- Prune will exclude all fields at the current document level without further inspection.
- Keep will do the opposite.
- Descend mantains the field excpet for arrays and sub documents
- Protect information from unatohorizad acces
- $$DESCEND
- $$PRUNE - remove
- $$KEEP - retain
- Prune and keep are inverse.
- Keep and prune automatically apply to al llevels bellow.
- $redact is not for restricting access to a collection

```js
/ creating a variable to refer against
var userAccess = "Management"

// comparing whether the value/s in the userAccess variable are in the array
// referenced by the $acl field path
db.employees
  .aggregate([
    {
      "$redact": {
        "$cond": [{ "$in": [userAccess, "$acl"] }, "$$DESCEND", "$$PRUNE"]
      }
    }
  ])
  .pretty()

```

### $out

- Outsources to a new collection
- usually at the end of a pipeline
- will override a collection if existing
- only in same db
- indexes will be kept
- if errors, rollsback
- seed a collections, taking snapshots, migrations
  
### QUIZ $out

Which of the following statements is true regarding the $out stage?

-[ ] $out removes all indexes when it overwrites a collection.
-[X] $out will overwrite an existing collection if specified.
-[ ] If a pipeline with $out errors, you must delete the collection specified to the $out stage.
-[ ]  Using $out within many sub-piplines of a $facet stage is a quick way to generate many differently shaped collections.

### $merge

- $out must be unsharded
- $merge can be sharded or unsharded
- used on last stage
- can output to any collection, even different db
- you can specify to merge to an existing collection
- and how to merge. How should be merged?

```sh
{
  $merge: {
    into: <target>, #mandatory
    db: <some_db>,
    coll: <some_coll>,
    on: <field_to_match_to> #if not specified, will try to use the _id. You can pass down a shardkey too (array). Key must be unique.
  }
}
```

### QUIZ $merge 1

In MongoDB 4.2, the $merge Aggregation stage:

- [X] can output to a collection in the same or different database.
- [X] can output to a sharded collection.
- [X] can merge documents from an Aggregation and a target collection.

### QUIZ $merge 2

- If nothing matches, probably you will want to add (insert)
- if match, maybe you want to merge, or to replace.
- whenNotMatched : "insert" | 'discord' | 'fail'
- whenMatched: "merge" | 'replace' | 'keepExisting' | 'fail' |
- Those two fields could be added to the options.
- you can add a pipiele too in whenMatched. $$new will refer to te new document.
- you can use also a field called let to create new variables

### Quiz $merge 3

Consider an Aggregation Pipeline using the new $merge stage that outputs to the employee_data collection.

If we are not expecting to find any matching documents in the employee_data collection, which of the following stages should we use?

The right option:

```sh
{
  $merge: {
    into: "employee_data",
    whenNotMatched: "insert",
    whenMatched: "fail"
  }
}
```

### $merge specific cases

- INSERT INTO T1 SELECT * FROM T2
- Rollups
- Merge data from 2 apis related to a user

### QUIZ $merge 4

The right option

Consider a potential $merge stage that:

outputs results to a collection called analytics.
merges the results of the $merge stage with current analytics documents using the value of the name field.
updates existing analytics documents to include any modified information from the resulting $merge documents.
creates a new analytics document if an existing document with the resulting document's name does not exist.
Which of the following $merge stages will perform all of the above functionality?

```sh
{
  $merge: {
      into: "analytics",
      on: "name",
      whenMatched: "merge",
      whenNotMatched: "insert"
  }
}
```

### Views

- Allows horizontal and vertical slices (vertical, inside the document) ($project)
- Horizontal: not all the records ($match)
- db.createView('view_name', "collection_name", pipeline)
- db.createCollection('name', options)
- No write operatios
- Cannot update or create indexes
- No renaming
- Find() is not allowed with: $slice, $meta, $elemMatch, $
- no mapReduce
- no geoNear
- no $text
- Views are public! Do not share sensitive info.
- Don't contain data, they are created in demand. Read only.

### QUIZ Views

Which of the following statements are true regarding MongoDB Views?

- [ ] Views should be used cautiously because the documents they contain can grow incredibly large.
- [ ] A view cannot be created that contains both horizontal and vertical slices.
- [X] View performance can be increased by creating the appropiate indexes on the source collection.
- [ ] Inserting data into a view is slow because MongoDB must perform the pipeline in reverse.

## CHAPTER 6

### Aggregation performance

- Realtime processing. Performance is important. For apps
- Batch processing. For analytics. Query perfromance is less important.
- use Indexes as much as possible when advised
- Order indexes to the top.
- we can pass {explain: true} as an option to an aggregation pipeline.
- 16mb limit per returned document
- use $limit, $project
- 100mb of ram per stage
- {allowDiskUse: true} => last resource.

### QUIZ Aggregation performance

With regards to aggregation performance, which of the following are true?

- [ ] You can increase index usage by moving $match stages to the end of your pipeline
- [ ] Passing allowDiskUsage to your aggregation queries will seriously increase their performance
- [X] When $limit and $sort are close together a very performant top-k sort can be performed
- [X] Transforming data in a pipeline stage prevents us from using indexes in the stages that follow

### Aggregation on sharded clusters

- If merging of data needed from several shards, it will happen at a random one.
- Except on $out, $facet, $lookup, $graphLookup which the primary shard will do the merging.
- Always use limit before skip (if you want to skip the first 20, just pass 25 to limit)

### QUIZ Aggregation on Sharded Clusters

What operators will cause a merge stage on the primary shard for a database?

- [X] $out
- [ ] $group
- [X] $lookup

### Optimizations part 2

- covered query = no fetch stage
- CACHED_PLAN is better than fetch
- Avoid needless projects
- use $map, $reduce, $filter inside $project for complicated queries

### QUIZ Optimizations

Which of the following statements is/are true?

- [X] The query in a $match stage can be entirely covered by an index
- [X] Causing a merge in a sharded deployment will cause all subsequent pipeline stages to be performed in the same location as the merge
- [X] The Aggregation Framework will automatically reorder stages in certain conditions
- [X] The Aggregation Framework can automatically project fields if the shape of the final document is only dependent upon those fields in the input document.
