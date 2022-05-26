/*

    contains functions used to update numerical and statistical content on the sidebar

*/


var stages;
var locations;
var stage_data;

function init_edition_selection() {
    Promise.all([
        d3.csv("https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-datawiz/master/data/locations.csv"),
        d3.csv("https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-datawiz/master/data/tdf_stages.csv"),
        d3.csv("https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-datawiz/master/data/stage_data.csv")
    ]).then(function(initialize) {
        locations = initialize[0];
        stages = initialize[1]
        stage_data = initialize[2]
    
        const years = new Set()
        stages.forEach(stage => {
            years.add(stage.year);
        });
    
        var starting_year = "2017"
        
        fill_edition_select(years, starting_year)
        changeEdition(starting_year)
    });
}

function changeEdition(edition_year) {
    var markers_links_jumps = get_markers_links_and_jumps_of_year(edition_year, stages, locations);

    var markers = markers_links_jumps[0]
    var links = markers_links_jumps[1]
    var jumps = markers_links_jumps[2]

    draw_map_elements(markers, links, jumps)

    var stage_numbers = new Set()
    stages.forEach(stage => {
        if (stage.year == edition_year) {
            stage_numbers.add(stage.stage)
        }
    })

    fill_stage_select(edition_year, stage_numbers)

    // Update stage change
    $('#stage_select').on('change', function() {
        // Update which results are displayed
        var selected_stage = $(this).val();
        fill_stage_result_table(edition_year, selected_stage)

        // Update which path is higlighted
        reset_all_paths_states()
        var link = d3.selectAll(".leaflet-interactive.stage_link")
            .filter(function(d) {
                return d.stage_id == selected_stage
            })
        link.attr("clicked", true)
            .attr("stroke", pSBC(0.5, link.attr("stroke")))
    });
}