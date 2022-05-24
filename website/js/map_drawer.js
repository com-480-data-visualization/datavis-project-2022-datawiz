var stages;
var locations;
//D3.JS on Leaflet
Promise.all([
    d3.csv("https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-datawiz/master/data/locations.csv"),
    d3.csv("https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-datawiz/master/data/tdf_stages.csv")
]).then(function(initialize) {
    locations = initialize[0];
    stages = initialize[1]

    const years = new Set()
    stages.forEach(stage => {
        var year = (stage.Date.slice(0, 4));
        stage.year = year;
        years.add(year);
    });

    var starting_year = "2010"
    fill_select(years, starting_year)

    changeEdition("2010")
});


//On each map movement, this function is called to update the positions of the D3.js elements
function update() {

    d3.selectAll(".stage_point")
        .attr("cx", function(d) {
            return map.latLngToLayerPoint([d.lat, d.long]).x;
        })
        .attr("cy", function(d) {
            return map.latLngToLayerPoint([d.lat, d.long]).y;
        });

    d3.selectAll(".stage_link").attr("d", function(d) {
        var source = map.latLngToLayerPoint(d.source);
        source = [source.x, source.y];

        var target = map.latLngToLayerPoint(d.target);
        target = [target.x, target.y];

        return linkGen({ source: source, target: target });   
    });

    // var vx = d3.select("#start_flag").attr("x")
    // var vy = d3.select("#start_flag").attr("y")
    // var coord_map = map.latLngToLayerPoint([vx, vy])
    // d3.select("#start_flag")
    //     .attr("x", coord_map.x)
    //     .attr("y", coord_map.y)
    
    // console.log(vx)
    // console.log(coord_map)

}


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