
var width = 1000;
var height = 600;
var numEne = 20;
var generated = false;
var highscore = 0;
var ptdata = [];

var setBoard = function(){
  return d3.select(".board").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g");
};

var svg = setBoard();

var generateEnemy = function(data) { //[[0,1,2]]

  var circles = svg.selectAll('circle').data(data);

  circles.enter().append('circle')
                 .transition()
                 .attr("cx", function(d){return d[0];})
                 .attr("cy", function(d){return d[1];})
                 .attr("r", function(d){return d[2];})
                 .attr("class", "enemy")
                 .attr("fill", "none");
};

//creates duration speed based on level
// var durs = 
var level = function (level) {
  if (level === "easy") {
    return 3000;
  }
  else if (level === "hard"){
    return 500;
  }
  else if (level === "nightmare"){
    return random(500, 500);
  }
};

var updateEnemy = function(data) {
  var circles = svg.selectAll('circle').data(data);
  var cx, cy;

  circles.each(function (d, i) {
    cx = d3.select(this).attr("cx");
    cy = d3.select(this).attr("cy");

    d3.select(this).transition()
                   .duration(1000)
                   //.duration(level("hard"))
                   .attr("r", function(d){return d[2];})
                   .attr("transform", "translate("+ random(width, 0, cx)+ "," + random(height, 0, cy)+ ")");
  });
};

var timer = function(){
  var data = [];
  for (var i = 0; i <= numEne; i++) {
    var temp = [];
    temp.push(random(width - 40, 20));
    temp.push(random(height - 40, 20));
    temp.push(random(10, 5));
    data.push(temp);

    if (generated){
      updateEnemy(data);
    }
    else {
      generateEnemy(data);
    }
  }
  generated = true;
};

Player([[width/2, height/2]]);

setInterval(timer, 1500);

function random (n, m, curr) { //(attr)
  n = n || 1;
  m = m || 0;
  if(curr !== undefined){
    return Math.random() * n - curr; 
  }
  return Math.random() * n + m;
}

function Player(data){
  var player = d3.select(".board").select('svg').selectAll('circle').data(data);

  //generate player
  player.enter().append('circle')
                .transition()
                .attr("cx", function(d){return d[0]})
                .attr("cy", function(d){return d[1]})
                .attr("r", 15)
                .attr("class", "player")
                .attr("fill", "white");
}

var updatePlayer = function(data){
  var player = d3.select(".board").select('svg').selectAll('.player').data(data);
  console.table(data);

  player.transition()
        .duration(50)
        .attr("cx", function(d) {return d[0]})
        .attr("cy", function(d) {return d[1]})
        .attr("fill", function(d) {return "rgb(" + 90 + ","+ Math.floor(d[1]/4) + "," + Math.floor(d[0]/4) + ")"});
};

var started = false;
var collision = 0;
var score = 0;

// get coordinates of mouse
d3.selectAll(".board").on("mousemove", function(){
  if (started) {
    var coordinates = [0, 0];
    coordinates = d3.mouse(this);
    var x = coordinates[0] - 15;
    var y = coordinates[1];
    var data = [[x, y]];
    updatePlayer(data);
    var xCheck; 
    var yCheck;
    var dist;

    d3.select('body').select('svg').on('mousemove', function(){
      tick(d3.mouse(this), x, y);
    });

    d3.selectAll(".enemy").each(function(){
      xCheck = Math.abs(d3.select(this).attr("cx") - coordinates[0]);
      yCheck = Math.abs(d3.select(this).attr("cy") - coordinates[1]);
      // dist = Math.sqrt(Math.pow(xCheck - x, 2) + Math.pow(yCheck - y, 2));
      if ( Math.abs(xCheck - x) <= 15 && Math.abs(yCheck - y) <= 15) {
        collision ++;
        d3.selectAll('.collisions').select('span').html(collision);
        score--;
        d3.selectAll('.current').select('span').html(score);
      }
      if (collision >= 10){
        highscore = highscore > score ? highscore : score;
        d3.selectAll('.high').select('span').html(highscore);
        score = 0;
        d3.selectAll('.current').select('span').html(score);
        collision = 0;
        d3.selectAll('.collisions').select('span').html(collision);
      }
    });
  }
});

d3.select(".board").on("click", function(){
  if (!started){
    setInterval(updateScore, 500);
  }
  started = true;
});

var updateScore = function(){
  score++;
  d3.selectAll('.current').select('span').html(score);
};

var highlight = function(){
  var enemyArray = d3.selectAll(".enemy");
  var length = enemyArray[0].length - 1;
  var random = Math.floor(Math.random() * length);
  d3.select(enemyArray[0][random]).transition()
    .attr("class", "highlight");
    // .attr("fill", "rgb(" + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + ", " + Math.floor(Math.random() * 256) + ")");
  var unhighlight = function(){
    d3.select(enemyArray[0][random]).transition().attr("class", "enemy");
  };
  setTimeout(unhighlight, 3000);
};

setInterval(highlight, 3000);

d3.selectAll(".highlight").on("click", function(){
  //console.log("clicked blue");
  d3.select(this).exit().remove();
});

var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d, i) { return d[0]; })
    .y(function(d, i) { return d[1]; });

var path = svg.append("g")
  .append("path")
    .data([ptdata])
    .attr("class", "line")
    .attr("d", line);

function tick(pt, x, y) {

  ptdata.push(pt);

  path.attr("d", function(d) { return line(d);})
      .attr("stroke", "rgb(" + Math.floor(x/4) + ", "  + 160 + ", " + Math.floor(y/4) + ")");
  if (ptdata.length > 100) {
    ptdata.shift();
  }
}

