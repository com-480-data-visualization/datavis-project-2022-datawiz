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

    var lat = d3.selectAll("#start_flag").attr("lat")
    var long = d3.selectAll("#start_flag").attr("long")
    var height = d3.selectAll("#start_flag").attr("height")
    d3.select("#start_flag")
        .attr("x", map.latLngToLayerPoint([lat, long]).x - 5)
        .attr("y", map.latLngToLayerPoint([lat, long]).y - height + 2)

    var lat = d3.selectAll("#finish_flag").attr("lat")
    var long = d3.selectAll("#finish_flag").attr("long")
    var height = d3.selectAll("#finish_flag").attr("height")
    d3.select("#finish_flag")
        .attr("x", map.latLngToLayerPoint([lat, long]).x - 5)
        .attr("y", map.latLngToLayerPoint([lat, long]).y - height + 2)
}

var selected_edition_stages;

function get_markers_links_and_jumps_of_year(selected_edition, stages, locations) {

    var markers = [];
    var links = [];
    var jumps = [];

    var origins = []
    var destinations = []



    selected_edition_stages = stages.filter(stage => {
        return stage.year == selected_edition;
    })


    selected_edition_stages.forEach(element => {
        var origin = locations.filter(location => {
            return location.location == element.origin
        })[0]
        origins.push(origin)
        var destination = locations.filter(location => {
            return location.location == element.destination
        })[0]
        destinations.push(destination);
    })

    for (var i = 0; i < origins.length; i++) {
        try {
            var source = [+origins[i].long, +origins[i].lat];
            var target = [+destinations[i].long, +destinations[i].lat];
            var link = { source: source, target: target, type: selected_edition_stages[i].type, stage_id: selected_edition_stages[i].stage };

            links.push(link);

            if (i < origins.length - 1 && (destinations[i].location != origins[i + 1].locations)) {
                var jump_source = target;
                var jump_target = [+origins[i + 1].long, +origins[i + 1].lat]
                var jump = { source: jump_source, target: jump_target }
                jumps.push(jump)

            }

            var marker = { long: +origins[i].lat, lat: origins[i].long };
            markers.push(marker);

            var marker = { long: +destinations[i].lat, lat: destinations[i].long };
            markers.push(marker);


        } catch (error) {
            console.log(origins[i]);
            console.log(destinations[i]);
        }
    }

    return [markers, links, jumps]
}

var linkGen = d3.linkHorizontal();
var strokeWidth = 6;

function reset_all_paths_states() {
    d3.selectAll("path").attr("stroke", function() {
        var color = d3.select(this).attr("original_color")
        if (color) {
            return color
        }
        return "black"
    }).attr("clicked", false)
}

