/*

    contains functions used to update the maps graphical content

*/

// Define stage type colors
const stage_types = ["Flat stage",
    "Hilly stage",
    "Mountain stage",
    "High mountain stage",
    "Individual time trial",
    "Team time trial"
]

// colors generated using https://medialab.github.io/iwanthue/
const type_colors = ["#7cb742",
    "#6595e7",
    "#b779e5",
    "#e569b7",
    "#f2eb45",
    "#c99d3f"
]

const type_to_color = new Map()
for (let i = 0; i < stage_types.length; i++) {
    type_to_color.set(stage_types[i], type_colors[i])
}

// On each map movement, this function is called to update the positions of the D3.js elements
function update() {
    d3.selectAll(".stage_point")
        .attr("cx", function (d) {
            return map.latLngToLayerPoint([d.lat, d.long]).x;
        })
        .attr("cy", function (d) {
            return map.latLngToLayerPoint([d.lat, d.long]).y;
        });

    d3.selectAll(".point_stage_link")
        .attr("cx", function (d) {
            return map.latLngToLayerPoint([d.lat, d.long]).x;
        })
        .attr("cy", function (d) {
            return map.latLngToLayerPoint([d.lat, d.long]).y;
        });

    d3.selectAll(".stage_link").attr("d", function (d) {
        var source = map.latLngToLayerPoint(d.source);
        source = [source.x, source.y];

        var target = map.latLngToLayerPoint(d.target);
        target = [target.x, target.y];

        return linkGen({ source: source, target: target });

    });

    var flags = ["#start_flag", "#finish_flag"]
    flags.forEach((flag) => {
        var elem = d3.select(flag)
        if (!!elem.node()) {
            var lat = elem.attr("lat")
            var long = elem.attr("long")
            var height = elem.attr("height")
            elem.attr("x", map.latLngToLayerPoint([lat, long]).x - 5)
                .attr("y", map.latLngToLayerPoint([lat, long]).y - height + 2)
        }
    })
}

var selected_edition_stages;

function get_markers_links_and_jumps_of_year(selected_edition, stages, locations) {

    var markers = [];
    var stage_markers = [];
    var links = [];
    var jumps = [];

    var origins = []
    var destinations = []

    selected_edition_stages = stages.get(selected_edition)

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

            if (source[0] == target[0] && source[1] == target[1]) {
                var stage_marker = { long: +destinations[i].lat, lat: destinations[i].long, type: selected_edition_stages[i].type, stage_id: selected_edition_stages[i].stage };
                stage_markers.push(stage_marker);
            }

            var link = { source: source, target: target, type: selected_edition_stages[i].type, stage_id: selected_edition_stages[i].stage };

            links.push(link);

            var marker = { long: +origins[i].lat, lat: origins[i].long };
            markers.push(marker);

            var marker = { long: +destinations[i].lat, lat: destinations[i].long };
            markers.push(marker);


            if (i < origins.length - 1 && (destinations[i].location != origins[i + 1].locations)) {
                var jump_source = target;
                var jump_target = [+origins[i + 1].long, +origins[i + 1].lat]
                var jump = { source: jump_source, target: jump_target }
                jumps.push(jump)
            }

        } catch (error) {
            console.log(origins[i]);
            console.log(destinations[i]);
        }
    }

    return [markers, links, jumps, stage_markers]
}

var linkGen = d3.linkHorizontal();
var strokeWidth = 6;

function reset_all_paths_states() {
    d3.selectAll(".stage_link").attr("stroke", function () {
        var color = d3.select(this).attr("original_color")
        if (color) {
            return color
        }
        return "black"
    }).attr("clicked", false)
    d3.selectAll(".point_stage_link").attr("fill", function () {
        var color = d3.select(this).attr("original_color")
        if (color) {
            return color
        }
        return "black"
    }).attr("clicked", false)
}

