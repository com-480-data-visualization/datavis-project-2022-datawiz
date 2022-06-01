/*

    functions used to update result tables

*/

function format_seconds(seconds) {
    d = Number(seconds);
    var hv = Math.floor(d / 3600);
    var mv = Math.floor(d % 3600 / 60);
    var sv = Math.floor(d % 3600 % 60);

    var hd = hv > 0 ? (hv > 9 ? hv + "h " : " " + hv + "h ") : "00h ";
    var md = mv > 0 ? (mv > 9 ? mv + "\' " : "0" + mv + "\' ") : "00\' ";
    var sd = sv > 0 ? (sv > 9 ? sv + "\' " : "0" + sv + "\'") : "00\"";

    return hd + md + sd;
}

function fill_stage_result_table(year, stage_number) {
    selected_stage_data = stage_data.filter(function(data) {
        return (data.year == year) && (data.stage_number == stage_number)
    })
    var table = $("#stage_result").DataTable()
    
    table.clear()
    table.page("first")
    selected_stage_data.forEach(stage_data => {
        table.row.add([stage_data.rank, stage_data.rider, stage_data.team, format_seconds(stage_data.time_sec), "+ " + format_seconds(stage_data.time_gap_to_winner_sec)]).draw(false);
    });
}

function fill_stage_result_information(year,stage) {

    var starting_date = document.getElementById("stage_date");
    var distance = document.getElementById("stage_distance");
    var type = document.getElementById("stage_type");
    var origin = document.getElementById("start_point");
    var finish = document.getElementById("end_point");
    var winner_ = document.getElementById("winner");
    selected_stage_information = stages.filter(function (data) {
        return (data.year == year) && (data.stage == stage)
    })
    starting_date.innerHTML = ("Start Date: " +  selected_stage_information[0].date);
    distance.innerHTML = ("Distance: " +  selected_stage_information[0].distance_km + ' km');
    type.innerHTML  = ("Stage Type: " +  selected_stage_information[0].type);
    origin.innerHTML  =  ("Starting point: " + selected_stage_information[0].origin);
    finish.innerHTML  = ("End point: " + selected_stage_information[0].destination);
    winner_.innerHTML = ("Winner: " + selected_stage_information[0].winner);   
}

function fill_edition_result_table(year) {
    selected_edition = edition_data.filter(function(edition) {
        return (edition.year == year)
    })
    var table = $("#edition_result").DataTable()

    table.clear()
    table.page("first")
    selected_edition.forEach(rider_data => {
        table.row.add([rider_data.rank, rider_data.rider, rider_data.team, format_seconds(rider_data.time_sec), "+ " + format_seconds(rider_data.time_gap_to_winner_sec)]).draw(false);
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
        table.select("#jersey_table_entry_" + jersey).attr("hidden", true)
    })

    winners.forEach((value, key, _) => {
        table.select("#jersey_table_entry_" + key).attr("hidden", null)
        table.select("#winner_name_" + key).text(value)
    })
}

function fill_edition_result_information(year){

    var edition_date = document.getElementById("edition_date");
    var edition_end = document.getElementById("edition_end");
    var num_of_stages = document.getElementById("num_of_stages");
    var edition_distance = document.getElementById("edition_distance");
    var total_teams = document.getElementById("total_teams");
    var total_riders = document.getElementById("total_riders");
    var number_of_stages = new Set()
    var dates = new Set()
    var distances = new Set()
    var teams = new Set()
    var starters = new Set()
    edition_stats = stages.filter(function (data) {
        return (data.year == year)
    })
    edition_stats.forEach(edition_stat => {
        number_of_stages.add(edition_stat.stage);
        dates.add(edition_stat.date);
        distances.add(parseInt(edition_stat.distance_km));
        teams.add(edition_stat.team)
        starters.add(edition_stat.rider)
    })
   
    edition_date.innerHTML = ("Edition date: " +  dates.values().next().value);
    edition_end.innerHTML = ("End of edition: " +  Array.from(dates).pop());
    num_of_stages.innerHTML = ("Numbers of stages: " +  Array.from(number_of_stages).pop());
    sum_distance =  Array.from(distances).reduce((a, b) => a + b, 0)
    edition_distance.innerHTML  = ("Total Distance: " +  sum_distance +' km');

    selected_stage_data = stage_data.filter(function (data) {
        return (data.year == year) 
    })
    selected_stage_data.forEach(select_date => {
    teams.add(select_date.team)
    starters.add(select_date.rider)
    })  
    total_riders.innerHTML = ("Total Starters: " +  starters.size);
    total_teams.innerHTML = ("Total teams: " +  teams.size);

}

