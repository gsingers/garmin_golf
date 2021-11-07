jq -r -f ./club-csv.jq $1 > $1-club.csv
jq -r -f ./hole-csv.jq $1 > $1-hole.csv
jq -r -f ./scorecard-csv.jq $1 > $1-scorecard.csv
jq -r -f ./shot-detail-row-order.jq $1 > $1-shots-row.csv
jq -r -f ./shot-detail-col-order.jq $1 > $1-shots-col.csv