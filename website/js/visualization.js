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
            pane: data[0],
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

        // dynamically update stage type illustration in edition tab
        observer = new MutationObserver(function(mutationsList, observer) {
            set_stage_emoji()
        });
        observer.observe(document.getElementById("stage_type"), {childList: true, subtree: true, characterData: true});
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
