import * as d3 from 'd3';
import * as turf from '@turf/turf'
const _ = require('lodash');

const width = window.innerWidth || document.body.clientWidth,
      height = window.innerHeight || document.body.clientHeight,
      scale = 1000;

// height -= 10;

let svg = d3.select("body").append("svg")
    .attr('width', width)
    .attr('height', height)
// svg.append('g')
//     .attr('width', width)
//     .attr('height', height)
//     .attr('fill', '#aaaaaa');

svg.append('text')
    .attr('x', 100)
    .attr('y', 100)
    .style('font-size', 24)
    .attr('id', 'cost-text')
    .text('wat')

function createGeoPath() {
    container.projection = d3.geoMercator()
        .scale(scale)
        .rotate([-50, 25, 0])
        .translate([width/2, height/2]);
    container.geoPath = d3.geoPath()
        .projection(container.projection);
}

function getCountryGeojson(code) {
    let fname = `world.geo.json/countries/${code}.geo.json`
    return d3.json(fname).then(function(data) {
        container.centroids[code] = turf.centroid(data.features[0]).geometry.coordinates;
        // console.log(`"${code}": [${turf.centroid(data.features[0]).geometry.coordinates}]`);
        return data;
    }).catch(err => console.error);
}

function drawCountryCentered(code, color, center, scale) {
    // let fname = `world.geo.json/countries/${code}.geo.json`
    // d3.json(fname).then(function(data) {
    getCountryGeojson(code).then(function(data) {
        let lat, lng;
        if(!center)
            [lng, lat] = d3.geoCentroid(data.features[0]);
        else [lng, lat] = center;

        if(!scale) scale = 500;

        var projection = d3.geoOrthographic()
                .scale(scale)
                .rotate([-lng, -lat, 0])
                .translate([width/2, height/2]);
        console.log(code, lng, lat)
        var geoPath = d3.geoPath()
            .projection(projection);

        drawCountry(data.features, code, color);
    }).catch(function(err){
        console.log(err);
    });
}

function drawCountry(features, code, color, opacity) {
    if(!opacity) opacity = 0.75;
    svg.selectAll('g')
        .data(features)
        .enter()
        .append('path')
        .attr('id', code)
        .attr('d', container.geoPath)
        .attr('stroke', 'black')
        .attr('fill', color)
        .attr('opacity', opacity)
}

function drawCountryPreprojected(features, code, color, opacity) {
    if(!opacity) opacity = 0.75;
    var path = d3.geoPath().projection(null);
    svg.selectAll('g')
        .data(features)
        .enter()
        .append('path')
        .attr('id', code)
        .attr('d', path)
        .attr('stroke', 'black')
        .attr('fill', color)
        .attr('opacity', opacity)
}

function redrawCountry(code, color) {
    let country = svg.select(`#${code}`);
    if(color) country.attr('color', color);
    country.attr('d', container.geoPath);
}

function deleteCountry(code) {
    svg.select(`#${code}`).remove();
}

function multiPologonToMaxPolygon(multipoly) {
    // take the largest polygon in a multipologon and return just that as a geojson object
    // this is necessary because turf.js doesn't compute intersections on multipologons

    let coordinates = _.maxBy(multipoly.geometry.coordinates, l => l[0].length);
    if(coordinates.length !== 1) coordinates = [coordinates]; // 🙄
    return {
      "type": "Feature",
      "properties": {
        "fill": "#0f0"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": coordinates
      }
    }
}

function emptyGeom() {
    return {
      "type": "Feature",
      "properties": {
        "fill": "#0f0"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": []
      }
    }
}

function intersect(poly1, poly2) {
    let intersection = turf.intersect(poly1, poly2) || emptyGeom();
    return intersection;
}

function cost(moverPoly, staticPoly, intersection) {
    // don't count the mover's area, or it will be inclined to run for a pole
    if(!intersection)
        intersection = intersect(moverPoly, staticPoly);
    let intersectionArea = turf.area(intersection);
    if(intersectionArea === 0)
        return distCentroids(moverPoly, staticPoly) + turf.area(staticPoly) - intersectionArea;
    let cost = turf.area(staticPoly) - intersectionArea;
    return cost;
}

function distCentroids(poly1, poly2) {
    let centroid1 = turf.centroid(poly1),
        centroid2 = turf.centroid(poly2);
    return turf.distance(centroid1, centroid2);
}

function ppcost(poly1, poly2, intersection) {
    return (cost(poly1, poly2, intersection)/1000).toFixed(2)
}

function normedCost(poly1, poly2, intersection) {
    if(!intersection)
        intersection = intersect(poly1, poly2);
    let intersectionArea = turf.area(intersection);
    return  100 - (turf.area(intersection) / turf.area(poly2));
}

