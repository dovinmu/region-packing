import * as d3 from 'd3';
import * as turf from '@turf/turf'
const _ = require('lodash');
import {
    computeGradient,
    distCentroids,
    cost,
    intersectionArea,
    translateX,
    translateY
} from './simulation.js'
const width = window.innerWidth || document.body.clientWidth,
      height = window.innerHeight || document.body.clientHeight,
      maxTicks = 200,
      stepMs = 10,
      zoom = 150,
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
const problemCodes = ["ESH"]

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
        .attr('class', 'country')
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

function deleteCountries() {
    svg.selectAll('.country').remove();
}

function multiPolygonToMaxPolygon(multipoly) {
    // take the largest polygon in a multipologon and return just that as a geojson object
    // this is necessary because turf.js doesn't compute intersections on multipologons
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

function negateY(geojson) {
    for(let i=0; i<geojson.geometry.coordinates[0].length; i++) {
        geojson.geometry.coordinates[0][i][1] *= -1;
    }
    return geojson;
}

function scaleBy(geojson, factor) {
    for(let i=0; i<geojson.geometry.coordinates[0].length; i++) {
        geojson.geometry.coordinates[0][i][0] *= factor;
        geojson.geometry.coordinates[0][i][1] *= factor;
    }
    return geojson;
}

function drawCountries() {
    let lat = 45.5, lng = -120, scale = 500;

    allCodes.forEach(code => {
        getCountryGeojson(code).then(data => {
            drawCountry(data.features, code, '#aaa', 0.1);
        })
    });
}

const state = { centroids: {}, ticks: 0, movers: [], lower48: null }

function initMap() {
    state.ticks = 0;
    let movData = [], containerData;
    let allPromises = _.map(state.packingCountries, code => {
        return getCountryGeojson(`${code}.ortho`).then((data) => movData.push(data));
    });
    allPromises.push(getCountryGeojson(`${state.containerCode}.ortho`)
        .then((data) => containerData = data)
    );
    allPromises.push(d3.json('countries_by_mledoze.json')
        .then(data => {
            console.log(data);
            state.area = {};
            state.area_sorted = [];
            _.each(data, datum => {
                state.area[datum.cca3] = datum.area;
                state.area_sorted.push({ 'code': datum.cca3, 'area': datum.area });
            });
            state.area_sorted = _.sortBy(state.area_sorted, 'area');
            console.log('sorted area', state.area_sorted);
    }));
    Promise.all(allPromises)
        .then(function() {
            let clonedContainer = _.cloneDeep(containerData);
            state.container = turf.simplify( negateY(scaleBy(multiPolygonToMaxPolygon(clonedContainer.features[0]), 0.01)), {tolerance:0.05});
            state.containerDraw = negateY(scaleBy(multiPolygonToMaxPolygon(containerData.features[0]), 0.01));
            state.containerArea = turf.area(state.container);

            state.movers = _.map(movData, data => {
                data = _.cloneDeep(data);
                return turf.simplify(
                        negateY(scaleBy(
                            multiPolygonToMaxPolygon(data.features[0]), 0.01)
                        ), {tolerance:0.05});
            });
            state.drawers = _.map(movData, data => {
                return negateY(scaleBy(
                        multiPolygonToMaxPolygon(data.features[0]), 0.01)
                );
            })
            _.each(state.movers, (data,i) => {
                let dist = distCentroids(data, state.container);
                let bearing = turf.rhumbBearing(turf.centroid(data), turf.centroid(state.container));
                turf.transformTranslate(data, dist/2, bearing, {mutate:true});
                turf.transformTranslate(state.drawers[i], dist/2, bearing, {mutate:true});
                // console.log(`"${i}": [${turf.centroid(data).geometry.coordinates}]`);
                drawCountry([state.movers[i]], `MOV${i}`, 'red');
                drawCountry([state.drawers[i]], `DRAW${i}`, 'green');
            });

            // drawCountry([state.container], state.containerCode, 'gray');
            drawCountry([state.containerDraw], state.containerCode, 'gray');

            state.startTs =+ new Date();
            state.intervalId = setInterval(step, stepMs);
            // setTimeout(step, 2000);
    }).catch(function(err) {
        console.log('SOME SHIT WENT DOWN')
        console.log(err);
    });
}

function initMenu() {
    d3.select('#country-selector').append(function() {
        console.log("creating new option");
        return document.createElement('p');
    });
    d3.select('#country-selector').on('change', (e) => {
        let selector = document.getElementById('country-selector');
        console.log('selected country', selector.value);
        deleteCountries();
        endLoop();
        state.containerCode = selector.value;
        decidePackingCountries();
        initMap();
    });
}

function decidePackingCountries() {
    // choose recognizable countries that will all basically fit inside of the chosen country
    console.log('packing', state.containerCode);
    let totalMoverArea = 0;
    state.packingCountries = [];
    _.each(_.shuffle(selectedCodes), country => {
        if(state.packingCountries.length < 8 && state.area[country] + totalMoverArea < state.area[state.containerCode] && problemCodes.indexOf(country) == -1) {
            totalMoverArea += state.area[country];
            state.packingCountries.push(country);
        }
        console.log((100*totalMoverArea/state.area[state.containerCode]).toFixed(2), '%');
    })
    console.log('selected these countries:', state.packingCountries);
}

function step() {
    const colors = ['green', 'blue', 'purple', 'brown'];
    state.ticks += 1;
    if(state.ticks > maxTicks) {
        console.log("simulation timed out");
        endLoop();
    }

    let resetRate = 10;
    let precomps = {
            ticksSquared: (state.ticks < 50 ? state.ticks % resetRate : state.ticks)**2 + 1,
            perterbation: 1,
    }
    precomps.rotRate = 100/(state.ticks+5);
    precomps.rate = scale*(1000/(precomps.ticksSquared+5));
    console.log(state.ticks, 'rate', precomps.rate.toFixed(4), 'rotRate', precomps.rotRate.toFixed(1));
    // console.log('tock');

    let gradients = _.map(state.movers, mov => computeGradient(mov, precomps, state));

    let somethingMoved = false,
        totalCost = 0;
    _.each(gradients, (gradient, i) => {
        state.movers[i] = translateX(state.movers[i], gradient.x);
        state.movers[i] = translateY(state.movers[i], gradient.y);
        turf.transformRotate(state.movers[i], gradient.r, {mutate: true});

        state.drawers[i] = translateX(state.drawers[i], gradient.x);
        state.drawers[i] = translateY(state.drawers[i], gradient.y);
        turf.transformRotate(state.drawers[i], gradient.r, {mutate: true});

        let shadowDistance = distCentroids(state.movers[i], state.drawers[i]);
        console.log(colors[i%colors.length], 'distance', shadowDistance.toFixed(1))

        deleteCountry(`MOV${i}`);
        deleteCountry(`DRAW${i}`);
        drawCountry([state.movers[i]], `MOV${i}`, colors[i%colors.length]);
        drawCountry([state.drawers[i]], `DRAW${i}`, colors[i%colors.length]);
        if(gradient.x !== 0 || gradient.y !== 0 || gradient.r !== 0) {
            somethingMoved = true;
        }
    });
    totalCost = cost(state.movers, state.container, null, state);
    svg.select('#cost-text').text(`cost: ${(totalCost/1000000000).toFixed(2)}`);
    if(!somethingMoved) {
        console.log("all gradients zero");
        endLoop();
    }
}

function endLoop() {
    clearInterval(state.intervalId);
    console.log(state.ticks, 'ticks');
    let seconds = (+ new Date() - state.startTs)/1000;
    console.log(seconds.toFixed(2), 's')
    let msPerTick = ((seconds*1000)/state.ticks);
    console.log(msPerTick.toFixed(1), 'ms/tick');
    console.log((1000/msPerTick).toFixed(1), 'fps');
}

state.containerCode = 'USA';
state.packingCountries = ['MEX', 'IND', 'JPN', 'AFG'];

// problem countries: "ESH"
createGeoPath();
initMap();
initMenu();
// drawCountries();