// Draw all the elements displayed on the map
function draw_map_elements(markers, links, jumps, stage_markers) {

    d3.select("#map").select("svg").selectAll("*").remove();

    // draw links between locations
    d3.select("#map")
        .select("svg")
        .selectAll("links")
        .data(links)
        .join("path")
        .attr("d", function (d) {
            var source = map.latLngToLayerPoint(d.source);
            source = [source.x, source.y];

            var target = map.latLngToLayerPoint(d.target);
            target = [target.x, target.y];

            return linkGen({ source: source, target: target });
        })
        .attr("fill", "none")
        .attr("stroke-width", strokeWidth)
        .attr("stage_id", function (d) {
            // add title for hover on tooltip
            var title = document.createElementNS('http://www.w3.org/2000/svg', 'title')
            title.innerHTML = "Stage " + d.stage_id
            this.appendChild(title)
            return d.stage_id;
        })
        .attr("stroke", function (d) {
            var color = type_to_color.get(d.type);
            d3.select(this).attr("original_color", color)
            return color
        })
        .attr("pointer-events", "visiblePainted")
        .attr("class", "leaflet-interactive stage_link")
        .attr("clicked", false)
        /* enable color change on hover */
        .on("mouseover", function () {
            if (d3.select(this).attr("clicked") == "false") {
                d3.select(this).attr("stroke", pSBC(0.5, d3.select(this).attr("stroke")))
            }
        })
        .on("mouseout", function () {
            if (d3.select(this).attr("clicked") == "false") {
                d3.select(this).attr("stroke", d3.select(this).attr("original_color"))
            }

        })
        /* enable stage selection by clicking on paths */
        .on("click", function () {
            reset_all_paths_states()
            d3.select(this).attr("clicked", true)
            d3.select(this).attr("stroke", pSBC(0.5, d3.select(this).attr("stroke")))
            sidebar.open("stages")
            selected_stage = selected_edition_stages.filter(stage => {
                return stage.stage == d3.select(this).attr("stage_id");
            })[0]
            document.getElementById("stage_select").value = selected_stage.stage
            var edition_year = selected_stage.date.slice(0, 4)
            fill_stage_result_table(edition_year, selected_stage.stage)
            fill_stage_result_information(edition_year, selected_stage.stage)
        })

    d3.select("#map")
        .select("svg")
        .selectAll("jumps")
        .data(jumps)
        .join("path")
        .attr("d", function (d) {
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
        .attr("class", "stage_link")

    // add point stage markers
    d3.select("#map")
        .select("svg")
        .selectAll("markers")
        .data(stage_markers)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return map.latLngToLayerPoint([d.lat, d.long]).x;
        })
        .attr("cy", function (d) {
            return map.latLngToLayerPoint([d.lat, d.long]).y;
        })
        .attr("r", 8)
        .attr("fill", function (d) {
            var color = type_to_color.get(d.type);
            d3.select(this).attr("original_color", color)
            return color
        })
        .attr("pointer-events", "visiblePainted")
        .attr("class", "leaflet-interactive point_stage_link")
        .attr("clicked", false)
        /* enable color change on hover */
        .on("mouseover", function () {
            if (d3.select(this).attr("clicked") == "false") {
                d3.select(this).attr("fill", pSBC(0.5, d3.select(this).attr("fill")))
            }
        })
        .on("mouseout", function () {
            if (d3.select(this).attr("clicked") == "false") {
                d3.select(this).attr("fill", d3.select(this).attr("original_color"))
            }

        })
        /* enable stage selection by clicking on point */
        .on("click", function () {
            reset_all_paths_states()
            d3.select(this).attr("clicked", true)
            d3.select(this).attr("fill", pSBC(0.5, d3.select(this).attr("fill")))
            sidebar.open("stages")
            selected_stage = selected_edition_stages.filter(stage => {
                return stage.stage == d3.select(this).attr("stage_id");
            })[0]
            document.getElementById("stage_select").value = selected_stage.stage
            var edition_year = selected_stage.date.slice(0, 4)
            fill_stage_result_table(edition_year, selected_stage.stage)
            fill_stage_result_information(edition_year, selected_stage.stage)
        })
        .attr("stage_id", function (d) {
            // add title for hover on tooltip
            var title = document.createElementNS('http://www.w3.org/2000/svg', 'title')
            title.innerHTML = "Stage " + d.stage_id
            this.appendChild(title)
            return d.stage_id;
        });


    // add stage end points
    d3.select("#map")
        .select("svg")
        .selectAll("markers")
        .data(markers)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return map.latLngToLayerPoint([d.lat, d.long]).x;
        })
        .attr("cy", function (d) {
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
            var title = document.createElementNS('http://www.w3.org/2000/svg', 'title')
            title.innerHTML = "Start"
            d3.select("#start_flag")
                .node()
                .appendChild(title)
        });

    // add finish flag svg
    d3.svg("https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-datawiz/master/website/resources/finish_flag.svg")
        .then(data => {
            var mod_data = data.documentElement;
            mod_data.id = "finish_flag";
            var start_flag_svg = document.importNode(mod_data, true)

            var width = 30;
            var height = 30;
            var coord = markers.slice(markers.length - 1, markers.length)[0];

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
            var title = document.createElementNS('http://www.w3.org/2000/svg', 'title')
            title.innerHTML = "Finish"
            d3.select("#finish_flag")
                .node()
                .appendChild(title)
        });
}