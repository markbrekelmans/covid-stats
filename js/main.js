google.charts.load('current', {'packages': ['table', 'corechart']});

google.charts.setOnLoadCallback(initiate);

var options = {
  title: 'Covid-19 trend in Nederland',
  hAxis: {
    title: 'Totaal aantal gevallen',
    logScale: true,
    baseline: 1,
    format: 'short'
  },
  vAxis: {
    title: 'Nieuwe gevallen',
    logScale: true,
    baseline: 1,
    format: 'short'
  },
  legend: 'bottom',
  interpolateNulls: true,
  series: {
    0: {
      //data
      color: '#556F44'
    },
    1: {
      //ref
      color: '#99DDC8',
      lineDashStyle: [2,1]
    }
  },
  width: window.innerWidth,
  height: window.innerHeight
}

function initiate() {
  $.get('https://data.rivm.nl/covid-19/COVID-19_aantallen_gemeente_cumulatief.csv', function(csvData) {
    var arrData = $.csv.toArrays(csvData, {'separator': ';', onParseValue: $.csv.hooks.castToScalar});

    var dtA = new google.visualization.DataTable();
    dtA.addColumn('date', 'Date');
    dtA.addColumn('number', 'Totaal aantal gevallen');

    dtA.addRows([
      [new Date('2020-03-05'), 82],
      [new Date('2020-03-06'), 128],
      [new Date('2020-03-07'), 188],
      [new Date('2020-03-08'), 265],
      [new Date('2020-03-09'), 321],
      [new Date('2020-03-10'), 382],
      [new Date('2020-03-11'), 503],
      [new Date('2020-03-12'), 503]
    ]);

    for(var r=1; r<arrData.length; r++) {
      dtA.addRow([
        new Date(arrData[r][0].substring(0,10)),
        arrData[r][4]
      ])
    }

    var dtA = google.visualization.data.group(
      dtA, [0], [{'column': 1, 'aggregation': google.visualization.data.sum, 'type': 'number'}]
    );

    var dvA = new google.visualization.DataView(dtA);
    dvA.setColumns([
      1,
      {
        calc: deltaPrev,
        type: 'number',
        label: 'Nieuwe gevallen'
      }
    ]);

    //dvA.hideRows([1]);

    function deltaPrev(dtA, rowNum){
      return (rowNum<7) ? Math.floor(dtA.getValue(rowNum, 1) - dtA.getValue(0, 1)) : Math.floor(dtA.getValue(rowNum, 1) - dtA.getValue(Math.max(0,rowNum-7), 1));
      //return Math.floor(dtA.getValue(rowNum, 1) - dtA.getValue(Math.max(0,rowNum-7), 1));
    }

    //
    // set-up table and view B
    //
    $.get('/data/logref.csv', function(csvData) {
      var arrData = $.csv.toArrays(csvData, {'separator': ';', onParseValue: $.csv.hooks.castToScalar});
      var dtB = new google.visualization.DataTable();
      dtB.addColumn('number', 'Totaal aantal gevallen');
      dtB.addColumn('number', 'Exponentiele groei');

      for(var r=0; r<arrData.length; r++) {
        dtB.addRow([
          arrData[r][0],
          arrData[r][1]
        ])
      }

      var dvB = new google.visualization.DataView(dtB);

      var dvC = new google.visualization.data.join(dvA,dvB,'full',[[0,0]],[1],[1]);

      //
      // draw the chart
      //
      var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
      chart.draw(dvC, options);
    });
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
