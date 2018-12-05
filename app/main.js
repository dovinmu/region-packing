import * as d3 from 'd3';
import * as turf from '@turf/turf'
const _ = require('lodash');

const width = window.innerWidth || document.body.clientWidth,
      height = window.innerHeight || document.body.clientHeight,
      lat = 43, lng = 100, scale = 250;

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
    container.projection = d3.geoOrthographic()
        .scale(scale)
        .rotate([-lng, -lat, 0])
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
    });
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

        drawCountry(data.features, code, color, geoPath);
    }).catch(function(err){
        console.log(err);
    });
}

function drawCountry(features, code, color, geoPath, opacity) {
    if(!opacity) opacity = 0.75;
    svg.selectAll('g')
        .data(features)
        .enter()
        .append('path')
        .attr('id', code)
        .attr('d', geoPath)
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
    return turf.intersect(poly1, poly2) || emptyGeom();
}

function cost(poly1, poly2, intersection) {
    if(!intersection)
        intersection = intersect(poly1, poly2);
    let intersectionArea = turf.area(intersection);
    // if(intersectionArea === 0)
        // return distCentroids(poly1, poly2) +  turf.area(poly1) + turf.area(poly2) - intersectionArea;
    return turf.area(poly1) + turf.area(poly2) - intersectionArea;
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
    // if(intersectionArea === 0)
        return  100 - (turf.area(intersection) / (turf.area(poly1) + turf.area(poly2))) + distCentroids(poly1, poly2) / 10000;
    // return 100 - (turf.area(intersection) / (turf.area(poly1) + turf.area(poly2)));
}

const allCodes = ['AFG', 'AGO', 'ALB', 'ARE', 'ARG', 'ARM', 'ATA', 'ATF', 'AUS', 'AUT', 'AZE', 'BDI', 'BEL', 'BEN', 'BFA', 'BGD', 'BGR', 'BHS', 'BIH', 'BLR', 'BLZ', 'BMU', 'BOL', 'BRA', 'BRN', 'BTN', 'BWA', 'CAF', 'CAN', 'CHE', 'CHL', 'CHN', 'CIV', 'CMR', 'COD', 'COG', 'COL', 'CRI', 'CS-KM', 'CUB', 'CYP', 'CZE', 'DEU', 'DJI', 'DNK', 'DOM', 'DZA', 'ECU', 'EGY', 'ERI', 'ESH', 'ESP', 'EST', 'ETH', 'FIN', 'FJI', 'FLK', 'FRA', 'GAB', 'GBR', 'GEO', 'get all names', 'GHA', 'GIN', 'GMB', 'GNB', 'GNQ', 'GRC', 'GRL', 'GTM', 'GUF', 'GUY', 'HND', 'HRV', 'HTI', 'HUN', 'IDN', 'IND', 'IRL', 'IRN', 'IRQ', 'ISL', 'ISR', 'ITA', 'JAM', 'JOR', 'JPN', 'KAZ', 'KEN', 'KGZ', 'KHM', 'KOR', 'KWT', 'LAO', 'LBN', 'LBR', 'LBY', 'LKA', 'LSO', 'LTU', 'LUX', 'LVA', 'MAR', 'MDA', 'MDG', 'MEX', 'MKD', 'MLI', 'MLT', 'MMR', 'MNE', 'MNG', 'MOZ', 'MRT', 'MWI', 'MYS', 'NAM', 'NCL', 'NER', 'NGA', 'NIC', 'NLD', 'NOR', 'NPL', 'NZL', 'OMN', 'PAK', 'PAN', 'PER', 'PHL', 'PNG', 'POL', 'PRI', 'PRK', 'PRT', 'PRY', 'PSE', 'QAT', 'ROU', 'RUS', 'RWA', 'SAU', 'SDN', 'SEN', 'SLB', 'SLE', 'SLV', 'SOM', 'SRB', 'SSD', 'SUR', 'SVK', 'SVN', 'SWE', 'SWZ', 'SYR', 'TCD', 'TGO', 'THA', 'TJK', 'TKM', 'TLS', 'TTO', 'TUN', 'TUR', 'TWN', 'TZA', 'UGA', 'UKR', 'URY', 'USA', 'USA', 'UZB', 'VEN', 'VNM', 'VUT', 'YEM', 'ZAF', 'ZMB', 'ZWE']
const selectedCodes = ['AFG', 'AGO', 'ALB', 'ARE', 'AUS', 'BEL', 'AUT', 'BGR', 'BHS', 'BIH', 'BLZ', 'BOL',
'BRA', 'BRN', 'BWA', 'CAF', 'CHE', 'CHL', 'CHN', 'CIV', 'COD', 'COL', 'CRI', 'CS-KM', 'CUB',
'CYP', 'CZE', 'DEU', 'DOM', 'DZA', 'ECU', 'ESH', 'FJI', 'FLK', 'GEO', 'GIN', 'GTM', 'GUF', 'JAM', 'NIC', 'PER', 'VEN', 'GUY', 'USA', 'CAN', 'MEX', 'RUS', 'EGY', 'JPN', 'ATA'];
function drawCountries() {
    let lat = 45.5, lng = -120, scale = 500;

    allCodes.forEach(code => {
        getCountryGeojson(code).then(data => {
            drawCountry(data.features, code, '#aaa', container.geoPath, 0.1);
        })
    });
}

const container = { centroids: {} }

