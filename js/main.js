google.charts.load('current', {'packages':['corechart']});

google.charts.setOnLoadCallback(drawChart);

function drawChart() {
  $.get("/data/COVID-19_aantallen_gemeente_cumulatief.csv", function(csvString) {
    var arrayData = $.csv.toArrays(csvString, {"separator" : ";", onParseValue: $.csv.hooks.castToScalar});

    var data = new google.visualization.DataTable();

    data.addColumn('date', 'Timestamp');
    data.addColumn('number', 'Cases');
    data.addColumn('number', 'Admissions');
    data.addColumn('number', 'Deaths');

    for(var row=1; row<arrayData.length; row++) {
      data.addRow([
          new Date(arrayData[row][0].substring(0,10)),
          arrayData[row][4],
          arrayData[row][5],
          arrayData[row][6],
      ]);
    }

    var result = google.visualization.data.group(
      data,
      [0],
      [
        {'column': 1, 'aggregation': google.visualization.data.sum, 'type': 'number'},
        {'column': 2, 'aggregation': google.visualization.data.sum, 'type': 'number'},
        {'column': 3, 'aggregation': google.visualization.data.sum, 'type': 'number'}
      ]
    );

    var options = {
      title: 'Reported cases NL',
      width: window.innerWidth,
      height: 500,
      vAxis: {
        logScale: true
      },
      series: {
        0: {
          color: '#FE4A49'
        },
        1: {
          color: '#FED766'
        },
        2: {
          color: '#009FB7'
        }
      }
    };

    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));

    chart.draw(result, options);
  });
}
