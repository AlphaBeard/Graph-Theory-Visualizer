var edges = [];
var edgesBFS = [];
var vertices = [];
var adjacencyMatrix = [];

var l = 0;
var press = false;
var allowEdges = false;
var vertexTouching = -1;
var touching = false;
let BFS_ACTIVE = false;

//Selection Boxes
let sel1, sel2;
let BFSv1 = 0, BFSv2 = 1;
function setup() {
  createCanvas(1000, 800);
  //Edge Creation tool
  button = createButton("Edge Creator");
  button.position(width / 2, height + 15);
  button.size(100, 50);
  button.mousePressed(edgeCreator);

    //Edge Delete tool
    button = createButton("Delete Last Edge");
    button.position(width / 2, height + 75);
    button.size(100, 50);
    button.mousePressed(edgeDelete);
  
  //Start of BSF Algorithms, lets have it make an adjacency matrix right now
  button = createButton("Run BFS");
  button.position(width / 2 + 125, height + 15);
  button.size(100, 50);
  button.mousePressed(ClickRunBFS);

  button = createButton("Erase BFS");
  button.position(width / 2 + 125, height + 75);
  button.size(100, 50);
  button.mousePressed(ClickeraseBFS);

  //BFS Vertices Selection
  sel1 = createSelect();
  sel1.position(width / 2 + 235, height + 25);
  sel1.changed(mySelectEvent1);

  sel2 = createSelect();
  sel2.position(width / 2 + 275, height + 25);
  sel2.changed(mySelectEvent2);

}
function edgeDelete(){
  edges.pop();
  Edge.EdgeSet.pop();
}
function mySelectEvent1() {
  BFSv1 = sel1.value();
}
function mySelectEvent2() {
  BFSv2 = sel2.value();
}
function ClickeraseBFS(){
  BFS_ACTIVE = false;
  eraseBFS();
}
function eraseBFS() {
  n = edgesBFS.length;
  for (i = 0; i < n; i++) {
    edgesBFS.pop();
  }
}

function draw() {
  //Background and border
  background(255);
  fill(0, 0, 0, 100);
  strokeWeight(6);
  stroke(125, 125, 125);
  line(0, 0, width, 0);
  line(width, 0, width, height);
  line(width, height, 0, height);
  line(0, height, 0, 0);

  //Title 
  fill(0, 0, 0, 100);
  strokeWeight(0);
  textSize(50);
  text("  Graph Space", 0, 55);

  //Edge Set
  // textSize(25);
  // text("  Edges:", 0, 100);
  // if (Edge.EdgeSet) text(Edge.EdgeSet.toString(), 110, 100);
  // //Vertex Set
  // text("  Vertices:", 0, 130);
  // if (Vertex.V) text(Vertex.V.toString(), 115, 130);

  if (allowEdges) {
    fill(255, 0, 0, 255);
    textSize(25);
    text("Edge Tool Active", width - 250, 50);

  }

  for (i = 0; i < vertices.length; i++) {
    vertices[i].draw();
  }
  for (i = 0; i < edges.length; i++) {
    stroke(125, 125, 125);
    edges[i].draw();
  }
  if(BFS_ACTIVE){
    eraseBFS();
    RunBFS();
  }
  for (i = 0; i < edgesBFS.length; i++) {
    stroke(255, 255, 0);
    edgesBFS[i].draw();
  }
}

function mousePressed() {
  if (checkAllCollisions()) {
    //Check all collsions with vertices, and if there is, create edge or move vertex
  } else {
    if (mouseX < width && mouseY < height) {
      vertices.push(new Vertex(mouseX, mouseY, vertices.length)); //If there isn't any collsion, add vertex;
      j = vertices.length -1;
      sel1.option(j);
      sel2.option(j);
    }
  }
}

function mouseDragged() {
  if (press) {
    edges[edges.length - 1].update(mouseX, mouseY);
  } else if (touching) {
    vertices[vertexTouching].update(mouseX, mouseY);
    //find which edge is touching and update
    edges.forEach(movingVertices);
  }
}
function movingVertices(edge) {
  if (edge.v2 == vertexTouching) {
    edge.update(mouseX, mouseY, edge.v2);
  } else if (edge.v1 == vertexTouching) {
    edge.updateFront(mouseX, mouseY);
  }
}
function mouseReleased() {
  if (press) {
    for (i = 0; i < vertices.length; i++) {
      if (createEdge()) return;
    }
    edges.pop(); //Pop if there are no collisons
  } else if (touching) {
    vertices[vertexTouching].update(mouseX, mouseY);
    touching = false;
  }
  press = false;
}