function init() {
    container.ticks = 0;
    createGeoPath();
    let movData, usaData;
    Promise.all([getCountryGeojson('USA').then((data) => usaData = data),
                 getCountryGeojson(container.country).then((data) => movData = data)])
        .then(function() {
            container.lower48 = multiPologonToMaxPolygon(usaData.features[0]);
            container.mover1 = multiPologonToMaxPolygon(movData.features[0]);
            // container.mover1 = turf.truncate(container.mover1);

            // container.intersection = intersect(container.mover1, container.lower48) || emptyGeom();
            // console.log('moving country', container.mover1.type, container.mover1.geometry.type, container.mover1);
            // console.log('static country', container.lower48);
            // console.log('intersection', container.intersection);
            // console.log('cost', cost(container.mover1, container.lower48));

            // move the country to a good starting point
            let bearing = turf.rhumbBearing(turf.centroid(container.mover1), turf.centroid(container.lower48));
            let dist = turf.distance(turf.centroid(container.mover1), turf.centroid(container.lower48));
            // if(dist > 5000) {
            //     dist = 5000;
            // }
            // console.log('bearing', bearing, 'dist', dist);
            // container.mover1 = turf.transformTranslate(container.mover1, 1, bearing, {zTranslation: 100});
            let projectedMover = d3.geoProject(container.mover1, container.projection)
            console.log('original', container.mover1);
            console.log('projection', projectedMover);

            drawCountry([container.mover1], 'MOV1', 'green', container.geoPath);
            drawCountry([container.lower48], 'USA', 'orange', container.geoPath);
            container.startTs =+ new Date();
    }).catch(function(err) {
        console.log('SOME SHIT WENT DOWN')
        console.log(err);
    });
}

function estimateGradient(parameters) {
    // for each parameter, check if making it larger or smaller changes cost for the better
}

function step() {
    container.ticks += 1;
    // rotate, dx, dy a country and compute the new cost function
    let rate = 100,
        gradient = { x:0, y:0, r:0 },
        currCost;
    try{
        currCost = cost(container.mover1, container.lower48);
    } catch(err) {
        console.error("Data not loaded");
        return;
    //     clearInterval(container.intervalId);
    }
    // +x moves west
    let xPlus = turf.transformTranslate(container.mover1, rate, 90, {mutate: false});
    let xMinus = turf.transformTranslate(container.mover1, -rate, 90, {mutate: false});
    let intersectionXPlus = intersect(xPlus, container.lower48),
        intersectionXMinus = intersect(xMinus, container.lower48);

    if(cost(xPlus, container.lower48, intersectionXPlus) < currCost) {
           gradient.x = rate;
    }
    else if(cost(xMinus, container.lower48, intersectionXMinus) < currCost) {
            gradient.x = -rate;
    }

    // +y moves south
    let yPlus = turf.transformTranslate(container.mover1, rate, 180, {mutate: false});
    let yMinus = turf.transformTranslate(container.mover1, rate, 0, {mutate: false});
    let intersectionYPlus = intersect(yPlus, container.lower48),
        intersectionYMinus = intersect(yMinus, container.lower48);

    if(cost(yPlus, container.lower48, intersectionYPlus) < currCost) {
           gradient.y = rate;
    }
    else if(cost(yMinus, container.lower48, intersectionYMinus) < currCost) {
            gradient.y = -rate;
    }

    let rPlus = turf.transformRotate(container.mover1, rate/10);
    let rMinus = turf.transformRotate(container.mover1, -rate/10);
    let intersectionRPlus = intersect(rPlus, container.lower48),
        intersectionRMinus = intersect(rMinus, container.lower48);

    if(cost(rPlus, container.lower48, intersectionRPlus) < currCost) {
           gradient.r = rate/10;
    }
    else if(cost(rMinus, container.lower48, intersectionRMinus) < currCost) {
            gradient.r = -rate/10;
    }

    gradient.x = 0;
    gradient.y = 3000;
    gradient.r = 0;
    // turf.js' documentation is a BED OF LIES and negative numbers mess things up
    if(gradient.x < 0) container.mover1 = turf.transformTranslate(container.mover1, -gradient.x, 270);
    else               container.mover1 = turf.transformTranslate(container.mover1, gradient.x, 90);
    if(gradient.y < 0) container.mover1 = turf.transformTranslate(container.mover1, -gradient.y, 0);
    else               container.mover1 = turf.transformTranslate(container.mover1, gradient.y, 180);
    container.mover1 = turf.transformRotate(container.mover1, gradient.r);

    console.log(gradient, normedCost(container.mover1, container.lower48).toFixed(3), turf.area(container.mover1).toFixed());
    svg.select('#cost-text').text(`cost: ${(normedCost(container.mover1, container.lower48)).toFixed(2)}`);

    deleteCountry('MOV1');
    drawCountry([container.mover1], 'MOV1', 'green', container.geoPath);
    deleteCountry('intersection');
    drawCountry([container.intersection], 'intersection', 'red', container.geoPath);

    if(gradient.x === 0 && gradient.y === 0 && gradient.r === 0) {
        clearInterval(container.intervalId);
        console.log(container.ticks, 'ticks');
        let seconds = (+ new Date() - container.startTs)/1000;
        console.log(seconds.toFixed(2), 's')
        console.log(((seconds*1000)/container.ticks).toFixed(1), 'ms/tick');
    }
}

container.country = 'RUS'
init()
drawCountries()
// container.intervalId = setInterval(step, 1000);

setTimeout(step, 2000);