const allCodes = ['AFG', 'AGO', 'ALB', 'ARE', 'ARG', 'ARM', 'ATA', 'ATF', 'AUS', 'AUT', 'AZE', 'BDI', 'BEL', 'BEN', 'BFA', 'BGD', 'BGR', 'BHS', 'BIH', 'BLR', 'BLZ', 'BMU', 'BOL', 'BRA', 'BRN', 'BTN', 'BWA', 'CAF', 'CAN', 'CHE', 'CHL', 'CHN', 'CIV', 'CMR', 'COD', 'COG', 'COL', 'CRI', 'CS-KM', 'CUB', 'CYP', 'CZE', 'DEU', 'DJI', 'DNK', 'DOM', 'DZA', 'ECU', 'EGY', 'ERI', 'ESH', 'ESP', 'EST', 'ETH', 'FIN', 'FJI', 'FLK', 'FRA', 'GAB', 'GBR', 'GEO', 'get all names', 'GHA', 'GIN', 'GMB', 'GNB', 'GNQ', 'GRC', 'GRL', 'GTM', 'GUF', 'GUY', 'HND', 'HRV', 'HTI', 'HUN', 'IDN', 'IND', 'IRL', 'IRN', 'IRQ', 'ISL', 'ISR', 'ITA', 'JAM', 'JOR', 'JPN', 'KAZ', 'KEN', 'KGZ', 'KHM', 'KOR', 'KWT', 'LAO', 'LBN', 'LBR', 'LBY', 'LKA', 'LSO', 'LTU', 'LUX', 'LVA', 'MAR', 'MDA', 'MDG', 'MEX', 'MKD', 'MLI', 'MLT', 'MMR', 'MNE', 'MNG', 'MOZ', 'MRT', 'MWI', 'MYS', 'NAM', 'NCL', 'NER', 'NGA', 'NIC', 'NLD', 'NOR', 'NPL', 'NZL', 'OMN', 'PAK', 'PAN', 'PER', 'PHL', 'PNG', 'POL', 'PRI', 'PRK', 'PRT', 'PRY', 'PSE', 'QAT', 'ROU', 'RUS', 'RWA', 'SAU', 'SDN', 'SEN', 'SLB', 'SLE', 'SLV', 'SOM', 'SRB', 'SSD', 'SUR', 'SVK', 'SVN', 'SWE', 'SWZ', 'SYR', 'TCD', 'TGO', 'THA', 'TJK', 'TKM', 'TLS', 'TTO', 'TUN', 'TUR', 'TWN', 'TZA', 'UGA', 'UKR', 'URY', 'USA', 'USA', 'UZB', 'VEN', 'VNM', 'VUT', 'YEM', 'ZAF', 'ZMB', 'ZWE']
const selectedCodes = ['AFG', 'AGO', 'ALB', 'ARE', 'AUS', 'BEL', 'AUT', 'BGR', 'BHS', 'BIH', 'BLZ', 'BOL',
'BRA', 'BRN', 'BWA', 'CAF', 'CHE', 'CHL', 'CHN', 'CIV', 'COD', 'COL', 'CRI', 'CS-KM', 'CUB',
'CYP', 'CZE', 'DEU', 'DOM', 'DZA', 'ECU', 'ESH', 'FJI', 'FLK', 'GEO', 'GIN', 'GTM', 'GUF', 'JAM', 'NIC', 'PER', 'VEN', 'GUY', 'USA', 'CAN', 'MEX', 'RUS', 'EGY', 'JPN', 'ATA'];
function drawCountries() {
    let lat = 45.5, lng = -120, scale = 500;

    allCodes.forEach(code => {
        getCountryGeojson(code).then(data => {
            drawCountry(data.features, code, '#aaa', 0.1);
        })
    });
}

function estimateGradient(parameters) {
    // for each parameter, check if making it larger or smaller changes cost for the better
}

function translateX(geojson, amt) {
    for(let i=0; i<geojson.geometry.coordinates[0].length; i++) {
        geojson.geometry.coordinates[0][i][0] += amt;
    }
    return geojson;
}

function translateY(geojson, amt) {
    for(let i=0; i<geojson.geometry.coordinates[0].length; i++) {
        geojson.geometry.coordinates[0][i][1] += amt;
    }
    return geojson;
}

function negateY(geojson) {
    for(let i=0; i<geojson.geometry.coordinates[0].length; i++) {
        geojson.geometry.coordinates[0][i][1] *= -1;
    }
    return geojson;
}

function findMax(geojson) {
    let maxX = 0;
    let maxY = 0;
    for(let i=0; i<geojson.geometry.coordinates[0].length; i++) {
        if(maxX == 0 || geojson.geometry.coordinates[0][i][0] > maxX)
            maxX = geojson.geometry.coordinates[0][i][0];
        if(maxY == 0 || geojson.geometry.coordinates[0][i][1] > maxY)
            maxY = geojson.geometry.coordinates[0][i][1];
    }
    return [maxX, maxY];
}

function findMin(geojson) {
    let minX = 0;
    let minY = 0;
    for(let i=0; i<geojson.geometry.coordinates[0].length; i++) {
        if(minX == 0 || geojson.geometry.coordinates[0][i][0] < minX)
            minX = geojson.geometry.coordinates[0][i][0];
        if(minY == 0 || geojson.geometry.coordinates[0][i][1] < minY)
            minY = geojson.geometry.coordinates[0][i][1];
    }
    return [minX, minY];
}

