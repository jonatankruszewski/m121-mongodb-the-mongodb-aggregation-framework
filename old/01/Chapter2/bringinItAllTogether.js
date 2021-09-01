//in Node, to extract the votes:
const votes = await db.movies.aggregate({
  $group: {
    _id: null,
    minVotes: { $min: "$imdb.votes" },
    maxVotes: { $max: "$imdb.votes" },
  },
});
const { maxVotes, minVotes } = votes;

//Hard coded for this exercises:
const minVotes = 5; // other way to grab it: db.movies.find({'imdb.votes':{$exists:true, $ne: null, $ne: ""}},{imdb:1}).sort({'imdb.votes':1}).limit(1)
const maxVotes = 1521105; // other way to grab it: db.movies.find({'imdb.votes':{$exists:true, $ne: null, $ne: ""}},{imdb:1}).sort({'imdb.votes':-1}).limit(1)

// To normalize the votes to a 1-10 scale:
const normalizeFunction = (
  x,
  a = 1,
  b = 10,
  minX = minVotes,
  maxX = maxVotes
) => {
  a + ((x - minX) * (b - a)) / (maxX - minX);
};

// in aggregation

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
  ]).pretty();
