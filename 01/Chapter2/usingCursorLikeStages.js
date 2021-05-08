db.movies.aggregate([
  {
    $match: {
      countries: {
        $in: ["USA"],
      },
      "tomatoes.viewer.rating": {
        $gte: 3,
      },
    },
  },
  {
    $project: {
      title: 1,
      _id: 0,
      rating: "$tomatoes.viewer.rating",
      num_favs: {
        $size: {
          $ifNull: [
            {
              $setIntersection: [
                "$cast",
                [
                  "Sandra Bullock",
                  "Tom Hanks",
                  "Julia Roberts",
                  "Kevin Spacey",
                  "George Clooney",
                ],
              ],
            },
            [],
          ],
        },
      },
    },
  },
  {
    $sort: {
      num_favs: -1,
      rating: -1,
      title: -1,
    },
  },
  {
    $skip: 24,
  },
  {
    $limit: 1,
  },
]);
