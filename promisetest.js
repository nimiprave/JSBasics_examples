var pr = new Promise((resolve,reject)=>{
 let a = 1
 if(a === 1){
     resolve();
 }else{
     reject("Error");
 }
});

pr.then(()=>{
    var st = 'Nirmal';
    console.log(`resolved by the promised: ${st}` );
}).catch(err => { console.log(err)});


// async and await

