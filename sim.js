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

  //add the teams to the racePoints array
  teams.forEach(function(team, i){
    racePoints.push({
      name: team.name,
      points: []
    });
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

    let rp = racePoints.slice();

    //find the positions for each runner of the race
    race.forEach(function(runner,i){
      let team = rp.find(function(t){return t.name === runner.team;});
      team.points.push(i+1);
    });

    //create totals of points for each race to add to the teams
    rp.forEach(function(school){
      //reset the sum to 0
      let sum = 0;
      //iterate through each school that ran and total the points
      school.points.forEach(function(p){
        sum += p;
      });
      //find the team for the current school
      let t = teams.find(function(t){return t.name === school.name;});
      //if the team doesn't have points, add it
      if(!t.points)
        t.points = [];
      //push the school's points for this race to the team
      t.points.push(sum);
    });

  }
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
  simulateRaces(10000);
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
  // racePoints.push({
  //   name: teamName,
  //   points: 0
  // });
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
