jQuery(function(){
	jQuery('#pageLayoutList').find('li').bind('click',changePageLayout);
});

function changePageLayout(){
	var viewContainerNode =
	realThis.aZtree.getNodesByFilter(function(node){
		if( __assembledParentId == node.id ){
			return true;
		}else{
			return false;
		}
	})[0];
	
	var viewContainerEle = document.getElementById( __assembledParentId );
	var newframe = realThis.addChildFrame( viewContainerEle , viewContainerNode )[0];
	
	var viewNodeList = 
	realThis.aZtree.getNodesByFilter(function(node){
		if( node.type=='view' && node.level > 1){
			return true;
		}else{
			return false;
		}
	});
	
	var i;
	var eleNewf = document.getElementById(newframe.id);
	for(i in viewNodeList){
		var eleView = document.getElementById(viewNodeList[i].id) ;
		realThis.aZtree.moveNode( newframe , viewNodeList[i] , 'inner' );
		realThis.moveIn( eleView , eleNewf );
	}
}
