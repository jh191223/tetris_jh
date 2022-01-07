//DOM
const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoredisplay = document.querySelector(".score");
const restartButton = document.querySelector(".game-text > button");

const GAME_ROWS = 20;
const GAME_COLS = 10;

let score = 0; //게임점수
let duration =500; //각각의 블록이 떨어지는 속도 
let downInterval ; // 
let tempMovingItem;

const BLOCKS = {
    tree : [
        [[1,0], [0,1], [1,1], [2,1]],
        [[1,0], [0,1], [1,1], [1,2]],
        [[1,2], [1,1], [0,1], [2,1]],
        [[2,1], [1,2], [1,0], [1,1]],
    ],
    square : [
        [[0,0], [0,1], [1,0], [1,1]],
        [[0,0], [0,1], [1,0], [1,1]],
        [[0,0], [0,1], [1,0], [1,1]],
        [[0,0], [0,1], [1,0], [1,1]],
    ],
    bar: [
        [[1,0], [2,0], [3,0], [4,0]],
        [[2,-1], [2,0], [2,1], [2,2]],
        [[1,0], [2,0], [3,0], [4,0]],
        [[2,-1], [2,0], [2,1], [2,2]],
    ],
    zee: [
        [[0,0], [1,0], [1,1], [2,1]],
        [[0,1], [1,0], [1,1], [0,2]],
        [[0,1], [1,1], [1,2], [2,2]],
        [[2,0], [2,1], [1,1], [1,2]],
    ],
    elleft: [
        [[0,0], [0,1], [0,2], [1,0]],
        [[0,0], [0,1], [1,1], [2,1]],
        [[1,0], [1,2], [1,1], [0,2]],
        [[0,0], [1,0], [2,0], [2,1]],
    ],
    elRight:[
        [[1,0], [2,0], [1,1], [1,2]],
        [[0,0], [0,1], [1,1], [2,1]],
        [[0,2], [1,0], [1,1], [1,2]],
        [[0,1], [1,1], [2,1], [2,2]],
    ]
}

function showGameoverText(){
    gameText.style.display = "flex"
}

const movingItem={ // 실제 움직이는 블록 
    type:"", 
    direction: 0, 
    top:0, 
    left:3, 
}
 
init(); 
 
function init(){ 
    tempMovingItem = {...movingItem} /*값만 복사해서 가져옴 가져온 가져온 값을 변경해도 원본의 값이 바뀌지 않음.*/
    for (let i=0;i<GAME_ROWS;i++){ 
        prependNewLine(); 
    } 
    generateNewBlock(); 
}

function prependNewLine(){
        const li = document.createElement("li");
        const ul =document.createElement("ul");
        for (let j=0;j<GAME_COLS;j++){
            const matrix = document.createElement("li");
            ul.prepend(matrix);
        }
        li.prepend(ul);
        playground.prepend(li);
}

function renderBlocks(moveType=""){
    const { type, direction, top, left} = tempMovingItem; // object 안에 있는 변수를 가져옴 
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove(type, "moving"); 
    }) // 기존의 (이동 전의 블록을 지움)****

    // some => 특정 조건을 만족하는 지에 따라 false true를 반환 

    BLOCKS[type][direction].some(block =>{ //some 함수의 기능 추가 공부 필요
        const x = block[0]+left;
        const y = block[1]+top;
        const target = playground.childNodes[y]? playground.childNodes[y].childNodes[0].childNodes[x]: null;
        // ul을 벗어나는 경우를 고려 
        // 삼합 연산자 cosnt xxx = 조건 ? 참일 경우 : 거짓일 경우 
        const isAvailable = checkEmpty(target); //다른 블록이 있는지 체크   
        if(isAvailable){
            target.classList.add(type,"moving"); // classList.add 등 추가 공부 필요 
        } else{
            tempMovingItem = {...movingItem}
            if(moveType==="retry"){ // 재귀함수 사용시 call stack maximum axid error 조심
                clearInterval(downInterval);
                showGameoverText();
            }
            setTimeout(()=>{ 
                // 호출 스택이 비어지면 이벤트 루프 실행
                // 호출되고, 지워지면서 백그라운드로 타이머와 함께 보내짐 
                // 3초뒤에 데스크 큐로 보내지고, 실행됨 
                renderBlocks("retry");
                if(moveType ==="top"){
                    seizeBlock()
                }
            },0)
            return true;
        }
            // 재귀 함수 사용시 call stack maximum
    });
    // 다시 기존의 값 복구
    movingItem.left = left ; 
    movingItem.top = top;
    movingItem.direction=direction;
}    



function seizeBlock() {
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove("moving");
        moving.classList.add("seized"); 
    })
    checkMatch()
}

function checkMatch(){
    const childNodes = playground.childNodes;
    childNodes.forEach(child => {
        let matched = true;
        child.children[0].childNodes.forEach(li =>{
            if(!li.classList.contains("seized")){
                matched = false;
            }
        })
        if(matched){
            child.remove();
            prependNewLine();
            score++;
            scoredisplay.innerHTML=score;
        }
    })
    generateNewBlock()
}

function generateNewBlock(){

    clearInterval(downInterval);
    downInterval = setInterval(()=>{
        moveBlock("top",1)
    }, duration);
    const blockArray = Object.entries(BLOCKS);
    const randomIndex = Math.floor(Math.random()*blockArray.length);
    movingItem.type = blockArray[randomIndex][0];
    movingItem.top=0 ;
    movingItem.left= 0;
    movingItem.direction=0;
    tempMovingItem = {...movingItem};
    renderBlocks();

}

function checkEmpty(target){
    if(!target|| target.classList.contains("seized")) {
        return false;
    }
    return true;
}

function moveBlock(moveType, amount){ // 해당 amount의 값만큼 moveType에 따라 이동 
    tempMovingItem[moveType]+=amount; //left인지 top 인지 
    renderBlocks(moveType) // 기존에 있던 블락은 제외할 필요가 있음 
}

function changeDirection(){
    const direction = tempMovingItem.direction;
    direction ===3 ? tempMovingItem.direction=0 : tempMovingItem.direction+=1;
    renderBlocks();
}

function dropBlock(){
    clearInterval(downInterval);
    downInterval = setInterval(()=>{
        moveBlock("top",1);
    },10)
}

//event handling
document.addEventListener("keydown", e => { // 각각의 키는 고유한 값을 가짐
    switch(e.keyCode){
        case 39:
            moveBlock("left",1)
            break
        case 37:
            moveBlock("left",-1)
            break
        case 40 : 
            moveBlock("top",1)
            break;
        case 38:
            changeDirection();
            break;
        case 32: 
            dropBlock();
            break;
        default:
            break;
    }

})

restartButton.addEventListener("click", ()=>{
    playground.innerHTML= "";
    gameText.style.display="none"
    init();
})