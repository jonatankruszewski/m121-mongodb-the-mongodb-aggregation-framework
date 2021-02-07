
# Chapter 2

## $addFields ---> Like project, but adds fields. Project---> select and remove fields.

project: use to filter yes / no
addFields: use to restructure / add fields.

Clearer syntax.

$project: {gravity: "gravity.value"}

to:
$project: {gravity: 1}
$addFields: {gravity: "gravity.value"}


$geoNear
For geoqueries.
must be the first stage.
can't use $near in the predicate.
can be used on charted collections ($near can't)
$near can't use other indexes (like $text)

required arguments: near, distanceField, spherical.
{
    near: {type: "point", coordinates: [,]};
    distanceField: "string"
    spherical: true;
}


{
    $count: some_fieldName
}

{$sort: {fieldone: 1, fieldTwo: -1}}


{allowDiskUse: true} //  to add more disk to use the limit of 100 mb in the ram.

$sample
good for aleatory data