function scaleBy(geojson, factor) {
    for(let i=0; i<geojson.geometry.coordinates[0].length; i++) {
        geojson.geometry.coordinates[0][i][0] *= factor;
        geojson.geometry.coordinates[0][i][1] *= factor;
    }
    return geojson;
}

const container = { centroids: {} }

function init() {
    container.ticks = 0;
    let movData, usaData;
    Promise.all([getCountryGeojson('USA.ortho').then((data) => usaData = data),
                 getCountryGeojson('ATA.ortho').then((data) => movData = data)])
        .then(function() {
            container.lower48 = negateY(scaleBy(multiPologonToMaxPolygon(usaData.features[0]), 0.1));
            console.log("USA", container.lower48);
            container.mover1 = negateY(scaleBy(multiPologonToMaxPolygon(movData.features[0]), 0.1));
            console.log(container.mover1);

            container.intersection = intersect(container.lower48, container.mover1);
            drawCountry([container.intersection], 'INT', 'red');
            drawCountry([container.lower48], 'USA', 'orange');

            container.startTs =+ new Date();
    }).catch(function(err) {
        console.log('SOME SHIT WENT DOWN')
        console.log(err);
    });
}

function step() {
    container.ticks += 1;
    if(container.ticks > 500) endLoop();
    // rotate, dx, dy a country and compute the new cost function
    let rate = 1 + 100/(container.ticks+20),
        rotRate = 5 + 100/(container.ticks+20),
        gradient = { x:0, y:0, r:0 },
        currCost;
    try{
        currCost = cost(container.mover1, container.lower48);
    } catch(err) {
        console.error("could not compute cost ...");
        console.error(err);
        return;
    }
    // +x moves west
    translateX(container.mover1, rate);
    let intersectionXPlus = intersect(container.mover1, container.lower48);
    let costXPlus = cost(container.mover1, container.lower48, intersectionXPlus);
    translateX(container.mover1, -2*rate);
    let intersectionXMinus = intersect(container.mover1, container.lower48);
    let costXMinus = cost(container.mover1, container.lower48, intersectionXMinus);
    translateX(container.mover1, rate);

    if(costXPlus < currCost) {
        gradient.x = rate;
    }
    else if(costXMinus < currCost) {
        gradient.x = -rate;
    }

    // +y moves south
    translateY(container.mover1, rate);
    let intersectionYPlus = intersect(container.mover1, container.lower48);
    let costYPlus = cost(container.mover1, container.lower48, intersectionYPlus);
    translateY(container.mover1, -2*rate);
    let intersectionYMinus = intersect(container.mover1, container.lower48);
    let costYMinus = cost(container.mover1, container.lower48, intersectionYMinus);
    translateY(container.mover1, rate);

    if(costYPlus < currCost) {
           gradient.y = rate;
    }
    else if(costYMinus < currCost) {
            gradient.y = -rate;
    }

    turf.transformRotate(container.mover1, rotRate, {mutate: true});
    let intersectionRPlus = intersect(container.mover1, container.lower48);
    let costRPlus = cost(container.mover1, container.lower48, intersectionRPlus);
    turf.transformRotate(container.mover1, -2*rotRate, {mutate: true});
    let intersectionRMinus = intersect(container.mover1, container.lower48);
    let costRMinus = cost(container.mover1, container.lower48, intersectionRMinus);
    turf.transformRotate(container.mover1, rotRate, {mutate: true});

    if(costRPlus < currCost) {
        gradient.r = rotRate;
    }
    else if(costRMinus < currCost) {
        gradient.r = -rotRate;
    }

    if(container.ticks < 100) {
        gradient.x += (0.5-Math.random()) * (100 / container.ticks);
        gradient.y += (0.5-Math.random()) * (100 / container.ticks);
        gradient.r += (0.5-Math.random()) * (50 / container.ticks);
    }

    container.mover1 = translateX(container.mover1, gradient.x);
    container.mover1 = translateY(container.mover1, gradient.y);
    turf.transformRotate(container.mover1, gradient.r, {mutate: true});

    let newCost = cost(container.mover1, container.lower48);


    deleteCountry('MOV');
    drawCountry([container.mover1], 'MOV', 'green');
    deleteCountry('INT');
    let intersection = intersect(container.lower48, container.mover1);
    // let area = (turf.area(intersection)/1000000000).toFixed(2);
    // console.log(area, container.ticks);
    svg.select('#cost-text').text(`cost: ${(newCost/1000000000).toFixed(2)}`);
    drawCountry([intersection], 'INT', 'red');

    // if(gradient.x === 0 && gradient.y === 0 && gradient.r === 0) {
    //     endLoop();
    // }
}

function endLoop() {
    clearInterval(container.intervalId);
    console.log(container.ticks, 'ticks');
    let seconds = (+ new Date() - container.startTs)/1000;
    console.log(seconds.toFixed(2), 's')
    console.log(((seconds*1000)/container.ticks).toFixed(1), 'ms/tick');
}

container.country = 'RUS'
createGeoPath();
init()
drawCountries()
container.intervalId = setInterval(step, 100);

// setTimeout(step, 200);
