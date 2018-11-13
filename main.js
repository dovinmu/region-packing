
let svg = d3.select("body").append("svg");

var width = 700,
    height = 580;

var albersProjection = d3.geoAlbers()
        .scale(100)
        .rotate([0, 0, -30])
        // .center([0, -38.4161])
        .translate([width/2, height/2]);

var geoPath = d3.geoPath()
    .projection(albersProjection);



d3.json('world.geo.json/countries/USA.geo.json').then(function(data) {
  svg.selectAll('.country')
      .data(data.features)
      .enter()
      .append('path')
      .attr('d', geoPath)
      .attr('fill', 'purple');

});
let canada;
d3.json('world.geo.json/countries/CAN.geo.json').then(function(data) {
  canada = svg.selectAll('.country')
      .data(data.features)
      .enter()
      .append('path')
      .attr('d', geoPath)
      .attr('fill', 'red')
});

d3.json('world.geo.json/countries/ARG.geo.json').then(function(data) {
  svg.selectAll('.country')
      .data(data.features)
      .enter()
      .append('path')
      .attr('d', geoPath)
      .attr('fill', 'green');

});

d3.json('world.geo.json/countries/BRA.geo.json').then(function(data) {
  svg.selectAll('.country')
      .data(data.features)
      .enter()
      .append('path')
      .attr('d', geoPath)
      .attr('fill', 'green');

});

setTimeout(function(){
  console.log('KK');
  albersProjection.scale(200);
  geoPath = d3.geoPath()
      .projection(albersProjection);
  // canada.attr('d', geoPath);
}, 2000)
