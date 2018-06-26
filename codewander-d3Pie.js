define( ["qlik", "text!./codewander-d3Pie.ng.html", "css!./codewander-d3Pie.css","./lib/js/d3.v3.min"],
	function ( qlik, template,style,d3) {
		"use strict";
		return {
			template: template,
			initialProperties: {
				qHyperCubeDef: {
					qDimensions: [],
					qMeasures: [],
					qInitialDataFetch: [{
						qWidth: 2,
						qHeight: 50
					}]
				}
			},
			definition: {
				type: "items",
				component: "accordion",
				items: {
					dimensions: {
						uses: "dimensions",
						min: 1,
						max: 1
					},
					measures: {
						uses: "measures",
						min: 1,
						max: 1
					},
					settings: {
						uses: "settings",
						items:{

							Metric:{
								type:"string",
								label:"Metric",
								ref: "metric",
								expression:"always",
								defaultValue:""
							},
							MyList: {
							type: "array",
                            ref: "metricList",
                            label: "List Items",
                            itemTitleRef: "metric",
                            allowAdd: true,
                            allowRemove: true,
                            addTranslation: "Add Item",
                            items: {
                                
								metric: {
									type: "string",
									ref: "metricDef",
									label: "Metric Definition",
									expression: "always"
								},
								metricColor: {
									type: "string",
									ref: "metricColor",
									label: "Metric Color",
									expression: "always"
								},
								metrictitle: {
									type: "string",
									ref: "metricTitle",
									label: "Metric Definition",
									expression: "never"
								},
								metrictitleColor: {
									type: "string",
									ref: "metricTitleColor",
									label: "Metric Color",
									expression: "never"
								}
                            }
						}
							
							
						}
					}
					
					,
					sorting: {
						uses: "sorting"
					}
				}
			},
			support: {
				snapshot: true,
				export: true,
				exportData: true
			},
			paint: function () {
				
				var d=this.$scope.layout.qHyperCube.qDataPages[0].qMatrix;
				var dim_title=this.$scope.layout.qHyperCube.qDimensionInfo[0].title; 
				var measure_title= this.$scope.layout.qHyperCube.qMeasureInfo[0].title
				var pieArray=[];
				for (var i=0; i<d.length;i++)
				{
					pieArray.push({label:d[i][0].qText, value:  d[i][1].qNum, displayValue:d[i][1].qText} );
				}
				var metricList= this.$scope.layout.metricList;
				
				
				var objid= this.$scope.layout.qInfo.qId + "pieChart";
				
				//$(this.$element).append(div) .attr("id", objid);
				
				$("#"+objid).empty();
				
				var svg = d3.select("#"+objid)
	.append("svg")
	.append("g")

svg.append("g")
	.attr("class", "slices");
svg.append("g")
	.attr("class", "labelName");
svg.append("g")
	.attr("class", "labelValue");
svg.append("g")
	.attr("class", "lines");

var width = $(this.$element).width(),
    height = $(this.$element).height(),
    radius = Math.min(width, height) / 3;

var pie = d3.layout.pie()
	.sort(null)
	.value(function(d) {
    console.log(d);
		return d.value;
	});

var arc = d3.svg.arc()
	.outerRadius(radius * 0.9)
	.innerRadius(radius * 0.7);

var outerArc = d3.svg.arc()
	.innerRadius(radius * 0.9)
	.outerRadius(radius * 0.9);

var legendRectSize = radius * .1;
var legendSpacing = radius * 0.02;

var div = d3.select("#"+objid).append("div").attr("class", "toolTip");

svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var colorRange = d3.scale.category20();
var color = d3.scale.ordinal()
	.range(colorRange.range());


var datasetTotal = [
		{label:"Category 1 Pipeline", value:.5}, 
        {label:"Category 2 Pipeline", value:99.5} 
        
        ];

var datasetOption1 = [
		{label:"Category 1", value:22}, 
        {label:"Category 2", value:33}
        ];

var datasetOption2 = [
		{label:"Category 1", value:10}, 
        {label:"Category 2", value:20}
        ];

change(pieArray);


d3.selectAll("input")
	.on("change", selectDataset);
	
function selectDataset()
{
	
	change(pieArray);
	
}

function change(data) {
	
	/*var mlist=svg.append("text")
	.data(metricList)		
	.attr("x", 0)
    .attr("y", (-1*height/2)+10)
    .attr("dy", ".35em")
    .text(function(d) { return d; });*/
	var metrics = svg.selectAll('.metric')
        .data(metricList)
        .enter()
        .append('g')
        .attr('class', 'metric')
        .attr("x", 0)
		.attr("y", (-1*height/2)+10)
		.attr("height", 50)
		.attr("width",50);
		
	metrics.append('text')
        .attr('x', 0)
        .attr('y', (-1*height/2)+10)        
		.text(function(d) { return d.metricColor; });

		
    ;

	/* ------- PIE SLICES -------*/
	var slice = svg.select(".slices").selectAll("path.slice")
        .data(pie(data), function(d){ return d.data.label });

    slice.enter()
        .insert("path")
        .style("fill", function(d) { return color(d.data.label); })
    		.style("opacity", 0.7)
        .attr("class", "slice");

    slice
        .transition().duration(1000)
        .attrTween("d", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                return arc(interpolate(t));
            };
        })
    slice
        .on("mousemove", function(d){
            div.style("left", d3.event.offsetX+"px");
            div.style("top", d3.event.offsetY+"px");
            div.style("display", "inline-block");
            div.html((d.data.label)+"<br>"+(d.data.value)+"%");
        });
    slice
        .on("mouseout", function(d){
            div.style("display", "none");
        });

    slice.exit()
        .remove();

    var legend = svg.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
            var height = legendRectSize + legendSpacing;
            var offset =  height * color.domain().length / 2;
            var horz = -3 * legendRectSize;
            var vert = i * height - offset;
            return 'translate(' + horz + ',' + vert + ')';
        });

    legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color)
        .style('stroke', color);

    legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        
		.text(function(d) { return d; });

    /* ------- TEXT LABELS -------*/

    var text = svg.select(".labelName").selectAll("text")
        .data(pie(data), function(d){ return d.data.label });

    text.enter()
        .append("text")
        .attr("dy", ".35em")
        .text(function(d) {
            return (d.data.label+": "+d.data.displayValue);
        });

    function midAngle(d){
        return d.startAngle + (d.endAngle - d.startAngle)/2;
    }

    text
        .transition().duration(1000)
        .attrTween("transform", function(d) {
      console.log(d);
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = outerArc.centroid(d2);
                pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                return "translate("+ pos +")";
            };
        })
        .styleTween("text-anchor", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                return midAngle(d2) < Math.PI ? "start":"end";
            };
        })
        .text(function(d) {
            return (d.data.label+": "+d.data.displayValue);
        });


    text.exit()
        .remove();
		
		
	

    /* ------- SLICE TO TEXT POLYLINES -------*/

    var polyline = svg.select(".lines").selectAll("polyline")
        .data(pie(data), function(d){ return d.data.label });

    polyline.enter()
        .append("polyline");

    polyline.transition().duration(1000)
        .attrTween("points", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = outerArc.centroid(d2);
                pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                return [arc.centroid(d2), outerArc.centroid(d2), pos];
            };
        });

    polyline.exit()
        .remove();
};
			
			
			
			
				
				
			//$(this.$element).append("<div class='metric'>metric goes here</div>") 
				this.$scope.selections = [];
				return qlik.Promise.resolve();
			},
			controller: ["$scope", "$element", function ( $scope,$element ) {
				
				var objid= $scope.layout.qInfo.qId + "pieChart";
				
				$($element).addClass("d3pieChart").attr("id", objid);
					
				
				$scope.getPercent = function ( val ) {
					return Math.round( (val * 100 / $scope.layout.qHyperCube.qMeasureInfo[0].qMax) * 100 ) / 100;
				};

				$scope.selections = [];

				$scope.sel = function ( $event ) {
					if ( $event.currentTarget.hasAttribute( "data-row" ) ) {
						var row = parseInt( $event.currentTarget.getAttribute( "data-row" ), 10 ), dim = 0,
							cell = $scope.$parent.layout.qHyperCube.qDataPages[0].qMatrix[row][0];
						if ( cell.qIsNull !== true ) {
							cell.qState = (cell.qState === "S" ? "O" : "S");
							if ( $scope.selections.indexOf( cell.qElemNumber ) === -1 ) {
								$scope.selections.push( cell.qElemNumber );
							} else {
								$scope.selections.splice( $scope.selections.indexOf( cell.qElemNumber ), 1 );
							}
							$scope.selectValues( dim, [cell.qElemNumber], true );
						}
					}
				};
			}]
		};

	} );
