var teams = [];
var races = [];
var racePoints = [];
var racePlaces = [];

function compareTimes(a, b) {
  if (a.time < b.time)
    return -1;
  if (a.time > b.time)
    return 1;
  return 0;
}

function sortRaces() {
  races.forEach(function(race) {
    race.sort(compareTimes);
  });
}

function comparePoints(a, b) {
  //this is opposite of compareTimes
  //a team wants to have runners with low times
  if (a.points > b.points)
    return 1;
  if (a.points < b.points)
    return -1;
  return 0;
}

function sortPoints() {
  racePoints.forEach(function(race) {
    race.sort(comparePoints);
  });
}

function simulateRaces(numRaces) {
  //pull out the team names from the table
  let teamNames = [];
  teams.forEach((team, j) => {
    teamNames.push(team.name);
    racePoints[j] = [];
    racePlaces[j] = [];
  });

  //run some races
  for (i = 0; i < numRaces; i++) {
    //create a race element in the races array
    race = [];
    //loop through each team
    teams.forEach(function(team) {
      //loop through each runner on each team
      team.runners.forEach(function(r) {
        //create normal random value for their race
        let raceTime = gaussian(r.totalSeconds, 10).ppf(Math.random());
        //insert the racetime into the current race with team name
        race.push({
          team: team.name,
          time: raceTime
        });
      });
    });

    //the race is complete, sort the runners
    race.sort(compareTimes);

    //set all points to 0 for this race
    racePoints.forEach((r) => {
      r[i] = 0;
    });

    //add the position of the runner to the team's array in racePoints
    race.forEach((runner, j) => {
      //adds the place for this runner to the team's points for this race (i)
      racePoints[teamNames.indexOf(runner.team)][i] += (j + 1);
    });
  }

    //figure out the place of each team in each race
    for(let c = 0; c < racePoints[0].length; c++){
      let places = [];
      //racePlaces[c] = [];
      for(let r = 0; r < racePoints.length; r++){
        places.push(racePoints[r][c]);
      }
      sortWithIndices(places).sortIndices.forEach((i, place)=>{
        racePlaces[i].push(place+1);
      });
    }
}

//takes an array and then sorts it, returns an array with indexs of original array sorted
function sortWithIndices(toSort) {
  for (var i = 0; i < toSort.length; i++) {
    toSort[i] = [toSort[i], i];
  }
  toSort.sort(function(left, right) {
    return left[0] < right[0] ? -1 : 1;
  });
  toSort.sortIndices = [];
  for (var j = 0; j < toSort.length; j++) {
    toSort.sortIndices.push(toSort[j][1]);
    //toSort[j] = toSort[j][0];
  }
  return toSort;
}


function makeTable() {
  $('.times').empty();

  let row = '<tr>';

  teams.forEach(function(team) {
    row += '<th scope="row"><a href="#" class="removeTeam">' + team.name + '</a></th>';
    team.runners.forEach(function(r) {
      row += '<td>' + r.minutes + ':' + r.seconds + '</td>';
    });
    row += '</tr>';
  });

  $('.times').append(row);
}

function displayPoints() {
  var data = [];
  teams.forEach((team, j) => {
    data.push({
      x: racePoints[j],
      name: team.name,
      histnorm: "count",
      autbinx: true,
      type: "histogram",
      opacity: 0.6,
      marker: {
        color : '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6)
      }
    });
  });
  var layout = {
    bargap: 0.05,
    bargroupgap: 0.2,
    barmode: "overlay",
    title: "Race Results",
    xaxis: {
      title: "race points (fewer the better)"
    },
    yaxis: {
      title: "frequency"
    }
  };
  Plotly.newPlot('results', data, layout);
}

function displayPlaces() {
  var data = [];
  teams.forEach((team, j) => {
    data.push({
      x: racePlaces[j],
      name: team.name,
      histnorm: "count",
      autbinx: true,
      type: "histogram",
      opacity: 0.6,
      marker: {
        color : '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6)
      }
    });
  });
  var layout = {
    bargap: 0.05,
    bargroupgap: 0.2,
    barmode: "overlay",
    title: "Race Results",
    xaxis: {
      title: "race points (fewer the better)"
    },
    yaxis: {
      title: "frequency"
    }
  };
  Plotly.newPlot('points', data, layout);
}

$('button#run').click(function() {
  //run races
  let trials = $('#numTrials').val();
  simulateRaces(trials);
  displayPoints();
  displayPlaces();
});

$('button#addTeam').click(function() {
  let teamName = $('input[name="teamName"]').val();
  let mins = [];
  $('.minutes').val(function(index, value) {
    mins.push(value.trim());
  });
  let secs = [];
  $('.seconds').val(function(index, value) {
    secs.push(value.trim());
  });
  runners = [];
  for (i = 0; i < mins.length; i++) {
    let r = {
      minutes: mins[i],
      seconds: secs[i],
      totalSeconds: mins[i] * 60 + secs[i],
      raceTime: []
    };
    runners.push(r);
  }
  let team = {
    name: teamName,
    runners: runners
  };
  teams.push(team);
  racePoints.push([]);
  makeTable();
});

$(document).on('click', 'a.removeTeam', function() {
  let killTeam = $(this).text();
  let index = -1;
  for (i = 0; i < teams.length; i++) {
    if (teams[i].name === killTeam)
      index = i;
  }
  if (index !== -1) {
    teams.splice(index, 1);
    makeTable();
  }
});

//File handling----------------------------------------------------------------
$('#saveTeams').click(function() {
  $('#saveLink').text("");
  var json = JSON.stringify(teams);
  var blob = new Blob([json], {
    type: "application/json"
  });
  var url = URL.createObjectURL(blob);

  var a = document.createElement('a');
  a.download = $('input[name="fileName"]').val() + ".json";
  a.href = url;
  a.textContent = $('input[name="fileName"]').val() + ".json";

  document.getElementById('saveLink').appendChild(a);
});

function handleFileSelect(evt) {
  var files = evt.target.files; // FileList object

  // files is a FileList of File objects. List some properties.
  var output = [];
  for (var i = 0, f; f = files[i]; i++) {
    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = (function(theFile) {
      return function(e) {
        console.log('e readAsText = ', e);
        console.log('e readAsText target = ', e.target);
        try {
          teams = JSON.parse(e.target.result);
          makeTable();
          //alert('json global var has been set to parsed json of this file here it is unevaled = \n' + JSON.stringify(teams));
        } catch (ex) {
          alert('error when trying to parse json = ' + ex);
        }
      }
      //makeTable();
    })(f);
    reader.readAsText(f);
  }
}

document.getElementById('loadTeams').addEventListener('change', handleFileSelect, false);
