
let svg = d3.select("body").append("svg");

var width = 600,
    height = 400;

let nyLat = 41, nyLng = -74;
function drawCountryCentered(code, color) {
    let fname = `world.geo.json/countries/${code}.geo.json`
    d3.json(fname).then(function(data) {
        let [lng, lat] = d3.geoCentroid(data.features[0]);
        // lat = nyLat;
        // lng = nyLng;

        var projection = d3.geoOrthographic()
                .scale(300)
                .rotate([-lng, -lat, 0])
                // .center([lat, 0])
                .translate([width/2, height/2]);
        console.log(code, lng, lat)
        var geoPath = d3.geoPath()
            .projection(projection);

        drawCountry(data, code, color, geoPath);
    });
}

function drawCountry(data, code, color, geoPath) {
    svg.selectAll('g')
        .data(data.features)
        .enter()
        .append('path')
        .attr('id', code)
        .attr('d', geoPath)
        .attr('stroke', 'black')
        .attr('fill', color);
}

function drawCountries() {
    let countries = ['AFG', 'AGO', 'ALB', 'ARE', 'AUS', 'BEL', 'AUT', 'BGR', 'BHS', 'BIH', 'BLZ',
    'BRA', 'BRN', 'BWA', 'CAF', 'CHE', 'CHL', 'CHN', 'CIV', 'COD', 'COL', 'CRI', 'CS-KM', 'CUB',
    'CYP', 'CZE', 'DEU',

    'USA', 'CAN', 'MEX', 'RUS', 'EGY', 'JPN', 'ATA'];
    // countries.forEach(code => drawCountryCentered(code, 'green'));
    drawCountryCentered('USA', 'red');
    drawCountryCentered('ATA', 'green');
}

drawCountries()
