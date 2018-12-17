import * as d3 from 'd3';
import * as turf from '@turf/turf'
const _ = require('lodash');

const width = window.innerWidth || document.body.clientWidth,
      height = window.innerHeight || document.body.clientHeight,
      maxTicks = 50,
      stepMs = 10,
      zoom = 100,
      scale = 0.01; // the amount to scale the original size of the countries

let svg = d3.select("body").append("svg")
    .attr('width', width)
    .attr('height', height);

svg.append('text')
    .attr('x', 100)
    .attr('y', 100)
    .style('font-size', 24)
    .attr('id', 'cost-text')
    .text('wat')


const allCodes = ['AFG', 'AGO', 'ALB', 'ARE', 'ARG', 'ARM', 'ATA', 'ATF', 'AUS', 'AUT', 'AZE', 'BDI', 'BEL', 'BEN', 'BFA', 'BGD', 'BGR', 'BHS', 'BIH', 'BLR', 'BLZ', 'BMU', 'BOL', 'BRA', 'BRN', 'BTN', 'BWA', 'CAF', 'CAN', 'CHE', 'CHL', 'CHN', 'CIV', 'CMR', 'COD', 'COG', 'COL', 'CRI', 'CS-KM', 'CUB', 'CYP', 'CZE', 'DEU', 'DJI', 'DNK', 'DOM', 'DZA', 'ECU', 'EGY', 'ERI', 'ESH', 'ESP', 'EST', 'ETH', 'FIN', 'FJI', 'FLK', 'FRA', 'GAB', 'GBR', 'GEO',  'GHA', 'GIN', 'GMB', 'GNB', 'GNQ', 'GRC', 'GRL', 'GTM', 'GUF', 'GUY', 'HND', 'HRV', 'HTI', 'HUN', 'IDN', 'IND', 'IRL', 'IRN', 'IRQ', 'ISL', 'ISR', 'ITA', 'JAM', 'JOR', 'JPN', 'KAZ', 'KEN', 'KGZ', 'KHM', 'KOR', 'KWT', 'LAO', 'LBN', 'LBR', 'LBY', 'LKA', 'LSO', 'LTU', 'LUX', 'LVA', 'MAR', 'MDA', 'MDG', 'MEX', 'MKD', 'MLI', 'MLT', 'MMR', 'MNE', 'MNG', 'MOZ', 'MRT', 'MWI', 'MYS', 'NAM', 'NCL', 'NER', 'NGA', 'NIC', 'NLD', 'NOR', 'NPL', 'NZL', 'OMN', 'PAK', 'PAN', 'PER', 'PHL', 'PNG', 'POL', 'PRI', 'PRK', 'PRT', 'PRY', 'PSE', 'QAT', 'ROU', 'RUS', 'RWA', 'SAU', 'SDN', 'SEN', 'SLB', 'SLE', 'SLV', 'SOM', 'SRB', 'SSD', 'SUR', 'SVK', 'SVN', 'SWE', 'SWZ', 'SYR', 'TCD', 'TGO', 'THA', 'TJK', 'TKM', 'TLS', 'TTO', 'TUN', 'TUR', 'TWN', 'TZA', 'UGA', 'UKR', 'URY', 'USA', 'USA', 'UZB', 'VEN', 'VNM', 'VUT', 'YEM', 'ZAF', 'ZMB', 'ZWE']
const selectedCodes = ['AFG', 'AGO', 'ALB', 'ARE', 'AUS', 'BEL', 'AUT', 'BGR', 'BHS', 'BIH', 'BLZ', 'BOL',
'BRA', 'BRN', 'BWA', 'CAF', 'CHE', 'CHL', 'CHN', 'CIV', 'COD', 'COL', 'CRI', 'CS-KM', 'CUB',
'CYP', 'CZE', 'DEU', 'DOM', 'DZA', 'ECU', 'ESH', 'FJI', 'FLK', 'GEO', 'GIN', 'GTM', 'GUF', 'JAM', 'NIC', 'PER', 'VEN', 'GUY', 'USA', 'CAN', 'MEX', 'RUS', 'EGY', 'JPN', 'ATA'];

function createGeoPath() {
    state.projection = d3.geoMercator()
        .scale(zoom/scale)
        .rotate([-550*scale, 250*scale, 0])
        .translate([width/2, height/2]);
    state.geoPath = d3.geoPath()
        .projection(state.projection);
}

