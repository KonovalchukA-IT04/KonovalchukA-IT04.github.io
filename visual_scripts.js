var cur_head_red = "19";
var cur_tail_red = "19";
var cur_head_blue = "7";
var cur_tail_blue = "7";
var difficulty = 2;

var field = [
    [0,0,0,0,0],
    [0,2,0,0,0],
    [0,0,0,0,0],
    [0,0,0,1,0],
    [0,0,0,0,0]
];
field[1][1] = 2;
field[3][3] = 1;

function placeLine(id){    
    cur_tail_red = cur_head_red;
    let line = document.getElementById(id);
    let next_dot_id = id.replace(cur_head_red, "").replace("-","");
    let new_dot = document.getElementById(next_dot_id);

    let cur_id = parseInt(next_dot_id);
    //console.log("id="+cur_id);
    let x = (cur_id % 5) - 1;
    x == -1 ? x = 4 : x = x;
    //console.log("x="+x);
    let y = Math.ceil(cur_id / 5) - 1;
    //console.log("y="+y);

    if(line.className.includes("VR"))
    {
        line.src = "imgs/dab_VR.gif";
        new_dot.src = "imgs/dab_R.gif";    
        cur_head_red = next_dot_id;
        field[y][x]=1;
        gameMove();
    }
    else if(line.className.includes("HR"))
    {
        line.src = "imgs/dab_HR.gif"
        new_dot.src = "imgs/dab_R.gif";    
        cur_head_red = next_dot_id;
        field[y][x]=1;
        gameMove();
    }
    //updateHover();
}

function updateHover(){
    let all_elements = document.querySelectorAll(".line");
    all_elements.forEach(element => {
        element.className = "line";
    });

    let cur_id = parseInt(cur_head_red);
    //console.log("id="+cur_id);
    let x = (cur_id % 5) - 1;
    x == -1 ? x = 4 : x = x;
    //console.log("x="+x);
    let y = Math.ceil(cur_id / 5) - 1;
    //console.log("y="+y);

    let counter = 0;

    if(x!=4 && field[y][x+1]==0){
        document.getElementById(cur_id+"-"+(cur_id+1)).className = "line moveHR";
        counter++;
    }
    if(x!=0 && field[y][x-1]==0){
        document.getElementById((cur_id-1)+"-"+cur_id).className = "line moveHR";
        counter++;
    }
    if(y!=4 && field[y+1][x]==0){
        document.getElementById(cur_id+"-"+(cur_id+5)).className = "line moveVR";
        counter++;
    }
    if(y!=0 && field[y-1][x]==0){
        document.getElementById((cur_id-5)+"-"+cur_id).className = "line moveVR";
        counter++;
    }

    if(counter == 0){
        alert("Халепа! Ходів більше немає(\nПеремога синіх!");
        createRestartButton();
    }
}

//minmax algorithm -- raw (no class created)

function minimax(pos, depth, alpha, beta, miximizingPlayer){
    if (depth == 0 || pos.child == null){
        return pos.evaluation;
    }

    if (miximizingPlayer){
        let maxEval = -99;
        for(let element of pos.child){
            element.evaluation = minimax(element, depth - 1, alpha, beta, false)
            maxEval = Math.max(maxEval, element.evaluation);
            alpha = Math.max(alpha, element.evaluation);
            if (beta <= alpha){
                break;
            }
        }
        return maxEval;
    }
    else{
        let minEval = 99;
        for(let element of pos.child){
            element.evaluation = minimax(element, depth - 1, alpha, beta, true)
            minEval = Math.min(minEval, element.evaluation);
            beta = Math.min(beta, element.evaluation);
            if (beta <= alpha){
                break;
            }
        }
        return minEval;
    }
}

class Position{
    constructor(evalll){
        this.evaluation = evalll;
        this.child = null;
        this.matrix = null;
        this.head_x = null;
        this.head_y = null;
        this.road_flag = false;
    }
}

function createNewObj(){
    let cur_id_head = parseInt(cur_head_blue);
    let x_head = (cur_id_head % 5) - 1;
    x_head == -1 ? x_head = 4 : x_head = x_head;    
    let y_head = Math.ceil(cur_id_head / 5) - 1;
    var fist_position = new Position(getMovesNum(x_head, y_head, field));
    fist_position.matrix = field;
    fist_position.head_x = x_head;
    fist_position.head_y = y_head;
    return fist_position;
}


function generatePositions(position, depth){
    if(depth == 0){        
        return position.child;        
    }
    position.child = generateChild(position);
    if(position.child == null){
        return position.child;
    }
    position.child.forEach(element => {
        element.child = generatePositions(element, depth-1);
    });
    return position.child;
}

function getMovesNum(x, y, matrix){
    let count = 0;
    if(x!=4 && matrix[y][x+1]==0){
        count++;
    }
    if(x!=0 && matrix[y][x-1]==0){
        count++;
    }
    if(y!=4 && matrix[y+1][x]==0){
        count++;
    }
    if(y!=0 && matrix[y-1][x]==0){
        count++;
    }
    return count;
}

