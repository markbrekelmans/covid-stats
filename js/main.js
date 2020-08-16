google.charts.load('current', {'packages': ['table', 'corechart']});

google.charts.setOnLoadCallback(initiate);

function initiate() {
  //$.get('/data/COVID-19_aantallen_gemeente_cumulatief.csv', function(csvData) {
  $.get('https://data.rivm.nl/covid-19/COVID-19_aantallen_gemeente_cumulatief.csv', function(csvData) {
    // store the csv data in an array
    var arrData = $.csv.toArrays(csvData, {'separator': ';', onParseValue: $.csv.hooks.castToScalar});

    // initiate a new DataTable
    var dt = new google.visualization.DataTable();

    // add columns for time and cases
    dt.addColumn('date', 'Timestamp');
    dt.addColumn('number', 'Cases');

    // loop through the csv data array
    // and add the rows to the DataTable
    for(var r=1; r<arrData.length; r++) {
      dt.addRow([
        new Date(arrData[r][0].substring(0,10)),
        arrData[r][4]
      ]);
    }

    // aggregate sum cases by timestamp
    var dt = google.visualization.data.group(
      dt, [0], [{'column': 1, 'aggregation': google.visualization.data.sum, 'type': 'number'}]
    );

    // initiate a new DataView
    var dv = new google.visualization.DataView(dt);

    // add a calculated column for the
    // delta between the previous row.
    // still need to find a way to plot
    // a reference log line.
    dv.setColumns([
      1,
      {
        calc: deltaPrev,
        type: 'number',
        label: 'Nieuwe gevallen'
      }/*,
      {
        calc: refValue,
        type: 'number',
        label: 'Reference'
      }*/
    ]);

    function deltaPrev(dt, rowNum){
      return Math.floor(dt.getValue(rowNum, 1) - dt.getValue(Math.max(0,rowNum-7), 1));
    }

    function refValue(dt, rowNum){
      return Math.log(Math.max(1,rowNum)*2);
    }

    // set the chart options
    var options = {
      title: 'Covid-19 trend in Nederland',
      hAxis: {
        title: 'Totaal aantal gevallen',
        logScale: true
      },
      vAxis: {
        title: 'Nieuwe gevallen',
        logScale: true
      },
      legend: 'none',
      width: window.innerWidth,
      height: window.innerHeight
    }

    // draw a Table Chart with the DataView
    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(dv, options);
  });
}

var resizing = false;

window.onresize = function(event) {
  resizing = true;

  if($('chart_div')) {
    initiate();
  }

  resizing = false;
}