function getCountryGeojson(code) {
    let fname = `world.geo.json/countries/${code}.geo.json`
    return d3.json(fname).then(function(data) {
        state.centroids[code] = turf.centroid(data.features[0]).geometry.coordinates;
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
        .attr('d', state.geoPath)
        .attr('stroke', 'black')
        .attr('fill', color)
        .attr('opacity', opacity);
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
    country.attr('d', state.geoPath);
}

function deleteCountry(code) {
    svg.select(`#${code}`).remove();
}

function multiPologonToMaxPolygon(multipoly) {
    // take the largest polygon in a multipologon and return just that as a geojson object
    // this is necessary because turf.js doesn't compute intersections on multipologons
    console.log(multipoly);
    let coordinates = _.maxBy(multipoly.geometry.coordinates, l => l[0].length);
    if(coordinates.length !== 1) coordinates = [coordinates]; // 🙄
    return {
      "type": "Feature",
      "id" : multipoly.id,
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
    // console.log('intersect', poly1.id, poly2.id, state.ticks);
    let intersection = turf.intersect(poly1, poly2) || emptyGeom();
    return intersection;
}

// to save tons of redundant intersection area calculations, create
// a lookup table of them once they're computed once, and only recalculate them
// when the given mover moves
let intersectionAreaDict = {};
function intersectionArea(poly1, poly2, movedId) {
    let sortedNames = _.sortBy([poly1.id, poly2.id]);
    let lookupString = `${sortedNames}:${state.ticks}`;
    let prevLookupString = `${sortedNames}:${state.ticks-1}`;

    // stochastic gradient descent: don't always do expensive computation
    // if there are lots of countries
    // if(intersectionAreaDict[prevLookupString] &&
    //     poly1.id !== state.container.id &&
    //     poly2.id !== state.container.id &&
    //     Math.random() < Math.min(state.packingCountries.length/20, .95))
    // {
    //     intersectionAreaDict[lookupString] = intersectionAreaDict[prevLookupString];
    //     return intersectionAreaDict[lookupString];
    // }

    // if we're getting the intersection involving a country that was just
    // moved we need to do the expensive computation
    if(movedId && (movedId === poly1.id || movedId == poly2.id)) {
        return turf.area(intersect(poly1, poly2));
    }

    if(intersectionAreaDict[lookupString] !== undefined) {
        // console.log(`FOUND "${lookupString}"`);
        return intersectionAreaDict[lookupString];
    }

    // before doing the expensive calculation, let's check if they were overlapping
    // last tick. if not let's only probabilistically do the expensive calculation
    if(intersectionAreaDict[prevLookupString] === 0 && Math.random() < 0.9) {
        intersectionAreaDict[lookupString] = 0;
        return intersectionAreaDict[lookupString];
    }
    intersectionAreaDict[lookupString] = turf.area(intersect(poly1, poly2));
    return intersectionAreaDict[lookupString];
}

function cost(moverPolys, staticPoly, movedId) {
    // don't count the mover's area, or it will be inclined to run for a pole
    let totalCost = 0;
    _.each(moverPolys, (moverPoly,i) => {
        let intArea = intersectionArea(moverPoly, staticPoly, movedId);
        if(intArea === 0) {
            let dist = distCentroids(moverPoly, staticPoly);
            totalCost += dist**2 + state.containerArea - intArea;
        } else {
            totalCost += state.containerArea - intArea;
        }
        _.each(moverPolys, (otherMoverPoly,j) => {
            if(i !== j) {
                intArea = intersectionArea(moverPoly, otherMoverPoly, movedId);
                totalCost += (intArea/state.packingCountries.length);
            }
        });
    });
    return totalCost;
}

function distCentroids(poly1, poly2) {
    let centroid1 = turf.centroid(poly1),
        centroid2 = turf.centroid(poly2);
    return turf.distance(centroid1, centroid2);
}

function drawCountries() {
    let lat = 45.5, lng = -120, scale = 500;

    allCodes.forEach(code => {
        getCountryGeojson(code).then(data => {
            drawCountry(data.features, code, '#aaa', 0.1);
        })
    });
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


function computeGradient(mover, precomps) {
    // +- rotate, dx, dy a country and compute the new cost function
    // use this to determine which direction the country should move to lower
    // the cost
    let gradient = { x:0, y:0, r:0 },
        currCost;
    try{
        currCost = cost(state.movers, state.container);
        // console.log('currCost', currCost);
    } catch(err) {
        console.error("could not compute cost ...");
        console.error(err);
        return gradient;
    }
    // +x moves west
    translateX(mover, precomps.rate);
    // let intersectionXPlus = intersect(state.movers, state.container);
    let costXPlus = cost(state.movers, state.container, mover.id);
    translateX(mover, -2*precomps.rate);
    // let intersectionXMinus = intersect(mover, state.container);
    let costXMinus = cost(state.movers, state.container, mover.id);
    translateX(mover, precomps.rate);

    if(costXPlus < currCost) {
        gradient.x = precomps.rate;
    }
    else if(costXMinus < currCost) {
        gradient.x = -precomps.rate;
    }

    // +y moves south
    translateY(mover, precomps.rate);
    // let intersectionYPlus = intersect(state.movers, state.container);
    let costYPlus = cost(state.movers, state.container, mover.id);
    translateY(mover, -2*precomps.rate);
    // let intersectionYMinus = intersect(mover, state.container);
    let costYMinus = cost(state.movers, state.container, mover.id);
    translateY(mover, precomps.rate);

    if(costYPlus < currCost) {
       gradient.y = precomps.rate;
    }
    else if(costYMinus < currCost) {
        gradient.y = -precomps.rate;
    }

    turf.transformRotate(mover, precomps.rotRate, {mutate: true});
    // let intersectionRPlus = intersect(mover, state.container);
    let costRPlus = cost(state.movers, state.container, mover.id);
    turf.transformRotate(mover, -2*precomps.rotRate, {mutate: true});
    // let intersectionRMinus = intersect(mover, state.container);
    let costRMinus = cost(state.movers, state.container, mover.id);
    turf.transformRotate(mover, precomps.rotRate, {mutate: true});

    if(costRPlus < currCost) {
        gradient.r = precomps.rotRate;
    }
    else if(costRMinus < currCost) {
        gradient.r = -precomps.rotRate;
    }
    // if(state.ticks < 100) {
        gradient.x += (0.5-Math.random()) * (precomps.perterbation / precomps.ticksSquared);
        gradient.y += (0.5-Math.random()) * (precomps.perterbation / precomps.ticksSquared);
        gradient.r += (0.5-Math.random()) * (precomps.perterbation*0.5 / precomps.ticksSquared);
    // }
    return gradient;
}

const state = { centroids: {}, ticks: 0, movers: [], lower48: null }

function init() {
    state.ticks = 0;
    let movData = [], containerData;
    let allPromises = _.map(state.packingCountries, code => {
        return getCountryGeojson(`${code}.ortho`).then((data) => movData.push(data));
    });
    allPromises.push(getCountryGeojson(`${state.containerCode}.ortho`).then((data) => containerData = data));
    Promise.all(allPromises)
        .then(function() {
            state.container = negateY(scaleBy(multiPologonToMaxPolygon(containerData.features[0]), 0.01));
            state.containerArea = turf.area(state.container);

            state.movers = _.map(movData, data => {
                return turf.simplify(
                        negateY(scaleBy(
                            multiPologonToMaxPolygon(data.features[0]), 0.01)
                        ), {tolerance:0.01});
            });
            _.each(state.movers, (data,i) => {
                let dist = distCentroids(data, state.container);
                let bearing = turf.rhumbBearing(turf.centroid(data), turf.centroid(state.container));
                console.log(`"${i}": [${turf.centroid(data).geometry.coordinates}]`);
                turf.transformTranslate(data, dist/2, bearing, {mutate:true});
                // console.log(`"${i}": [${turf.centroid(data).geometry.coordinates}]`);
                drawCountry([state.movers[i]], `MOV${i}`, 'red');
            });

            drawCountry([state.container], state.containerCode, 'gray');

            state.startTs =+ new Date();
            state.intervalId = setInterval(step, stepMs);
            // setTimeout(step, 2000);
    }).catch(function(err) {
        console.log('SOME SHIT WENT DOWN')
        console.log(err);
    });
}

function step() {
    const colors = ['green', 'blue', 'purple', 'brown'];
    state.ticks += 1;
    let restartCycle = 100; // if we want to jump up the learning rate (SGD w/ restarts)
    let precomps = {
            ticksSquared: (state.ticks % restartCycle)**2 + 1,
            perterbation: 1,
            rotRate: 1 + 100/(state.ticks+20),
    }
    precomps.rate = scale/4 + scale*(1000/(precomps.ticksSquared+1));
    console.log(state.ticks, 'rate', precomps.rate);

    let gradients = _.map(state.movers, mov => computeGradient(mov, precomps));

    let somethingMoved = false,
        totalCost = 0;
    _.each(gradients, (gradient, i) => {
        state.movers[i] = translateX(state.movers[i], gradient.x);
        state.movers[i] = translateY(state.movers[i], gradient.y);
        turf.transformRotate(state.movers[i], gradient.r, {mutate: true});
        // console.log(state.movers[i].id, turf.centroid(state.movers[i]).geometry.coordinates);

        deleteCountry(`MOV${i}`);
        drawCountry([state.movers[i]], `MOV${i}`, colors[i%colors.length]);
        if(gradient.x !== 0 || gradient.y !== 0 || gradient.r !== 0) {
            somethingMoved = true;
        }
    });
    totalCost = cost(state.movers, state.container);
    svg.select('#cost-text').text(`cost: ${(totalCost/1000000000).toFixed(2)}`);
    if(!somethingMoved) {
        console.log("all gradients zero");
        endLoop();
    }
    if(state.ticks > maxTicks) {
        console.log("simulation timed out");
        endLoop();
    }
}

function endLoop() {
    clearInterval(state.intervalId);
    console.log(state.ticks, 'ticks');
    let seconds = (+ new Date() - state.startTs)/1000;
    console.log(seconds.toFixed(2), 's')
    console.log(((seconds*1000)/state.ticks).toFixed(1), 'ms/tick');
}

state.containerCode = 'USA'
state.packingCountries = ['MEX', 'IND', 'JPN']
// state.packingCountries = ['AFG', 'AGO', 'ALB', 'ARE', 'ARG', 'ARM', 'ATA', 'ATF', 'AUS', 'AUT', 'AZE', 'BDI', 'BEL', 'BEN', 'BFA', 'BGD', 'BGR', 'BHS', 'BIH'];
// state.packingCountries = ['AFG', 'AGO', 'ALB', 'ARE', 'ARG', 'ARM', 'ATA', 'ATF', 'AUS', 'AUT', 'AZE', 'BDI', 'BEL', 'BEN', 'BFA', 'BGD', 'BGR', 'BHS', 'BIH', 'BLR', 'BLZ', 'BMU', 'BOL', 'BRA', 'BRN', 'BTN', 'BWA', 'CAF', 'CAN', 'CHE', 'CHL', 'CHN', 'CIV', 'CMR', 'COD', 'COG', 'COL', 'CRI', 'CS-KM', 'CUB', 'CYP', 'CZE', 'DEU', 'DJI', 'DNK', 'DOM', 'DZA', 'ECU', 'EGY', 'ERI', 'ESH', 'ESP', 'EST', 'ETH', 'FIN', 'FJI', 'FLK', 'FRA', 'GAB', 'GBR', 'GEO',  'GHA', 'GIN', 'GMB', 'GNB', 'GNQ', 'GRC', 'GRL', 'GTM', 'GUF', 'GUY', 'HND', 'HRV', 'HTI', 'HUN', 'IDN', 'IND', 'IRL', 'IRN', 'IRQ', 'ISL', 'ISR', 'ITA', 'JAM', 'JOR', 'JPN', 'KAZ', 'KEN', 'KGZ', 'KHM', 'KOR', 'KWT', 'LAO', 'LBN', 'LBR', 'LBY', 'LKA', 'LSO', 'LTU', 'LUX', 'LVA', 'MAR', 'MDA', 'MDG', 'MEX', 'MKD', 'MLI', 'MLT', 'MMR', 'MNE', 'MNG', 'MOZ', 'MRT', 'MWI', 'MYS', 'NAM', 'NCL', 'NER', 'NGA', 'NIC', 'NLD', 'NOR', 'NPL', 'NZL', 'OMN', 'PAK', 'PAN', 'PER', 'PHL', 'PNG', 'POL', 'PRI', 'PRK', 'PRT', 'PRY', 'PSE', 'QAT', 'ROU', 'RWA', 'SAU', 'SDN', 'SEN', 'SLB', 'SLE', 'SLV', 'SOM', 'SRB', 'SSD', 'SUR', 'SVK', 'SVN', 'SWE', 'SWZ', 'SYR', 'TCD', 'TGO', 'THA', 'TJK', 'TKM', 'TLS', 'TTO', 'TUN', 'TUR', 'TWN', 'TZA', 'UGA', 'UKR', 'URY', 'USA', 'USA', 'UZB', 'VEN', 'VNM', 'VUT', 'YEM', 'ZAF', 'ZMB', 'ZWE']
createGeoPath();
init();
drawCountries();
