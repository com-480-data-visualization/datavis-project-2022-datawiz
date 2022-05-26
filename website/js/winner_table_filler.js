function fill_winner_table(year, stage_number) {
    selected_stage_data = stage_data.filter(function(data) {
        return (data.year == year) && (data.stage_number == stage_number)
    })
    var table = $("#stage_winners").DataTable();


    table.clear()
    selected_stage_data.forEach(stage_data => {
        console.log(stage_data.name)
        table.row.add([stage_data.rank, stage_data.rider, stage_data.team, stage_data.time_gap_to_winner_sec]).draw(false);
    });


}