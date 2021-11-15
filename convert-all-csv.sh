echo "Writing to " $2
mkdir -p $2
echo "Extracting club info"
jq -r -f ./src/club-csv.jq $1 > "$2/$1-club.csv"
echo "Extracting hole info"
jq -r -f ./src//hole-csv.jq $1 > "$2/$1-hole.csv"
echo "Extracting score info"
jq -r -f ./src//scorecard-csv.jq $1 > "$2/$1-scorecard.csv"
echo "Extracting shot row info"
jq -r -f ./src//shot-detail-row-order.jq $1 > "$2/$1-shots-row.csv"
echo "Extracting shot column info"
jq -r -f ./src//shot-detail-col-order.jq $1 > "$2/$1-shots-col.csv"