/*

    entry point of the visualization

*/


var map = L.map("map").setView([47, 2], 6);

// Add a tile to the map = a background. Comes from OpenStreetmap
L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png", {
        attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
        maxZoom: 16,
        detectRetina: true,
    }
).addTo(map);

L.svg().addTo(map);

// If the user change the map (zoom or drag), call update function
map.on("moveend", update);

// Open sidebar on home tab
var sidebar = L.control
    .sidebar({
        container: "sidebar",
    })
    .addTo(map)
    .open("home");

// Add editions tab
fetch("https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-datawiz/master/website/html/tab_edition.html")
    .then(response => response.text())
    .then((data) => {
        sidebar.addPanel({
            id: "edition",
            tab: '📅',
            title: "Edition",
            pane: data,
        })
    })
    .then(() => {
        init_edition_selection()
        // Draw new lines and markers on edition change
        $('#edition_select').on('change', function() {
            var selected_edition = $(this).val();
            changeEdition(selected_edition);
        });
    })
    
// Add stage tab
fetch("https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-datawiz/work-jonas-improve-result-table/website/html/tab_stage.html")
    .then(response => response.text())
    .then((data) => {
        sidebar.addPanel({
            id: "stages",
            tab: '🏁',
            title: "Stages",
            pane: data
        })
    })

// Add information tab
fetch("https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-datawiz/master/website/html/tab_information.html")
    .then(response => response.text())
    .then((data) => {
        sidebar.addPanel({
            id: "information",
            tab: 'ℹ️',
            title: "Information",
            pane: data
        })
    }).then(
        () => {
            var coll = document.getElementsByClassName("inf_tab_collapsible");
            for (var i = 0; i < coll.length; i++) {
                coll[i].addEventListener("click", function() {
                    this.classList.toggle("active");
                    var content = this.nextElementSibling;
                    if (content.style.maxHeight) {
                        content.style.maxHeight = null;
                    } else {
                        content.style.maxHeight = content.scrollHeight + "px";
                    }
                });
            };
        }
    )

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
        div.innerHTML += '<i style="background: '+value+'"></i><span>'+key+'</span><br>'
    });

  return div;
};
legend.addTo(map);