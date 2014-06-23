/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function deleteUi(list,listActive,arrayList,editor){
    sizeList = list.find("li").size();
    if(sizeList > 1){
        var id=listActive.attr("id");
        var text=listActive.text();
        var numId=parseInt(id)-1;
        $("li:has('a'):contains("+text+")").remove();
        arrayList.splice(numId,1)
        $('.summernote').eq(editor).code(arrayList[0]);
        sizeList = list.find("li").size();
        for(i=0;i<sizeList;i++){
            x=i+1;
            if (i == 0){
                list[0].children[i].outerHTML='<li class="active" id='+x+'><a href="#">Page '+x+'</a></li>';
            }
            else{
                list[0].children[i].outerHTML='<li class="" id='+x+'><a href="#">Page '+x+'</a></li>';
            }
        }
       
    }
}


function addNewElement(list,listActive,arrayList,editor){
    var Psize= list.find('li');
    listActive.removeClass('active')
    Psize = Psize.size()+1;
    list.append('<li class="active" id='+Psize+'><a href="#">Page '+Psize+'</a></li>');
    var Prevalue= $('.summernote').eq(editor).code();
    arrayList.push(Prevalue);
    $('.summernote').eq(editor).code("");
}
            
function changeElement(ids,listActive,arrayList,editor,allThis){
    var numids=parseInt(ids);
    var Prevalue= $('.summernote').eq(editor).code();
    var id=listActive.attr("id");
    var numId=parseInt(id);
    arrayList[numId-1]=Prevalue;
    listActive.removeClass('active')
    allThis.addClass('active');
    $('.summernote').eq(editor).code(arrayList[numids-1])    
}           
            
function checkTab(list,arrayList,editor){
    var Prevalue= $('.summernote').eq(editor).code();
    if(Prevalue.length > 11){
        var Psize= list.find('li');
        Psize = Psize.size();
        if(arrayList.length <  Psize){
            arrayList.push(Prevalue);
        }
    }
    if(editor == 1){
        $.cookie('preReqObject', arrayList,{ expires: 1, path: '/' });
    }
    else if(editor ==2){
        $.cookie('preReqHD', arrayList,{ expires: 1, path: '/' });
    }
} 



var create_Json = function createJson(pagesPreReq,pagesHDReq){
    var tabOne=$('.summernote').eq(0).code();
    var tabCode=four= $('.summernote').eq(3).code();
    var tabAdditional = $('.summernote').eq(4).code();
                
    Jfile = {
        "description": "Bone101 Tutorial",
        "public": true,
        "files": {
            "CARD_1_IN_1.html":{ "content": tabOne},
            //"CARD_AD_01.html":{ "content": tabAdditional},
            //"CARD_CD_01.html": {"content": tabCode}
                         //"CARD_HD_01.md": {"content": three},
                         //"CARD_PRE_01.md":{ "content": two},
                         //"CARD_IN_01.md": {"content": tabOne}
            }};
                //Jfile=JSON.stringify(Jfile);   
                //JfilePre = Jfile;
    obj={};            
    for(i=0;i<pagesPreReq.length;i++){
        name="CARD_2_PRE_"+(i+1)+".html";
        obj={"content": pagesPreReq[i]};
        Jfile["files"][name]=obj;
    }
    for(i=0;i<pagesHDReq.length;i++){
        name="CARD_3_HD_"+(i+1)+".html";
        obj={"content": pagesHDReq[i]};
        Jfile["files"][name]=obj;
    }
    obj={"content": tabCode};
    Jfile["files"]["CARD_4_CD_1.html"]=obj;
    
    obj={"content": tabAdditional};
    Jfile["files"]["CARD_5_AD_1.html"]=obj;
    
     //return JSON.stringify(Jfile);
    return Jfile;
}