function generateChild(position){
    let new_set = new Set();
    let x = position.head_x;
    let y = position.head_y;
    let cur_matrix = copyMatrix(position.matrix);
    let matrix_copy = copyMatrix(cur_matrix);
    let flag = true;
    let moves_count = 0;
    while(flag){
        flag = false;
        if(x!=4 && cur_matrix[y][x+1]==0){
            matrix_copy = copyMatrix(position.matrix);
            matrix_copy[y][x+1] = 2;
            cur_matrix[y][x+1] = 2;
            moves_count = getMovesNum(x+1,y,matrix_copy);
            let b = new Position(moves_count);
            b.matrix = matrix_copy;
            b.head_x = x+1;
            b.head_y = y;
            new_set.add(b);
            flag = true;
        }
        if(x!=0 && cur_matrix[y][x-1]==0){
            matrix_copy = copyMatrix(position.matrix);
            matrix_copy[y][x-1] = 2;
            cur_matrix[y][x-1] = 2;
            moves_count = getMovesNum(x-1,y,matrix_copy);
            let b = new Position(moves_count);
            b.matrix = matrix_copy;
            b.head_x = x-1;
            b.head_y = y;
            new_set.add(b);
            flag = true;
        }
        if(y!=4 && cur_matrix[y+1][x]==0){
            matrix_copy = copyMatrix(position.matrix);
            matrix_copy[y+1][x] = 2;
            cur_matrix[y+1][x] = 2;
            moves_count = getMovesNum(x,y+1,matrix_copy);
            let b = new Position(moves_count);
            b.matrix = matrix_copy;
            b.head_x = x;
            b.head_y = y+1;
            new_set.add(b);
            flag = true;
        }
        if(y!=0 && cur_matrix[y-1][x]==0){
            matrix_copy = copyMatrix(position.matrix);
            matrix_copy[y-1][x] = 2;
            cur_matrix[y-1][x] = 2;
            moves_count = getMovesNum(x,y-1,matrix_copy);
            let b = new Position(moves_count);
            b.matrix = matrix_copy;
            b.head_x = x;
            b.head_y = y-1;
            new_set.add(b);
            flag = true;
        }
    }
    if(new_set.size == 0){
        return null;
    }
    return new_set;
}

function gameMove(){
    let first_position = createNewObj();
    first_position.child = generatePositions(first_position, 3);
    if(first_position.child == null){
        alert("Було просто! У опонента закінчились ходи)\nПеремога червоних!");
        createRestartButton();
        return;
    }
    let road_eval_num = minimax(first_position, 3, -99, 99, true);
    findPath(first_position, road_eval_num);
    first_position = getTrueMatrix(first_position);
    placeBlueLine(first_position);
}

function findPath(pos, num_of_path){
    if(pos.child!=null){
        for(let chld of pos.child){
            if(chld.evaluation == num_of_path){
                findPath(chld, num_of_path);
            }
            if(chld.road_flag == true){
                pos.road_flag = true;
            }
        }
    }
    else{
        pos.road_flag = true;
        return true;
    }
}

function getTrueMatrix(pos){
    let to_arr = Array.from(pos.child);
    let rnd_num = getRandomInt(pos.child.size);
    let rnd_child = to_arr[rnd_num];
    if (rnd_child.road_flag == true){
        return rnd_child;
    }
    for(let chld of pos.child){
        if(chld.road_flag == true){
            return chld;
        }
    }
}

function copyMatrix(matrix){
    let matrix_copy = [
        [0,0,0,0,0],
        [0,0,0,0,0],
        [0,0,0,0,0],
        [0,0,0,0,0],
        [0,0,0,0,0]
    ];
    for(i=0; i<5; i++){
        for(j=0; j<5; j++){
            matrix_copy[i][j] = matrix[i][j];
        }
    }
    return matrix_copy;
}
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

function placeBlueLine(pos){    
    cur_tail_blue = cur_head_blue;

    let prev_id = parseInt(cur_head_blue);
    //console.log("id="+prev_id);
    let x = (prev_id % 5) - 1;
    x == -1 ? x = 4 : x = x;
    //console.log("x="+x);
    let y = Math.ceil(prev_id / 5) - 1;
    //console.log("y="+y);
    let next_dot_id = (pos.head_x + 1) + pos.head_y*5;
    let new_dot = document.getElementById(next_dot_id);
    let upper_id = next_dot_id;
    let less_id = prev_id;
    if(less_id > upper_id){
        let temporary_v = upper_id;
        upper_id = less_id;
        less_id = temporary_v;
    }

    let line = document.getElementById(less_id+"-"+upper_id);

    if(x == pos.head_x)
    {
        line.src = "imgs/dab_VB.gif";
        new_dot.src = "imgs/dab_B.gif";    
        cur_head_blue = next_dot_id;
        field[pos.head_y][pos.head_x]=2;
    }
    else if(y == pos.head_y)
    {
        line.src = "imgs/dab_HB.gif"
        new_dot.src = "imgs/dab_B.gif";    
        cur_head_blue = next_dot_id;
        field[pos.head_y][pos.head_x]=2;
    }
    updateHover();
}

function startButton(){
    let div_menu = document.querySelector(".bottommenu");
    div_menu.innerHTML = "";
    gameMove();
}

function changeTheDifficulty(value){
    difficulty = parseInt(value);
}

function createRestartButton(){
    let div_menu = document.querySelector(".bottommenu");
    let restart_button = document.createElement("button");
    let rest_text = document.createTextNode("Restart?");
    restart_button.setAttribute("onclick", "restartButtonAction()");
    restart_button.appendChild(rest_text);
    let p1 = document.createElement("p");
    let p2 = document.createElement("p");
    div_menu.appendChild(p1);
    div_menu.appendChild(p2);
    div_menu.appendChild(restart_button);
}

function restartButtonAction(){
    document.location.reload();
}