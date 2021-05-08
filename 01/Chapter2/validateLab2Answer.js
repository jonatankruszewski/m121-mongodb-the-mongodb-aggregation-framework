var pipeline = [
  {
    $match: {
      "imdb.rating": { $gte: 7 },
      genres: { $nin: ["Crime", "Horror"] },
      rated: { $in: ["PG", "G"] },
      languages: { $all: ["English", "Japanese"] },
    },
  },
  {
    $project: { title: 1, rated: 1, _id: 0 },
  },
];
