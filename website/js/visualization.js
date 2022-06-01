/*

    entry point of the visualization

*/

// callback called once visualization is loaded
var loaded_callback = () => {
    // If the user change the map (zoom or drag), call update function
    map.on("moveend", update);

    // hide loading screen
    document.getElementById("loading_screen").style.display = "none"

    // open home tab
    sidebar.open("home");
}

var map = L.map("map").setView([47, 2], 6);

// move zoom button to the right
d3.select(".leaflet-top.leaflet-left").attr("class", "leaflet-top leaflet-right");

// Add a tile to the map = a background. Comes from OpenStreetmap
L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png", {
        attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
        maxZoom: 16,
        detectRetina: true,
    }
).addTo(map);

L.svg().addTo(map);

// Open sidebar on home tab
var sidebar = L.control
    .sidebar({
        container: "sidebar",
    })
    .addTo(map)

// Load html
var urls = [
    "https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-datawiz/master/website/html/tab_edition.html",
    "https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-datawiz/master/website/html/tab_stage.html",
    "https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-datawiz/master/website/html/tab_information.html",
]
Promise.all(
        urls.map((url) => fetch(url).then(response => response.text()))
    ).then(function(data) {
        // Add editions tab
        sidebar.addPanel({
            id: "edition",
            tab: '📅',
            title: "Edition",
            pane: `<!-- selection -->
            <div style="display: flex; justify-content: center; align-items: center;">
                <h4 style="width: 50%; float: left;">Choose the year:</h4>
            
                <div class="container py-4" style="width: 50%; float: right;">
                    <select id="edition_select" class="form-select" aria-label="Edition selection">
                    </select>
                </div>
            </div>
            
            <!-- stats -->
            <div>
                <h4>Stats:</h4>
                <div style="width: 90%; margin: 0 auto;">
                    <!-- dates -->
                    <div style="display: flex; justify-content: center; align-items: center;">
                        <div style="display: flex; width: 50%; float: left;">
                            <p style="width: 20%; float:left;">From </p>
                            <div id="edition_date" style="width: 80%; float: right;"></div>
                        </div>
                        <div style="display: flex; width: 50%; float: right;">
                            <p style="width: 20%; float:left;">to </p>
                            <div id="edition_end" style="width: 80%; float: right;"></div>
                        </div>
                    </div>
            
                    <!-- numerical stats -->
                    <div style="display: flex; justify-content: center; align-items: center;">
                        <div style="display: flex; width: 50%; float: left;">
                            <table class="table table-borderless" style="vertical-align: middle; width: fit-content;">
                                <thead>
                                    <tr>
                                        <th scope="col"></th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row" style="padding-left: 0pt;">Number of stages</th>
                                        <td id="num_of_stages" style="padding-right: 0pt; text-align: end;"></td>
                                    </tr>
                                    <tr>
                                        <th scope="row" style="padding-left: 0pt;">Total distance</th>
                                        <td id="edition_distance" style="padding-right: 0pt; text-align: end;"></td> 
                                    </tr>
                                    <tr>
                                        <th scope="row" style="padding-left: 0pt;">Number of teams</th>
                                        <td id="total_teams" style="padding-right: 0pt; text-align: end;"></td>
                                    </tr>
                                    <tr>
                                        <th scope="row" style="padding-left: 0pt;">Total starters</th>
                                        <td id="total_riders" style="padding-right: 0pt; text-align: end;"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <!-- jersey winners -->
                        <div style="display: flex; width: 50%; float: right;">
                            <table id="jersey_winners" class="table table-borderless" style="vertical-align: middle; width: fit-content;">
                                <thead>
                                    <tr>
                                        <th scope="col"></th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr id="jersey_table_entry_yellow" , hidden=true>
                                        <th scope="row"><img style="height: 1.5em; width: auto; padding-right: 9px;" src="../resources/yellow_jersey.svg" /></th>
                                        <td id="winner_name_yellow"></td>
                                    </tr>
                                    <tr id="jersey_table_entry_points" , hidden=true>
                                        <th scope="row"><img style="height: 1.5em; width: auto; padding-right: 9px;" src="../resources/green_jersey.svg" /></th>
                                        <td id="winner_name_points"></td>
                                    </tr>
                                    <tr id="jersey_table_entry_kom" , hidden=true>
                                        <th scope="row"><img style="height: 1.5em; width: auto; padding-right: 9px;" src="../resources/kom_jersey.svg" /></th>
                                        <td id="winner_name_kom"></td>
                                    </tr>
                                    <tr id="jersey_table_entry_white" , hidden=true>
                                        <th scope="row"><img style="height: 1.5em; width: auto; padding-right: 9px;" src="../resources/white_jersey.svg" /></th>
                                        <td id="winner_name_white"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div> 
                </div>
            </div>
            
            <!-- result table -->
            <div>
                <h4 style="padding-bottom: 0.5em;">General Classification:</h4>
            
                <table id="edition_result" class="display compact" style="width:100%;">
                    <thead>
                        <tr id="stage_result_titles"></tr>
                        <th>Rank</th>
                        <th>Name</th>
                        <th>Team</th>
                        <th>Time</th>
                        <th>Gap</th>
                        </tr>
                    </thead>
                    <tbody id="edition_result_body">
                    </tbody>
                </table>
            </div>`,
        })

        // Add stage tab
        sidebar.addPanel({
            id: "stages",
            tab: '🏁',
            title: "Stages",
            pane: data[1],
        })

        // Add information tab
        sidebar.addPanel({
            id: "information",
            tab: 'ℹ️',
            title: "Information",
            pane: data[2],
        })
    })
    .then(() => {
        // make information tab buttons clickable
        var coll = document.getElementsByClassName("inf_tab_collapsible");
        for (var i = 0; i < coll.length; i++) {
            coll[i].addEventListener("click", function() {
                // close other tabs
                for (let elem of coll) {
                    if (elem != this) {
                        elem.classList.remove("active")
                        elem.nextElementSibling.style.maxHeight = null;
                    }
                }

                // toggle this tab
                this.classList.toggle("active");
                var content = this.nextElementSibling;
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                } else {
                    content.style.maxHeight = content.scrollHeight + "px";
                }
            });
        };
    })
    .then(() => {
        init_edition_selection(loaded_callback)
        // Draw new lines and markers on edition change
        $('#edition_select').on('change', function() {
            var selected_edition = $(this).val();
            changeEdition(selected_edition);
        });
    })

// be notified when a panel is opened
sidebar.on("content", function(ev) {
    switch (ev.id) {
        case "autopan":
            sidebar.options.autopan = true;
            break;
        default:
            sidebar.options.autopan = false;
    }
});

// add legend
var legend = L.control({ position: "bottomright" });
legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "legend");
    type_to_color.forEach((value, key, _) => {
        div.innerHTML += '<i style="background: ' + value + '"></i><span>' + key + '</span><br>'
    });

    div.innerHTML += `<i style="background: repeating-linear-gradient(
        to right,
        #000000,
        #000000 3px,
        #FFFFFF 3px,
        #FFFFFF 6px
      );"></i><span>Transfer</span><br>`

    return div;
};
legend.addTo(map);
