var player_score = 0;
var bot_score = 0;
var prev_score = bot_score;

var player_hand = [0,0,0,0,0];
var bot_hand = [0,0,0,0,0];

var moves_counter = 2;
var moves_retainer = moves_counter;

var player_is_second = false;
var bot_is_second = false;

var toos_flag = false;

var set_of_decisions = new Array();

class Tree{
    constructor(arr, brk, pos){
        this.array = arr;
        this.child = new Array();
        this.brake = (1/6)*brk;
        this.heuristic = getScore(arr)*(1/6)*brk;
        this.change_pos = pos,
        this.road_flag = false;
    }
}


function firstRoll(array){
    for (let i = 0; i < array.length; i++){
        array[i] = getRandomInt(1,6);
    }
    return array;
}

function sortByDesc(array){
    array.sort(function(a, b) {
        return b - a;
    });
    return array;
}

function getScore(main_array){
    let array = main_array.slice();
    array = sortByDesc(array);

    let score = 0;
    let in_position = 0;
    let cur_val = 0;
    let val_count = 0;
    let is_senior = true;
    let is_pair = false;
    let is_set = false;

    while (in_position < array.length){        
        cur_val = array[in_position];
        for (let j = in_position; j < array.length; j++){
            if (cur_val == array[j]){
                val_count++;
            }
        }

        if (val_count == 1 && is_senior){
            score += cur_val;
            is_senior = false;
        }
        else if (val_count == 2){
            score += cur_val*6;
            is_pair = true;
        }
        else if (val_count == 3){
            score += cur_val*36+36;
            is_set = true;
        }
        else if (val_count == 4){
            score += cur_val*216+38;
        }
        else if (val_count == 5){
            score += cur_val*1296 + 44;
        }
        
        if (is_pair && is_set){
            score += 216;
        }

        in_position += val_count;
        val_count = 0;
        if (in_position > 4){
            break;
        }
    }

    return score;
}

function reRollFew(array, set){
    for(index of set){
        array[index] = getRandomInt(1,6);
    }
    return array;
}

function treeGeneration(root){
    let set_of_arrays = arrayGeneration(root.array, root.change_pos + 1);
    for (arr of set_of_arrays){        
        root.child.push(new Tree (arr, root.brake, getIndexOfChange(root.array, arr)[0]));
        set_of_decisions.push(new Tree (arr, root.brake, -1));
    }
    for (chld of root.child){
        treeGeneration(chld);        
    }
    return root;
}

function generateAllMoves(root, depth){
    if(depth!=0){
        treeGeneration(new Tree(root.array, 6, root.change_pos));
        root.child = set_of_decisions;
        set_of_decisions = new Array();
        for(cld of root.child){
            generateAllMoves(cld, depth-1);
        }
    }
    return root;
}


function arrayGeneration(array, startPosition){
    let set_of_array = new Array();
    for (let i = startPosition; i < array.length; i++){
        for (let j = 1; j <= 6; j++){
            if (array[i] != j){
                let copy = array.slice();
                copy[i] = j;
                set_of_array.push(copy);
            }
        }
    }
    return set_of_array;
}

function getIndexOfChange(master, slave){
    let indexes = new Array();
    for (let i = 0; i < master.length; i++){
        if(master[i]!=slave[i]){
            indexes.push(i);
        }
    }
    return indexes;
}

