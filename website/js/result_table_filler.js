/*

    functions used to update result tables

*/

function format_seconds(seconds) {
    d = Number(seconds);
    var hv = Math.floor(d / 3600);
    var mv = Math.floor(d % 3600 / 60);
    var sv = Math.floor(d % 3600 % 60);

    var hd = hv > 0 ? (hv > 9 ? hv + "h " : " " + hv + "h ") : "00h ";
    var md = mv > 0 ? (mv > 9 ? mv + "\' " : "0" + mv + "\' "): "00\' ";
    var sd = sv > 0 ? (sv > 9 ? sv + "\' " : "0" + sv + "\'"): "00\"";

    return hd + md + sd;
}

function fill_stage_result_table(year, stage_number) {
    selected_stage_data = stage_data.filter(function (data) {
        return (data.year == year) && (data.stage_number == stage_number)
    })
    var table = $("#stage_result").DataTable();

    table.clear()
    selected_stage_data.forEach(stage_data => {
        table.row.add([stage_data.rank, stage_data.rider, stage_data.team, format_seconds(stage_data.time_sec), "+ " + format_seconds(stage_data.time_gap_to_winner_sec)]).draw(false);
    });
}

function fill_jersey_winner(year) {
    var jerseys = ["yellow", "points", "kom", "white"];
    var table = d3.select("#jersey_winners")
    var data_row = [];
    var winners = new Map();

    jerseys_data.forEach(row => {
        if (row.year == year) {
            data_row = row
        }
    });

    jerseys.forEach(jersey => {
        if (data_row[jersey] != undefined && data_row[jersey] != "") {
            winners.set(jersey, data_row[jersey])
        }
    });

    jerseys.forEach(jersey => {
        table.select("#jersey_table_entry_"+jersey).attr("hidden", true)
    })

    winners.forEach((value, key, _) => {
        table.select("#jersey_table_entry_"+key).attr("hidden", null)
        table.select("#winner_name_"+key).text(value)
    })
}