function draw_markers_links_and_jumps_on_map(markers, links, jumps) {

    d3.select("#map").select("svg").selectAll("*").remove();

    //Draw links between locations
    d3.select("#map")
        .select("svg")
        .selectAll("links")
        .data(links)
        .join("path")
        .attr("d", function(d) {
            var source = map.latLngToLayerPoint(d.source);
            source = [source.x, source.y];

            var target = map.latLngToLayerPoint(d.target);
            target = [target.x, target.y];

            return linkGen({ source: source, target: target });
        })
        .attr("fill", "none")
        .attr("stroke-width", strokeWidth)
        .attr("stage_id", function(d) {
            return d.stage_id;
        })
        .attr("stroke", function(d) {
            var color = type_to_color.get(d.type);
            d3.select(this).attr("original_color", color)
            return color
        }).attr("pointer-events", "visiblePainted")
        .attr("class", "leaflet-interactive stage_link")
        .attr("clicked", false)
        /* enable color change on hover */
        .on("mouseover", function() {
            if (d3.select(this).attr("clicked") == "false") {
                d3.select(this).attr("stroke", pSBC(0.5, d3.select(this).attr("stroke")))
            }
        })
        .on("mouseout", function() {
            if (d3.select(this).attr("clicked") == "false") {
                d3.select(this).attr("stroke", d3.select(this).attr("original_color"))
            }

        })
        /* enable stage selection by clicking on paths */
        .on("click", function() {
            reset_all_paths_states()
            d3.select(this).attr("clicked", true)
            d3.select(this).attr("stroke", pSBC(0.5, d3.select(this).attr("stroke")))
            sidebar.open("stages")
            selected_stage = selected_edition_stages.filter(stage => {
                return stage.stage == d3.select(this).attr("stage_id");
            })[0]
            document.getElementById("stage_select").value = selected_stage.stage
            fill_stage_result_table(selected_stage.date.slice(0, 4), selected_stage.stage)
        })


    d3.select("#map")
        .select("svg")
        .selectAll("jumps")
        .data(jumps)
        .join("path")
        .attr("d", function(d) {
            var source = map.latLngToLayerPoint(d.source);
            source = [source.x, source.y];

            var target = map.latLngToLayerPoint(d.target);
            target = [target.x, target.y];
            return linkGen({ source: source, target: target });
        })
        .attr("fill", "none")
        .attr("stroke-width", strokeWidth)
        .style("stroke-dasharray", ("3, 3"))
        .attr("stroke", "black")
        .attr("class", "stage_link");


    // add stage end points
    d3.select("#map")
        .select("svg")
        .selectAll("markers")
        .data(markers)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return map.latLngToLayerPoint([d.lat, d.long]).x;
        })
        .attr("cy", function(d) {
            return map.latLngToLayerPoint([d.lat, d.long]).y;
        })
        .attr("r", 4)
        .style("fill", "black")
        .attr("class", "stage_point");

    // add start flag svg
    d3.svg("https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-datawiz/master/website/resources/start_flag.svg")
        .then(data => {
            var mod_data = data.documentElement;
            mod_data.id = "start_flag";
            var start_flag_svg = document.importNode(mod_data, true)

            var width = 30;
            var height = 30;
            var coord = markers.slice(0, 1)[0];

            d3.select("#map")
                .select("svg")
                .node()
                .append(
                    start_flag_svg    
                )

            d3.select("#start_flag")
                .attr("width", width)
                .attr("height", height)
                .attr("class", "stage_point_flag")
                .attr("lat", coord.lat)
                .attr("long", coord.long)
                .attr("x", map.latLngToLayerPoint([coord.lat, coord.long]).x - 5)
                .attr("y", map.latLngToLayerPoint([coord.lat, coord.long]).y - height + 2)

            // for hover on pop up
            d3.select("#start_flag")
                .selectAll("g")
                .append(() => document.createElement("title"))
                .text("Start")
        });

    // add finish flag svg
    d3.svg("https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-datawiz/master/website/resources/finish_flag.svg")
        .then(data => {
            var mod_data = data.documentElement;
            mod_data.id = "finish_flag";
            var start_flag_svg = document.importNode(mod_data, true)

            var width = 30;
            var height = 30;
            var coord = markers.slice(markers.length -1, markers.length)[0];

            d3.select("#map")
                .select("svg")
                .node()
                .append(
                    start_flag_svg    
                )

            d3.select("#finish_flag")
                .attr("width", width)
                .attr("height", height)
                .attr("class", "stage_point_point")
                .attr("lat", coord.lat)
                .attr("long", coord.long)
                .attr("x", map.latLngToLayerPoint([coord.lat, coord.long]).x - 5)
                .attr("y", map.latLngToLayerPoint([coord.lat, coord.long]).y - height + 2)

            // for hover on pop up
            d3.select("#finish_flag")
                .selectAll("g")
                .append(() => document.createElement("title"))
                .text("Finish")
        });
}

/* Define stage type colors */
const type_to_color = new Map()
type_to_color.set("Flat stage", "#03C700")
type_to_color.set("Mountain stage", "#5d00c7")
type_to_color.set("Individual time trial", "#00b3c7")
type_to_color.set("Team time trial", "#007bc7")
type_to_color.set("Hilly stage", "#b300c7")
type_to_color.set("High mountain stage", "#c79c00")