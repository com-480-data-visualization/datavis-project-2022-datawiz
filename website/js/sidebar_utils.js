/*

    contains functions used to update numerical and statistical content on the sidebar

*/

var flags;
var stages = new Map();
var winners = new Map();
var locations;
var stage_data = new Map();
var jerseys_data = new Map();
var edition_data = new Map();
var jersey_imgs = new Map();

function build_map(map, row) {
    if (map.has(row.year)) {
        map.get(row.year).push(row)
    } else {
        var arr = new Array()
        arr.push(row)
        map.set(row.year, arr)
    }
}


function init_edition_selection(callback) {
    Promise.all([
        d3.csv("https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-datawiz/master/data/locations.csv"),
        d3.csv("https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-datawiz/master/data/tdf_stages.csv"),
        d3.csv("https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-datawiz/master/data/stage_data.csv"),
        d3.csv("https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-datawiz/master/data/jerseys.csv"),
        d3.csv("https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-datawiz/master/data/TDF_Riders_History.csv"),
        d3.csv("https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-datawiz/master/data/tdf_winners.csv"),
        d3.csv("https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-datawiz/master/data/flags.csv"),
    ]).then(function(initialize) {
        locations = initialize[0];
        initialize[1].forEach((value, index, array) => {build_map(stages, value)});
        initialize[2].forEach((value, index, array) => {build_map(stage_data, value)});
        initialize[3].forEach((value, index, array) => {build_map(jerseys_data, value)});
        initialize[4].forEach((value, index, array) => {build_map(edition_data, value)});
        initialize[5].forEach((value, index, array) => {build_map(winners, value)});
        flags = initialize[6]

        const years = new Set()
        for (year of stages.keys()) {
            years.add(year);
        }

        var starting_year = "2017"

        fill_edition_select(years, starting_year)
        fill_edition_result_information(starting_year)
        changeEdition(starting_year)
        set_stage_emoji()
        callback()
    });
}

function changeEdition(edition_year) {
    var markers_links_jumps = get_markers_links_and_jumps_of_year(edition_year, stages, locations);

    var markers = markers_links_jumps[0]
    var links = markers_links_jumps[1]
    var jumps = markers_links_jumps[2]
    var stage_markers = markers_links_jumps[3]

    draw_map_elements(markers, links, jumps, stage_markers)

    var stage_numbers = stages.get(edition_year).map((value, index, array) => value.stage)

    fill_stage_select(edition_year, stage_numbers)
    fill_stage_result_information(edition_year, 1)
    fill_jersey_winner(edition_year)
    fill_edition_result_table(edition_year);
    fill_edition_result_information(edition_year)
    
    // Update stage change
    $('#stage_select').on('change', function() {
        // Update which results are displayed
        var selected_stage = $(this).val();
        var selected_year = document.getElementById("edition_select").value
        fill_stage_result_table(selected_year, selected_stage)
        fill_stage_result_information(selected_year, selected_stage)
        // Update which path is higlighted
        reset_all_paths_states()
        var link = d3.selectAll(".leaflet-interactive.stage_link")
            .filter(function(d) {
                return d.stage_id == selected_stage
            })
        link.attr("clicked", true)
            .attr("stroke", pSBC(0.5, link.attr("stroke")))
        
        var link = d3.selectAll(".leaflet-interactive.point_stage_link")
            .filter(function(d) {
                return d.stage_id == selected_stage
            })
        if (!!link.node()) {
            link.attr("clicked", true)
            .attr("fill", pSBC(0.5, link.attr("fill")))
        }
        
    });
}

function set_stage_emoji() {
    var container = document.getElementById("stage_type_emoji");
    var stage_type = document.getElementById("stage_type").innerHTML;
    switch (stage_type) {
        case 'Flat stage':
            container.innerHTML = "🌳";
            container.style.fontSize = "70pt"
            break;
        case 'Hilly stage':
            container.innerHTML = "🌄";
            container.style.fontSize = "70pt"
            break;
        case 'Mountain stage':
            container.innerHTML = "⛰️";
            container.style.fontSize = "70pt"
            break;
        case 'High mountain stage':
            container.innerHTML = "🏔️";
            container.style.fontSize = "70pt"
            break;
        case 'Individual time trial':
            container.innerHTML = "🚴‍♀️";
            container.style.fontSize = "70pt"
            break;
        case 'Team time trial':
            container.innerHTML = "🚴‍♀️🚴‍♀️🚴‍♀️";
            container.style.fontSize = "40pt"
            break;
        default:
          console.log(`Unknown stage type ${expr}.`);
      }
      
}