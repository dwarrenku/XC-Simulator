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
  for (i = 0; i < numRaces; i++) {
    //create a race element in the races array
    races[i] = [];
    racePoints[i] = [];
    //loop through each team
    teams.forEach(function(team) {
      racePoints[i].push({
        team: team.name,
        points: 0
      });
      //loop through each runner on each team
      team.runners.forEach(function(r) {
        //create normal random value for their race
        let raceTime = gaussian(r.totalSeconds, 10).ppf(Math.random());
        //insert the racetime into the current race with team name
        races[i].push({
          team: team.name,
          time: raceTime
        });
      });
    });
  }
}

function getPoints() {
  //total up the points for each team depending on the
  //rankings of the runners, stores it into the
  //racePoints array
  races.forEach(function(race, i) {
    race.forEach(function(runner, j) {
      racePoints[i].forEach(function(p) {
        if (p.team === runner.team)
          p.points += (j + 1);
      });
    });
  });

  sortPoints();

  teams.forEach(function(team) {
    racePlaces[team.name] = [];
    racePoints.forEach(function(school) {
      school.forEach(function(s, i){
        if (s.team === team.name) {
          racePlaces[team.name].push(i);
        }
      });
    });
  });
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

$('button#run').click(function() {
  //run races
  simulateRaces(1000);
  sortRaces();
  getPoints();
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
  racePoints.push({
    name: teamName,
    points: 0
  });
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
