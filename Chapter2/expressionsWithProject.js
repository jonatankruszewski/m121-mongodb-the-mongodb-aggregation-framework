// add the $count stage to the end of your pipeline
// you will learn about this stage shortly!
db.movies.aggregate([
  {
    $match: {
      writers: { $elemMatch: { $exists: true } },
      cast: { $elemMatch: { $exists: true } },
      directors: { $elemMatch: { $exists: true } },
    },
  },
  {
    $project: {
      title: 1,
      cast: 1,
      directors: 1,
      writers: {
        $map: {
          input: "$writers",
          as: "writer",
          in: {
            $arrayElemAt: [
              {
                $split: ["$$writer", " ("],
              },
              0,
            ],
          },
        },
      },
    },
  },
  {
    $project: {
      labor_of_love: {
        $gt: [
          { $size: { $setIntersection: ["$cast", "$directors", "$writers"] } },
          0,
        ],
      },
    },
  },
  {
    $match: { labor_of_love: true },
  },
  {
    $count: "labors of love",
  },
]);
