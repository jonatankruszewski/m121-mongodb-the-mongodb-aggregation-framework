// SOL 1
db.movies
  .aggregate([
    { $match: { $expr: { $eq: [{ $size: { $split: ["$title", " "] } }, 1] } } },
  ])
  .itcount();

//SOL 2
db.movies
  .aggregate([
    {
      $project: {
        title: 1,
        sizeOfTitle: { $size: { $split: ["$title", " "] } },
      },
    },
    { $match: { sizeOfTitle: 1 } },
  ])
  .itcount();
