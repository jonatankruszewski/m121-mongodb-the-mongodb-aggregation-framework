db.movies.aggregate([
    {
      $match: {
        awards: { $exists: true, $ne: "", $regex: /Won\s[0-9]+\sOscar/i },
      },
    },
    {
      $group: {
        _id: null,
        highest_rating: { $max: "$imdb.rating" },
        lowest_rating: { $min: "$imdb.rating" },
        average_rating: { $avg: "$imdb.rating" },
        average_deviation: { $stdDevSamp: "$imdb.rating" },
      },
    },
    {
      $addFields: {
        average_rating: { $trunc: ["$average_rating", 4] },
        average_deviation: { $trunc: ["$average_deviation", 4] },
      },
    },
  ]).pretty()