function ClickRunBFS(){
  BFS_ACTIVE = true;
  RunBFS();
}
//AdjArray
/*  
  0: (2) (3)
  1: (1)
  2: (1)
  3: ()
*/
//Helper Functions:
function RunBFS() {
  //Create list of arrays, where each array contains adjacent edge
  //Start with first vertex and create list of adjacent vertices
  for (i = 0; i < vertices.length; i++) {
    adjacencyMatrix[i] = grabAdjacentVertices(vertices[i]);
  }
  let path = distance(BFSv1, BFSv2, adjacencyMatrix);
  for (i = 0, j = 0; i < path.length - 1; i++) {
    v = path[i];
    v1 = vertices[v];
    edgesBFS[i] = (new Edge(v1.x, v1.y, v));
    v = path[i + 1];
    v2 = vertices[v];
    edgesBFS[i].update(v2.x, v2.y, v);
  }
}
function grabAdjacentVertices(v) {
  let adj = [];
  for (j = 0; j < edges.length; j++) {
    if (edges[j].v1 == v.label) { //If the vertex is incident of some edge, grab other vertex it is incident with
      adj.push(edges[j].v2);
    } else if (edges[j].v2 == v.label) {
      adj.push(edges[j].v1);
    }
  }
  return adj;
}
function distance(v0, v1, adjArray) {
  let color = [];
  let d = [];
  let p = [];
  BFS(adjArray, v0, color, d, p);
  let dist = d[v1];
  let path = [];
  let parent = p[v1];
  var i;
  for (i = 0; i < dist; i++) {
    path.unshift(parent);
    parent = p[parent];
  }
  path.push(v1);
  return path;
}
function BFS(adjArray, s, color, d, p) {
  let n = vertices.length;
  color.setAll("white", n);
  d.setAll(-1, n);
  p.setAll(null, n);
  d[s] = 0;
  p[s] = null;
  color[s] = "black";
  let Q = [];
  Q.push(s);
  while (Q.length != 0) {
    x = Q.pop();
    adj = adjArray[x];
    for (i = 0; i < adj.length; i++) {
      y = adj[i];
      if (color[y] == "white") {
        Q.push(y);
        color[y] = "grey";
        d[y] = d[x] + 1;
        p[y] = x;
      }
    }
    color[x] = "black";
  }

}

Array.prototype.setAll = function (v, n) {
  var i;
  for (i = 0; i < n; ++i) {
    this.push(v);
  }
};
function createEdge() {
  if (vertices[i].collison(mouseX, mouseY)) {
    j = edges.length - 1;
    edges[j].update(vertices[i].x, vertices[i].y, i);
    press = false;
    if (edges[j].v1 == edges[j].v2) {
      edges.pop(); //Cant have trivial edges
    } else {
      //Check that this isnt already in the set;
      if (Edge.EdgeSet.includes(edges[j].v1.toString() + "->" + edges[j].v2.toString())) {
        edges.pop();
      } else if (Edge.EdgeSet.includes(edges[j].v2.toString() + "->" + edges[j].v1.toString())) {
        edges.pop();
      }
      else {//Add the edge if not
        Edge.addEdge(edges[j].v1.toString() + "->" + edges[j].v2.toString());
      }
    }
    return 1;
  }
}
function checkAllCollisions() {
  for (i = 0; i < vertices.length; i++) {
    if (vertices[i].collison(mouseX, mouseY)) {
      if (allowEdges) { //If Allowing edges, create edge
        edges.push(new Edge(vertices[i].x, vertices[i].y, i));
        press = true;
      } else { //Drag and move Vertex
        // vertices[i].update(mouseX, mouseY);
        vertexTouching = i;
        touching = true;
      }
      return true;
    }
  }
}

function edgeCreator() {
  switch (allowEdges) {
    case true:
      allowEdges = false;
      break;
    case false:
      allowEdges = true;
      break;
  }
}


class Vertex {

  constructor(x, y, label) {
    this.x = x;
    this.y = y;
    this.label = Vertex.increment(label);
    this.diam = 30;
  }
  static increment(label) {
    if (!this.size) {
      this.size = 1;
      this.V = new Array();
      this.V.push(label);
    } else {
      this.size++;
      this.V.push(label);
    }
    return label;
  }

  collison(mx, my) {
    if (mx >= this.x - this.diam && mx <= this.x + this.diam) {
      if (my >= this.y - this.diam && my <= this.y + this.diam) {
        return true;
      }
    }
    return false;
  }
  update(x, y) {
    this.x = x;
    this.y = y;
  }
  draw() {
    fill(85);
    strokeWeight(0);
    stroke(20);
    circle(this.x, this.y, this.diam);

    fill(155);
    textSize(32);
    text(this.label, this.x + this.diam / 2, this.y + this.diam + 10);
  }
}
class Edge {
  constructor(x, y, v, color) {
    this.x1 = x;
    this.x2 = x;
    this.y1 = y;
    this.y2 = y;
    this.v1 = v;
    this.v2 = null;
    this.color = color;
    if (!Edge.EdgeSet) Edge.createEdgeSet();
  }
  static createEdgeSet() {
    this.EdgeSet = new Array();
  }
  static addEdge(label) {
    if (!this.size) {
      this.size = 1;
      this.EdgeSet.push(label);
    } else {
      this.EdgeSet.push(label);
      this.size++;
    }
  }
  draw(r, g, b) {
    strokeWeight(4);
    // stroke(20);
    line(this.x1, this.y1, this.x2, this.y2);
  }
  update(x, y, v) {
    this.x2 = x;
    this.y2 = y;
    this.v2 = v;
  }
  updateFront(x, y) {
    this.x1 = x;
    this.y1 = y;
  }
}