function getRandomInt(min, max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function miximize(pos, depth){
    if (depth == 0 || pos.child.length == 0){
        return pos.heuristic;
    }
    let maxEval = -999999;
    for(let element of pos.child){
        element.heuristic = miximize(element, depth - 1)
        maxEval = Math.max(maxEval, element.heuristic);
    }
    return maxEval;
    
}

function findPath(pos, num_of_path){
    if(pos.child.length != 0){
        for(let chld of pos.child){
            if(chld.heuristic == num_of_path){
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

function getTrueArray(pos){
    for(let chld of pos.child){
        if(chld.road_flag == true){
            return chld;
        }
    }
}



function bot_re_roll_logic(is_second){
    setTimeout(() => {
        if(is_second){
            if (prev_score > player_score){
                moves_retainer = 0;
                setTimeout(() => {                    
                    who_is_winner();   
                    createRestartButton();                     
                }, 3000);
                return;
            }
        }
        if (moves_retainer > 0){
            var decision_tree = new Tree(firstRoll(bot_hand), 6, -1);
            decision_tree = generateAllMoves(decision_tree, 1);
            let returned_heuristic = miximize(decision_tree, 1);
            findPath(decision_tree, returned_heuristic);
            decision_tree = getTrueArray(decision_tree);
            if(is_second){
                if(is_more_powerfull(bot_hand, decision_tree.array)){
                    prev_score = getScore(bot_hand);
                    let ar = getIndexOfChange(bot_hand, decision_tree.array);
                    bot_hand = reRollFew(bot_hand, ar);
                    restartgif(bot_hand);
                    updateScore();
                    moves_retainer--;
                }                
            }
            else{
                if(decision_tree.heuristic > prev_score){
                    prev_score = getScore(bot_hand);
                    let ar = getIndexOfChange(bot_hand, decision_tree.array);
                    bot_hand = reRollFew(bot_hand, ar);
                    restartgif(bot_hand);
                    updateScore();
                    moves_retainer--;
                }
                else{
                    moves_counter = 2 - moves_retainer;
                    bot_score = prev_score;
                    updateScore();
                    return nextStepForPlayer();
                }
            }
        }
        if(moves_retainer>0){
            return bot_re_roll_logic(is_second);
        }
        else{
            if(bot_is_second){
                setTimeout(() => {                    
                    who_is_winner();
                    return createRestartButton();
                }, 3000);
            }else{
                moves_counter = 2 - moves_retainer;
                    return nextStepForPlayer();
            }
        }
    }, 3000);
}

function is_more_powerfull(master, slave){
    let master_power = getScore(master);
    let slave_power = getScore(slave);
    if(slave_power > master_power){
        return true;
    }
    else{
        return false;
    }
}


function continueplay(){
    if(player_is_second){
        who_is_winner();            
        createRestartButton();
        return;
    }
    moves_retainer = 2 - moves_counter;
    player_score = getScore(player_hand);
    bot_hand = firstRoll(bot_hand).slice();
    //place_pic(bot_hand, false);
    clearCheckBoxes();
    updateScore();
    restartgif(bot_hand);
    let m = document.querySelector('.menu');
    alertBox('Хід опонента');
    m.innerHTML = '';
    bot_score = getScore(bot_hand);
    prev_score = bot_score;
    if (prev_score > player_score){
        moves_retainer = 0;
    }
    bot_re_roll_logic(true);

}

function nextStepForPlayer(){
    let m = document.querySelector('.menu');
    let deal = document.createElement('button');
    deal.appendChild(document.createTextNode('Roll'));
    deal.className = 'nextbutton';
    deal.setAttribute('onclick','player_move()');
    m.appendChild(deal);
}

function player_move(){  
    let m = document.querySelector('.menu'); 
    m.innerHTML = '';
    alertBox('Ваш хід');
    player_hand = firstRoll(player_hand).slice();
    //place_pic(ar, true);
    restartgif(player_hand);
    updateScore();
    setTimeout(() => {            
        createButtons();
        let count = 0;
        while (count < 5){
            count ++;
            createCheckBoxes(count);
        }
    }, 3000);
}

function startTheGame(){
    let but = document.querySelector('.menu');
    but.innerHTML = '';

    let flag = toss_up();

    if(flag){
        bot_is_second = true;
        alertBox('Ваш хід');
        player_hand = firstRoll(player_hand).slice();
        //place_pic(ar, true);
        restartgif(player_hand);
        setTimeout(() => {            
            createButtons();
            let count = 0;
            while (count < 5){
                count ++;
                createCheckBoxes(count);
            }
            updateScore(player_hand);
        }, 3000);
    }
    else{
        player_is_second = true;
        alertBox('Хід опонента');
        bot_hand = firstRoll(bot_hand).slice();
        //place_pic(ar, false);
        restartgif(bot_hand);
        updateScore(bot_hand);
        bot_re_roll_logic(flag);
    }
}

function place_by_ar(array,flag){
    let count = 0;
    for(element of array){
        count++;
        let g = document.createElement('img');
        g.src = 'img/d'+element.toString()+'.gif';
        let loc = document.getElementById(count.toString())
        loc.innerHTML = '';
        loc.appendChild(g);
        if(flag){
            createCheckBoxes(count);
        }
    }
}

function place_pic(array, flag){
    place_by_ar(array, flag);
    if(flag){
        createButtons();
    }
    updateScore();
}

function createCheckBoxes(count){
    let loc = document.getElementById(count.toString())
    let b = document.createElement('input');
    b.type = 'checkbox';
    b.className = 'checkindexes';
    b.value = count.toString();
    loc.appendChild(b);
}

function createButtons(){
    let m = document.querySelector('.menu');
    let rb = document.createElement('button');
    rb.appendChild(document.createTextNode('Re-roll'));
    rb.className = 'restartbutton';
    rb.setAttribute('onclick','reroll()');
    m.appendChild(rb);
    let deal = document.createElement('button');
    deal.appendChild(document.createTextNode('Continue'));
    deal.className = 'continuebutton';
    deal.setAttribute('onclick','continueplay()');
    m.appendChild(deal);
}

function reroll(){
    if(moves_counter != 0){
        moves_counter--;
        moves_retainer = 2 - moves_counter;
        let ar = new Array();
        let val = document.querySelectorAll('.checkindexes');
        for(el of val){
            if(el.checked){
                ar.push(parseInt(el.value)-1);
            }
        }
        player_hand = reRollFew(player_hand, ar);
        restartgif(player_hand);
        updateScore();
        let del = document.querySelector('.restartbutton');
        del.outerHTML = '';
        let cnt = document.querySelector('.continuebutton');
        cnt.outerHTML = '';
        setTimeout(() => {            
            createButtons();
            alertBox('У вас залишилось ходів: '+moves_counter);
        }, 3000);
    }
    else{
        moves_retainer = 2 - moves_counter;
        let del = document.querySelector('.restartbutton');
        del.outerHTML = '';
        let cnt = document.querySelector('.continuebutton');
        cnt.outerHTML = '';
        if(player_is_second){
            who_is_winner();            
            createRestartButton();
        }
        else{
            alertBox('Ходи закінчились! Нажміть кнопку "Continue"');       
            createButtons();
        }
    }
}

function restartgif(array){
    let count = 0;
    for(element of array){
        count++;
        let loc = document.getElementById(count.toString());
        let s = 'img/d'+element.toString()+'.gif';
        loc.childNodes[0].src = s;
    }
}

function updateScore(){
    let os = document.querySelector('.opponent-score');
    let ps = document.querySelector('.player-score');
    let os_s = getScore(bot_hand);
    bot_score = os_s;
    let ps_s = getScore(player_hand);
    player_score = ps_s;
    ps.textContent = 'player score: '+ps_s;
    os.textContent = 'opponent score: '+os_s;
}

function toss_up(){
    player_score = getScore(player_hand);
    bot_score = getScore(bot_hand);
    if (player_score >= bot_score){
        player_score = 0;
        bot_score = 0;
        toos_flag = true;
        return true;
    }
    player_score = 0;
    bot_score = 0;
    toos_flag = false;
    return false;
}

function alertBox(str){
    let box = document.querySelector('.alert-box');
    box.textContent = str;
}

function clearCheckBoxes(){
    let count = 0;
    let chk = document.querySelectorAll('.checkindexes');
    while (count < 5){
        chk[count].outerHTML = '';
        count++;
    }
}

function createRestartButton(){
    let div_menu = document.querySelector(".menu");
    div_menu.innerHTML='';
    let restart_button = document.createElement("button");
    let rest_text = document.createTextNode("Restart");
    restart_button.setAttribute("onclick", "restartButtonAction()");
    restart_button.appendChild(rest_text);
    div_menu.appendChild(restart_button);
}
function restartButtonAction(){
    document.location.reload();
}

function who_is_winner(){
    updateScore();
    if(player_score > bot_score){
        alert('Перемога гравця');
    }
    else if(player_score < bot_score){
        alert('Перемога опонента');
    }
    else{
        alert('Нічия');
    }
}

function clearAllGifs(){
    let count = 0;
    let chk = document.querySelectorAll('.dice-box');
    while (count < 5){
        chk[count].innerHTML = '';
        count++;
    }
}

function RollForToss_player(){
    clearAllGifs();
    let q = document.querySelector('.menu');
    q.innerHTML = '';
    alertBox('Ваш хід');
    player_hand = firstRoll(player_hand);
    place_pic(player_hand, false);
    updateScore();    
    let os = document.querySelector('.opponent-score');    
    os.textContent = 'opponent score: 0';
    setTimeout(() => {            
        let b = document.createElement('button');
        let t = document.createTextNode("Toss");
        b.appendChild(t);
        b.setAttribute("onclick", "RollForToss_bot()");
        q.appendChild(b);
    }, 3000);
}

function RollForToss_bot(){
    let q = document.querySelector('.menu');
    q.innerHTML = '';
    alertBox('Хід опонента');
    bot_hand = firstRoll(bot_hand);
    restartgif(bot_hand);
    updateScore();
    setTimeout(() => {            
        let b = document.createElement('button');
        let t = document.createTextNode("Play");
        b.appendChild(t);
        b.setAttribute("onclick", "startTheGame()");
        q.appendChild(b);
        if(toss_up()){
            alert('Перший хід - гравця');
        }
        else{
            alert('Перший хід - опонента');
        }
    }, 3000);
}