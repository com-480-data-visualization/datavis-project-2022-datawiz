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


// If the user change the map (zoom or drag), I update circle position:
map.on("moveend", update);

var sidebar = L.control
    .sidebar({
        container: "sidebar",
    })
    .addTo(map)
    .open("home");

// add editions tab
sidebar
    .addPanel({
        id: "edition",
        tab: '📅',
        title: "Edition",
        pane: '<p style="padding-top: 1em;">This tab allows for edition selection and contains information on the currently selected edition.</p><div class="container py-4"><select id="edition_select" class="form-select" aria-label="Default select example"></select></div>',
    })
// add stages tab
fetch("https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-datawiz/master/website/html/stage_tab.html")
    .then(response => response.text())
    .then((data) => {
        sidebar.addPanel({
            id: "stages",
            tab: '🏁',
            title: "Stages",
            pane: data
        })
    })
// add information tab
fetch("https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-datawiz/master/website/html/information_tab.html")
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

/* add Map legend */
var legend = L.control({ position: "bottomright" });

legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<h4>Legend</h4>";
    type_to_color.forEach((value, key, _) => {
        div.innerHTML += '<i style="background: '+value+'"></i><span>'+key+'</span><br>'
    });

  return div;
};

legend.addTo(map);