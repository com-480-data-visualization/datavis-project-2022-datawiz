/*

    functions used to update result tables

*/

var armstrong_doping_years = ["1999", "2000", "2001", "2002", "2003", "2004", "2005"]

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

function format_date(s) {
    var year = s.slice(0, 4)
    var month = s.slice(5, 7)
    var day = s.slice(8, 10)
    var date = new Date(year, month, day)
    var intl = new Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    return intl.format(date)
}

function fill_stage_result_table(year, stage_number) {
    selected_stage_data = stage_data.get(year).filter(function(data) {
        return data.stage_number == stage_number
    })
    var table = $("#stage_result").DataTable()
    
    table.clear()
    table.page("first")
    selected_stage_data.forEach(stage_data => {
        table.row.add([stage_data.rank, stage_data.rider, stage_data.team, format_seconds(stage_data.time_sec), "+ " + format_seconds(stage_data.time_gap_to_winner_sec)]).draw(false);
    });
}

function fill_stage_result_information(year, stage) {

    var starting_date = document.getElementById("stage_date");
    var distance = document.getElementById("stage_distance");
    var type = document.getElementById("stage_type");
    var origin = document.getElementById("start_point");
    var finish = document.getElementById("end_point");
    var selected_stage_information = stages.get(year).filter(function (data) {
        return data.stage == stage
    })
    starting_date.innerHTML = format_date(selected_stage_information[0].date);
    distance.innerHTML = selected_stage_information[0].distance_km + ' km';
    type.innerHTML  = selected_stage_information[0].type;
    origin.innerHTML  =  selected_stage_information[0].origin;
    finish.innerHTML  = selected_stage_information[0].destination;
}

function fill_edition_result_table(year) {
    var table = $("#edition_result").DataTable()

    table.clear()
    table.page("first")
    edition_data.get(year).forEach(rider_data => {
        table.row.add([rider_data.rank, rider_data.rider, rider_data.team, format_seconds(rider_data.time_sec), "+ " + format_seconds(rider_data.time_gap_to_winner_sec)]).draw(false);
    });
}


function fill_jersey_winner(year) {
    var jerseys = ["yellow", "points", "kom", "white"];
    var table = d3.select("#jersey_winners")
    var data_row = [];
    var winners = new Map();

    jerseys_data.get(year).forEach(row => {
        data_row = row
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
        if (armstrong_doping_years.includes(year) && key == "yellow") {
            table.select("#winner_name_" + key).text(value.split('').map(char => char + '\u0336').join(''))
        } else {
            table.select("#winner_name_" + key).text(value)
        }
    })
}

function fill_edition_result_information(year){

    if (armstrong_doping_years.includes(year)) {
        document.getElementById("armstrong_doping_note").hidden = null
    } else {
        document.getElementById("armstrong_doping_note").hidden = true
    }

    var edition_date = document.getElementById("edition_date");
    var edition_end = document.getElementById("edition_end");
    var num_of_stages = document.getElementById("num_of_stages");
    var edition_distance = document.getElementById("edition_distance");
    var total_teams = document.getElementById("total_teams");
    var total_riders = document.getElementById("total_riders");

    var number_of_stages = new Set()
    var distances = new Set()
    var teams = new Set()
    var starters = new Set()
    
    var edition_stats = stages.get(year)

    var start_date = edition_stats[0].date
    var end_date = edition_stats[edition_stats.length-1].date
    
    edition_stats.forEach(edition_stat => {
        number_of_stages.add(edition_stat.stage);
        distances.add(parseInt(edition_stat.distance_km));
        teams.add(edition_stat.team)
        starters.add(edition_stat.rider)
    })

    edition_date.innerHTML = format_date(start_date);
    edition_end.innerHTML = format_date(end_date);
    num_of_stages.innerHTML = Array.from(number_of_stages).pop();
    sum_distance =  Array.from(distances).reduce((a, b) => a + b, 0)
    edition_distance.innerHTML  = sum_distance +' km';

    selected_stage_data = stage_data.get(year)
    selected_stage_data.forEach(select_date => {
    teams.add(select_date.team)
    starters.add(select_date.rider)
    })  
    total_riders.innerHTML = (starters.size);
    total_teams.innerHTML = (teams.size);

}

