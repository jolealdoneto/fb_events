function buildMap(data) {
    var r = 184.65/2.0,                            //radius
        color = d3.scale.category20(),     //builtin range of colors
        relativePathPattern = / *m *[0-9.,]+ *(.*)/i;
 
    function stripOffAbsolutePlacing(path) {
        return relativePathPattern.exec(path.attr('d'))[1];
    }
    function getNormalizedPath(svg, path) {
        var relativePath = stripOffAbsolutePlacing(path),
            newPath = path.clone().attr('d', 'm 0,0 ' + relativePath);
        $(svg).append(newPath);
        var offset = newPath.offset(),
            svgOffset = svg.offset();
        newPath.remove();
        function sub(attr) { return (offset[attr] - svgOffset[attr])*-1; }

        return { left: sub('left'), top: sub('top') };
    }
    function getPathInRelationToPie(svg, path, r) {
        var relativePath = stripOffAbsolutePlacing(path),
            normPrefix = getNormalizedPath(svg, path),
            boundingRect = path[0].getBoundingClientRect();

        return 'm ' + (normPrefix.left - boundingRect.width/2.0) + ',' + (normPrefix.top - boundingRect.height/2.0) + ' ' + relativePath;
    }
    function translateToMiddle(path) {
        var offset = path.offset(),
            boundingRect = path[0].getBoundingClientRect();

        return (offset.left + (boundingRect.width/2.0)) + "," + (offset.top + boundingRect.height / 2.0);
    }
    
    function arc(path) {
        var br = path[0].getBoundingClientRect();

        return d3.svg.arc()
            .outerRadius(Math.sqrt(br.width*br.width + br.height*br.height) / 2);
    }
 
    var vis = d3.select("svg.main #piecharts").selectAll('g.pie')
        .data(data)
        .enter()
        .append("svg:g")
            .attr('class', function(d) {
                return 'pie pie' + d[0];
            })
            .attr("clip-path", function(d) {
                return "url(#clip"+d[0]+")";
            })
            .attr("transform", function(d) {
                return "translate("+translateToMiddle($("#"+d[0]))+")";
            });

    var pie = d3.layout.pie()           //this will create arc data for us given a list of values
        .value(function(d) { return d[1]; });    //we must tell it out to access the value of each element in our data array

    var clip = d3.select('svg.main').append("defs");

 
    var arcs = vis.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
        .data(function(d) {
            return pie(d[1]).map(function(p) {
                p.state = d[0];
                return p;
            });
        })                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
        .enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
            .append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
                .attr("class", "slice");    //allow us to style things in the slices (like text)
 
        arcs.append("svg:path")
        .attr("fill", function(d, i) { return color(d.data[0]); } ) //set the color for each slice to be chosen from the color function defined above
                .attr("d", function(d) {
                    return arc($("#"+d.state))(d);
                });                                    //this creates the actual SVG path using the associated data (pie) with the arc drawing function

    data.forEach(function(estado) {
        var e = estado[0];

        clip.append("svg:clipPath")
            .attr("class", e)
            .attr("id", "clip"+e);

        var statePath = $("#"+e+" path"),
            newStatePath = statePath.clone().attr('id', null).attr('d', getPathInRelationToPie($('svg.main'), statePath, r));

        $('#clip'+e).append(newStatePath);
    });
}
