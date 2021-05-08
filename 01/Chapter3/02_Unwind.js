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
