/*

    contains functions used to update numerical and statistical content on the sidebar

*/

var flags;
var stages;
var winners;
var locations;
var stage_data;
var jerseys_data;
var edition_data;
var jersey_imgs = new Map();


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
        stages = initialize[1]
        stage_data = initialize[2]
        jerseys_data = initialize[3]
        edition_data = initialize[4]
        winners = initialize[5]
        flags = initialize[6]
        const years = new Set()
        stages.forEach(stage => {
            years.add(stage.year);
        });

        var starting_year = "2017"

        fill_edition_select(years, starting_year)
        fill_edition_result_information(starting_year)
        changeEdition(starting_year)
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

    var stage_numbers = new Set()
    stages.forEach(stage => {
        if (stage.year == edition_year) {
            stage_numbers.add(stage.stage)
        }
    })

    fill_stage_select(edition_year, stage_numbers)
    fill_stage_result_information(edition_year, 1)
    fill_jersey_winner(edition_year)
    fill_edition_result_table(edition_year);
    
    // Update stage change
    $('#stage_select').on('change', function() {
        // Update which results are displayed
        var selected_stage = $(this).val();
        fill_stage_result_table(edition_year, selected_stage)
        fill_edition_result_information(edition_year)
        fill_stage_result_information(edition_year, selected_stage)
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