jq -r -f ./src/club-csv.jq $1 > $1-club.csv
jq -r -f ./src//hole-csv.jq $1 > $1-hole.csv
jq -r -f ./src//scorecard-csv.jq $1 > $1-scorecard.csv
jq -r -f ./src//shot-detail-row-order.jq $1 > $1-shots-row.csv
jq -r -f ./src//shot-detail-col-order.jq $1 > $1-shots-col.csv