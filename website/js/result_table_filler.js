/*

    functions used to update result tables

*/

function format_seconds(seconds) {
    d = Number(seconds);
    var hv = Math.floor(d / 3600);
    var mv = Math.floor(d % 3600 / 60);
    var sv = Math.floor(d % 3600 % 60);

    var h = hv > 0 ? hv + (hv == 1 ? " hour, " : " hours, ") : "";
    var m = mv > 0 ? mv + (mv == 1 ? " minute, " : " minutes, ") : "";
    var s = sv > 0 ? sv + (sv == 1 ? " second" : " seconds") : "";
    
    return h + m + s; 
}

function fill_stage_result_table(year, stage_number) {
    selected_stage_data = stage_data.filter(function(data) {
        return (data.year == year) && (data.stage_number == stage_number)
    })
    var table = $("#stage_result").DataTable();

    table.clear()
    selected_stage_data.forEach(stage_data => {
        table.row.add([stage_data.rank, stage_data.rider, stage_data.team, stage_data.time_sec, stage_data.time_gap_to_winner_sec]).draw(false);
    });
}