function fill_edition_select(years, selected) {
    var edition_select = document.getElementById("edition_select")

    years = Array.from(years).sort()
    years.forEach(year => {
        var opt = document.createElement('option');
        opt.value = year;
        opt.innerHTML = year;
        edition_select.appendChild(opt);
    });

    edition_select.value = selected
}

function fill_stage_select(edition_year, stage_numbers) {
    var stage_select = document.getElementById("stage_select")
    stage_select.innerHTML = '';

    stage_numbers = Array.from(stage_numbers)
    stage_numbers.forEach(n => {
        var opt = document.createElement('option');
        opt.value = n;
        opt.innerHTML = n;
        stage_select.appendChild(opt);
    });

    stage_select.value = stage_numbers[0]

    fill_stage_result_table(edition_year, stage_numbers[0])
}