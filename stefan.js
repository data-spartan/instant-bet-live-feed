//

const { RpcException } = require("@nestjs/microservices");
const { Console } = require("console");

const searchObj = { topic: 'desiredTopic', partition: 1, offset: 100, count: 5 };

const queryString = Object.keys(searchObj)
    .map((key) => `${searchObj[key]}`).join('-');

// console.log(queryString);

const exp = 'desiredTopic-2-80'
const pat1='desiredTopic-1-100'
const pat2='desiredTopic-2-80'
const arr=[{pattern:pat1,count:5},{pattern:pat2,count:7},{pattern:pat1,count:4}]

const found=arr.find((item)=> item.pattern==='desiredTopic-2-80'
)

function func(){
    let index
    const arr=[]
try{
    if(arr){
for(const [index_,item] of arr.entries()){
    console.log(index_)
    if(item['pattern']===exp){
        item.count +=1
        index=index_
        break
    }
}
}

}
catch(e){
    return {err:new RpcException('STEFAN'), idx:index}
}}

const a=func()
const ar=[]
console.log(arr.push(1)-1)
if(ar){
    console.log('HERE')
}



