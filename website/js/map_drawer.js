var stages;
var locations;
var stage_data;
//D3.JS on Leaflet
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
    fill_select(years, starting_year)

    changeEdition(starting_year)
});

function changeEdition(edition_year) {
    var markers_links_jumps = get_markers_links_and_jumps_of_year(edition_year, stages, locations);

    var markers = markers_links_jumps[0]
    var links = markers_links_jumps[1]
    var jumps = markers_links_jumps[2]

    draw_markers_links_and_jumps_on_map(markers, links, jumps)
}

//Draw new lines and markers on edition change
$('#edition_select').on('change', function() {
    var selected_edition = $(this).val();
    changeEdition(selected_edition);
});