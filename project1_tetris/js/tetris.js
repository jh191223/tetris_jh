//DOM
const playground = document.querySelector(".playground > ul");

const GAME_ROWS = 20;
const GAME_COLS = 10;

let score = 0;
let duration =500;
let downInterval ;
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

const movingItem={
    type:"",
    direction: 0 ,
    top:0,
    left:3,                    
}

init();

function init(){
    tempMovingItem = {...movingItem} /*값만 가져옴 */
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
    const { type, direction, top, left} = tempMovingItem;
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove(type, "moving");
    })
    BLOCKS[type][direction].some(block =>{ //some 함수의 기능 추가 공부 필요
        const x = block[0]+left;
        const y = block[1]+top;
        const target = playground.childNodes[y]? playground.childNodes[y].childNodes[0].childNodes[x]: null;
        const isAvailable =  checkEmpty(target);
        if(isAvailable){
            target.classList.add(type,"moving");
        } else{
            tempMovingItem = {...movingItem}
            setTimeout(()=>{ // 왜 setTimeOut을 써야되는지 
                renderBlocks();
                if(moveType ==="top"){
                    seizeBlock()
                }
            },0)
            return true;
        }
            // 재귀 함수 사용시 call stack maximum
    });
    movingItem.left=left;
    movingItem.top = top;
    movingItem.direction=direction;
}    

function seizeBlock() {
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove("moving");
        moving.classList.add("seized"); 
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
    tempMovingItem[moveType]+=amount;
    renderBlocks(moveType)
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
document.addEventListener("keydown", e => {
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