function get_markers_links_and_jumps_of_year(selected_edition, stages, locations) {

    var markers = [];
    var links = [];
    var jumps = [];

    var origins = []
    var destinations = []



    var selected_edition_stages = stages.filter(stage => {
        return stage.year == selected_edition;
    })


    selected_edition_stages.forEach(element => {
        var origin = locations.filter(location => {
            return location.location == element.Origin
        })[0]
        origins.push(origin)
        var destination = locations.filter(location => {
            return location.location == element.Destination
        })[0]
        destinations.push(destination);
    })

    for (var i = 0; i < origins.length; i++) {
        try {
            var source = [+origins[i].long, +origins[i].lat];
            var target = [+destinations[i].long, +destinations[i].lat];
            var link = { source: source, target: target, type: selected_edition_stages[i].Type };
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
        .attr("stroke-width", 3)
        .attr("stroke", function(d) {
            var color = type_to_color[d.type];
            if (!color) {
                console.log(d.type);
            }
            return color
        })
        .attr("class", "stage_link");


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
        .attr("stroke-width", 3)
        .style("stroke-dasharray", ("3, 3"))
        .attr("stroke", "black")
        .attr("class", "stage_link");


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

            d3.select("#map")
                .select("svg")
                .node()
                .append(
                    start_flag_svg    
                )

            var width = 30;
            var height = 30;

            d3.select("#start_flag")
                .attr("width", width)
                .attr("height", height)
                .attr("class", "stage_point_flag")

            d3.select("#map")
                .select("svg")
                .selectAll("end")
                .data(markers.slice(0, 1))
                .enter()
                .append("placeholder")
                .attr("cx", function(d) {
                    var vx = map.latLngToLayerPoint([d.lat, d.long]).x
                    d3.select("#start_flag")
                        .attr("x", vx - 5)
                })
                .attr("cy", function(d) {
                    var vy = map.latLngToLayerPoint([d.lat, d.long]).y
                    d3.select("#start_flag")
                        .attr("y", vy - height + 2)
                })
        });

    // add finish flag svg
    d3.svg("https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-datawiz/master/website/resources/finish_flag.svg")
        .then(data => {
            var mod_data = data.documentElement;
            mod_data.id = "finish_flag";
            var start_flag_svg = document.importNode(mod_data, true)

            d3.select("#map")
                .select("svg")
                .node()
                .append(
                    start_flag_svg    
                )

            var width = 30;
            var height = 30;

            d3.select("#finish_flag")
                .attr("width", width)
                .attr("height", height)
                .attr("class", "stage_point_flag")

            d3.select("#map")
                .select("svg")
                .selectAll("end")
                .data(markers.slice(markers.length -1, markers.length))
                .enter()
                .append("placeholder")
                .attr("cx", function(d) {
                    var vx = map.latLngToLayerPoint([d.lat, d.long]).x
                    d3.select("#finish_flag")
                        .attr("x", vx - 5)
                })
                .attr("cy", function(d) {
                    var vy = map.latLngToLayerPoint([d.lat, d.long]).y
                    d3.select("#finish_flag")
                        .attr("y", vy - height + 2)
                })
        });


}


var type_to_color = { "Flat stage": "green", "Mountain stage": "purple", "Individual time trial": "cyan", "Team time trial": "aquamarine", "Hilly stage": "hotpink", "High mountain stage": "gold" }